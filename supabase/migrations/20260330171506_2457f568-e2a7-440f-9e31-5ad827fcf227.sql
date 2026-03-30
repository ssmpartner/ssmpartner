
CREATE TABLE public.career_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  image_url text,
  video_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.career_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read career videos" ON public.career_videos FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert career videos" ON public.career_videos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update career videos" ON public.career_videos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete career videos" ON public.career_videos FOR DELETE TO authenticated USING (true);
