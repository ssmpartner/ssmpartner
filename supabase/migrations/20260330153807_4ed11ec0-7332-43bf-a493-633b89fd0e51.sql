
-- Extend agencies with more profile fields
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS leader_name TEXT,
  ADD COLUMN IF NOT EXISTS leader_role TEXT,
  ADD COLUMN IF NOT EXISTS leader_image_url TEXT,
  ADD COLUMN IF NOT EXISTS opening_hours TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

-- Agency team members (separate from main company team)
CREATE TABLE public.agency_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read agency members" ON public.agency_members FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert agency members" ON public.agency_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update agency members" ON public.agency_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete agency members" ON public.agency_members FOR DELETE TO authenticated USING (true);

-- Agency reviews / testimonials
CREATE TABLE public.agency_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agency_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read agency reviews" ON public.agency_reviews FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert agency reviews" ON public.agency_reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update agency reviews" ON public.agency_reviews FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete agency reviews" ON public.agency_reviews FOR DELETE TO authenticated USING (true);

-- Set coordinates for the 7 seeded agencies
UPDATE public.agencies SET map_lat = 47.0096, map_lng = 7.5686 WHERE slug = 'urtenen-schoenbuehl';
UPDATE public.agencies SET map_lat = 47.4332, map_lng = 8.4683 WHERE slug = 'regensdorf';
UPDATE public.agencies SET map_lat = 47.0967, map_lng = 8.2747 WHERE slug = 'rothenburg';
UPDATE public.agencies SET map_lat = 47.3521, map_lng = 7.9072 WHERE slug = 'olten';
UPDATE public.agencies SET map_lat = 46.0037, map_lng = 8.9511 WHERE slug = 'lugano';
UPDATE public.agencies SET map_lat = 47.4205, map_lng = 8.3636 WHERE slug = 'spreitenbach';
UPDATE public.agencies SET map_lat = 47.3108, map_lng = 8.5242 WHERE slug = 'adliswil';
