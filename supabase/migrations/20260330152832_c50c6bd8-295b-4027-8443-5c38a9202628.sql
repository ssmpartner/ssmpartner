
-- Agencies table for Agenturen page
CREATE TABLE public.agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  email TEXT,
  description_de TEXT,
  description_fr TEXT,
  description_it TEXT,
  description_en TEXT,
  image_url TEXT,
  map_lat DOUBLE PRECISION,
  map_lng DOUBLE PRECISION,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read agencies" ON public.agencies FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert agencies" ON public.agencies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update agencies" ON public.agencies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete agencies" ON public.agencies FOR DELETE TO authenticated USING (true);

-- Seed the 7 agencies
INSERT INTO public.agencies (name, slug, sort_order) VALUES
  ('Urtenen-Schönbühl', 'urtenen-schoenbuehl', 0),
  ('Regensdorf', 'regensdorf', 1),
  ('Rothenburg', 'rothenburg', 2),
  ('Olten', 'olten', 3),
  ('Lugano', 'lugano', 4),
  ('Spreitenbach', 'spreitenbach', 5),
  ('Adliswil', 'adliswil', 6);
