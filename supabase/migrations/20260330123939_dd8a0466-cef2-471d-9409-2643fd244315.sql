
CREATE TABLE public.page_heroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  image_url text,
  alt_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_heroes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page heroes" ON public.page_heroes FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert page heroes" ON public.page_heroes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update page heroes" ON public.page_heroes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete page heroes" ON public.page_heroes FOR DELETE TO authenticated USING (true);

-- Seed default pages
INSERT INTO public.page_heroes (page_key, alt_text) VALUES
  ('about', 'Über uns'),
  ('career', 'Karriere'),
  ('contact', 'Kontakt'),
  ('team', 'Team');
