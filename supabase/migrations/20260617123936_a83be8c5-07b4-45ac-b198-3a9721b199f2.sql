
-- One-time backfill: for every SSO user that has an older non-SSO twin with same email, copy role/profile/team
DO $$
DECLARE
  r record;
  v_old_user uuid;
  v_old_display text;
  v_old_avatar text;
BEGIN
  FOR r IN
    SELECT u.id, u.email
    FROM auth.users u
    WHERE u.raw_app_meta_data->>'provider' LIKE 'sso%'
  LOOP
    SELECT u2.id INTO v_old_user
    FROM auth.users u2
    WHERE lower(u2.email) = lower(r.email)
      AND u2.id <> r.id
      AND COALESCE(u2.raw_app_meta_data->>'provider','email') NOT LIKE 'sso%'
    ORDER BY u2.created_at ASC
    LIMIT 1;

    IF v_old_user IS NULL THEN CONTINUE; END IF;

    SELECT display_name, avatar_url INTO v_old_display, v_old_avatar
    FROM public.profiles WHERE id = v_old_user;

    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (r.id, v_old_display, v_old_avatar)
    ON CONFLICT (id) DO UPDATE
      SET display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
          avatar_url   = COALESCE(EXCLUDED.avatar_url,   public.profiles.avatar_url);

    INSERT INTO public.user_roles (user_id, role)
    SELECT r.id, role FROM public.user_roles WHERE user_id = v_old_user
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE public.team_members SET user_id = r.id WHERE user_id = v_old_user;
  END LOOP;
END $$;
