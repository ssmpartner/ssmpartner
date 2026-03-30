CREATE TABLE public.career_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL DEFAULT '',
  answer text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.career_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read career faqs" ON public.career_faqs FOR SELECT TO public USING (true);
CREATE POLICY "Auth users can insert career faqs" ON public.career_faqs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update career faqs" ON public.career_faqs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete career faqs" ON public.career_faqs FOR DELETE TO authenticated USING (true);