
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_de text NOT NULL,
  label_fr text,
  label_it text,
  label_en text,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read nav items" ON public.nav_items FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert nav items" ON public.nav_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update nav items" ON public.nav_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete nav items" ON public.nav_items FOR DELETE TO authenticated USING (true);

-- Seed default nav items
INSERT INTO public.nav_items (label_de, label_fr, label_it, label_en, url, sort_order) VALUES
  ('Home', 'Accueil', 'Home', 'Home', '/', 0),
  ('Über uns', 'À propos', 'Chi siamo', 'About', '/ueber-uns', 1),
  ('Team', 'Équipe', 'Team', 'Team', '/team', 2),
  ('Karriere', 'Carrière', 'Carriera', 'Careers', '/karriere', 3),
  ('VAG45', 'LSA45', 'LSA45', 'ISA45', '/kontakt', 4);

-- Add headline/subline columns to slider_images for hero text
ALTER TABLE public.slider_images ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE public.slider_images ADD COLUMN IF NOT EXISTS subline text;
