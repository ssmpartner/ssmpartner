
CREATE TABLE public.gsc_monitor_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'success',
  duration_ms int,
  sitemap_status jsonb,
  performance jsonb,
  url_inspections jsonb,
  issues_found int NOT NULL DEFAULT 0,
  error_message text
);
GRANT SELECT ON public.gsc_monitor_runs TO authenticated;
GRANT ALL ON public.gsc_monitor_runs TO service_role;
ALTER TABLE public.gsc_monitor_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "superadmin read runs" ON public.gsc_monitor_runs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

CREATE TABLE public.gsc_monitor_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  source text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  url text,
  issue_code text,
  message text NOT NULL,
  details jsonb,
  fingerprint text NOT NULL UNIQUE,
  acknowledged boolean NOT NULL DEFAULT false
);
GRANT SELECT, UPDATE ON public.gsc_monitor_issues TO authenticated;
GRANT ALL ON public.gsc_monitor_issues TO service_role;
ALTER TABLE public.gsc_monitor_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "superadmin read issues" ON public.gsc_monitor_issues
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "superadmin update issues" ON public.gsc_monitor_issues
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'superadmin'));

CREATE INDEX idx_gsc_issues_open ON public.gsc_monitor_issues (resolved_at, severity);
CREATE INDEX idx_gsc_runs_ran_at ON public.gsc_monitor_runs (ran_at DESC);
