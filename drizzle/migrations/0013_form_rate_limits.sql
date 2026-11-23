CREATE TABLE public.form_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.form_rate_limits TO service_role;
ALTER TABLE public.form_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX form_rate_limits_ip_time ON public.form_rate_limits(ip, created_at);