CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'website',
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  agency_name text,
  recipient_name text,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert inquiries" ON public.inquiries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Authenticated users can read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (true);