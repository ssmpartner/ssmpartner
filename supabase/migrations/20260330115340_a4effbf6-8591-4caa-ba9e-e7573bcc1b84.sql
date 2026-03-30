-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Site content table for all text content across pages
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  section_key TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'de',
  title TEXT,
  body TEXT,
  link_text TEXT,
  link_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page, section_key, lang)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update site content" ON public.site_content FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete site content" ON public.site_content FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Slider images table
CREATE TABLE public.slider_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.slider_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read slider images" ON public.slider_images FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert slider images" ON public.slider_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update slider images" ON public.slider_images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete slider images" ON public.slider_images FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_slider_images_updated_at BEFORE UPDATE ON public.slider_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role_de TEXT,
  role_fr TEXT,
  role_it TEXT,
  role_en TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert team members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update team members" ON public.team_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete team members" ON public.team_members FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Job positions table
CREATE TABLE public.job_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT,
  workload TEXT,
  description_de TEXT,
  description_fr TEXT,
  description_it TEXT,
  description_en TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read job positions" ON public.job_positions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert job positions" ON public.job_positions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update job positions" ON public.job_positions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete job positions" ON public.job_positions FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_job_positions_updated_at BEFORE UPDATE ON public.job_positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for site images
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true);
CREATE POLICY "Anyone can view site images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "Authenticated users can upload site images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images');
CREATE POLICY "Authenticated users can update site images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images');
CREATE POLICY "Authenticated users can delete site images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images');