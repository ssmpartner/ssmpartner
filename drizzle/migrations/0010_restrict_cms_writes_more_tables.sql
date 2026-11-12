DO $$
DECLARE p record; t text;
  tbls text[] := ARRAY['vag45_downloads','job_positions','career_videos','wizard_pricing','career_faqs','agency_reviews','chatbot_knowledge','slider_images'];
BEGIN
  FOR p IN SELECT tablename, policyname FROM pg_policies
    WHERE schemaname='public' AND tablename = ANY(tbls) AND cmd <> 'SELECT'
      AND 'authenticated' = ANY(roles)
      AND coalesce(qual,'true')='true' AND coalesce(with_check,'true')='true'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('CREATE POLICY "CMS editors insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.is_cms_editor(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "CMS editors update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_cms_editor(auth.uid())) WITH CHECK (public.is_cms_editor(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "CMS editors delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_cms_editor(auth.uid()))', t);
  END LOOP;
END $$;
DROP POLICY IF EXISTS "Authenticated users can upload site images" ON storage.objects;
CREATE POLICY "CMS editors upload site images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.is_cms_editor(auth.uid()));