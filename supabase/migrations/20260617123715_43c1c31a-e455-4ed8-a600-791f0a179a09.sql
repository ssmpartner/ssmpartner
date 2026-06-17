
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_old_user_id uuid;
  v_old_display text;
  v_old_avatar text;
BEGIN
  -- Try to find an existing (older) user with the same email
  SELECT u.id INTO v_old_user_id
  FROM auth.users u
  WHERE lower(u.email) = lower(NEW.email)
    AND u.id <> NEW.id
  ORDER BY u.created_at ASC
  LIMIT 1;

  IF v_old_user_id IS NOT NULL THEN
    -- Copy profile fields from old account
    SELECT display_name, avatar_url INTO v_old_display, v_old_avatar
    FROM public.profiles WHERE id = v_old_user_id;

    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
      NEW.id,
      COALESCE(v_old_display, NEW.raw_user_meta_data->>'display_name', NEW.email),
      v_old_avatar
    )
    ON CONFLICT (id) DO NOTHING;

    -- Copy role(s)
    INSERT INTO public.user_roles (user_id, role)
    SELECT NEW.id, role FROM public.user_roles WHERE user_id = v_old_user_id
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Re-link team membership to the new SSO user
    UPDATE public.team_members SET user_id = NEW.id WHERE user_id = v_old_user_id;
  ELSE
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email))
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists (Supabase default name)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
