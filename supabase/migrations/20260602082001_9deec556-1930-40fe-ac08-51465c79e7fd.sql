
CREATE TABLE public.seo_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT '',
  title text,
  description text,
  og_image text,
  noindex boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.seo_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.seo_settings TO authenticated;
GRANT ALL ON public.seo_settings TO service_role;

ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read seo settings"
  ON public.seo_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage seo settings"
  ON public.seo_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
