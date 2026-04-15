
-- SSO Projects registry
CREATE TABLE public.sso_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  api_url TEXT,
  api_secret TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sso_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can read sso_projects" ON public.sso_projects
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmins can manage sso_projects" ON public.sso_projects
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- Per-user project access
CREATE TABLE public.project_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.sso_projects(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);
ALTER TABLE public.project_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own access" ON public.project_access
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Superadmins can read all access" ON public.project_access
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmins can manage access" ON public.project_access
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

-- Audit log
CREATE TABLE public.auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  project_key TEXT,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can read audit logs" ON public.auth_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

-- Seed SSM projects
INSERT INTO public.sso_projects (project_key, name) VALUES
  ('ssm-partner', 'SSM Partner Website'),
  ('ssm-recruit', 'SSM Recruit');

-- Grant all existing users access to ssm-partner
INSERT INTO public.project_access (user_id, project_id)
SELECT u.id, p.id FROM auth.users u CROSS JOIN public.sso_projects p
WHERE p.project_key = 'ssm-partner'
ON CONFLICT DO NOTHING;

-- Grant existing users access to ssm-recruit
INSERT INTO public.project_access (user_id, project_id)
SELECT u.id, p.id FROM auth.users u CROSS JOIN public.sso_projects p
WHERE p.project_key = 'ssm-recruit'
ON CONFLICT DO NOTHING;
