CREATE TABLE public.org_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_published boolean NOT NULL DEFAULT false,
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_charts TO authenticated;
GRANT ALL ON public.org_charts TO service_role;
ALTER TABLE public.org_charts ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX org_charts_one_published ON public.org_charts ((true)) WHERE is_published;
CREATE POLICY "org read" ON public.org_charts FOR SELECT TO authenticated
  USING (public.is_cms_editor(auth.uid()) OR (is_published AND public.get_user_role(auth.uid()) IS NOT NULL));
CREATE POLICY "org insert" ON public.org_charts FOR INSERT TO authenticated WITH CHECK (public.is_cms_editor(auth.uid()));
CREATE POLICY "org update" ON public.org_charts FOR UPDATE TO authenticated USING (public.is_cms_editor(auth.uid())) WITH CHECK (public.is_cms_editor(auth.uid()));
CREATE POLICY "org delete" ON public.org_charts FOR DELETE TO authenticated USING (public.is_cms_editor(auth.uid()));
CREATE TRIGGER trg_archive_delete BEFORE DELETE ON public.org_charts FOR EACH ROW EXECUTE FUNCTION public.archive_deleted_row();