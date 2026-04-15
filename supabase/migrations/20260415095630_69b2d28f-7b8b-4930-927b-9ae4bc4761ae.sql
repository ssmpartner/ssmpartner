
-- One-time redirect tokens for SSO flow
CREATE TABLE public.sso_redirect_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  project_key text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS: no direct client access, only via service role in edge functions
ALTER TABLE public.sso_redirect_tokens ENABLE ROW LEVEL SECURITY;

-- Index for fast token lookup
CREATE INDEX idx_sso_redirect_tokens_token ON public.sso_redirect_tokens (token);

-- Auto-cleanup: delete expired tokens (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sso_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.sso_redirect_tokens WHERE expires_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_sso_tokens_on_insert
AFTER INSERT ON public.sso_redirect_tokens
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_sso_tokens();
