CREATE TABLE public.starterbrief_editions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  pdf_url text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.starterbrief_editions TO authenticated;
GRANT ALL ON public.starterbrief_editions TO service_role;
ALTER TABLE public.starterbrief_editions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Portal users read editions" ON public.starterbrief_editions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert editions" ON public.starterbrief_editions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update editions" ON public.starterbrief_editions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete editions" ON public.starterbrief_editions FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX starterbrief_one_published ON public.starterbrief_editions ((true)) WHERE is_published;

CREATE OR REPLACE FUNCTION public.starterbrief_single_published()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.is_published THEN
    UPDATE public.starterbrief_editions SET is_published = false WHERE id <> NEW.id AND is_published;
    IF NEW.published_at IS NULL OR (TG_OP = 'UPDATE' AND NOT OLD.is_published) THEN NEW.published_at := now(); END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_starterbrief_single BEFORE INSERT OR UPDATE ON public.starterbrief_editions FOR EACH ROW EXECUTE FUNCTION public.starterbrief_single_published();
CREATE TRIGGER trg_archive_delete BEFORE DELETE ON public.starterbrief_editions FOR EACH ROW EXECUTE FUNCTION public.archive_deleted_row();

CREATE POLICY "Auth read starterbrief files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'starterbrief');
CREATE POLICY "Admins upload starterbrief files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'starterbrief' AND (public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "Admins delete starterbrief files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'starterbrief' AND (public.has_role(auth.uid(),'superadmin') OR public.has_role(auth.uid(),'admin')));