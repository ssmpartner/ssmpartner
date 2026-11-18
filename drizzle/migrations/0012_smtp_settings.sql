CREATE TABLE public.smtp_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  host text NOT NULL DEFAULT '',
  port int NOT NULL DEFAULT 465,
  secure boolean NOT NULL DEFAULT true,
  username text NOT NULL DEFAULT '',
  password text NOT NULL DEFAULT '',
  from_email text NOT NULL DEFAULT '',
  from_name text NOT NULL DEFAULT 'SSM Partner AG',
  notify_email text NOT NULL DEFAULT 'marketing@ssmpartner.ch',
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.smtp_settings TO service_role;
ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;