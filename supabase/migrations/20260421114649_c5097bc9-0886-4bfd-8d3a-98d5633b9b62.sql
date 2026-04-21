ALTER TABLE public.team_members ADD COLUMN user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);