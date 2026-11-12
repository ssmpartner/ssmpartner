CREATE OR REPLACE FUNCTION public.is_cms_editor(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('superadmin','admin','backoffice','geschaeftsleitung','hr','agency_manager'))
$$;

DO $$
DECLARE p record; t text;
  tbls text[] := ARRAY['vag45_partners','team_members','agency_members','seo_settings','agencies','nav_items','chat_messages','site_content','page_heroes','inquiries','chat_sessions'];
BEGIN
  FOR p IN SELECT tablename, policyname FROM pg_policies
    WHERE schemaname='public' AND tablename = ANY(tbls)
      AND 'authenticated' = ANY(roles)
      AND (coalesce(qual,'true')='true' AND coalesce(with_check,'true')='true')
      AND NOT (cmd='SELECT' AND tablename IN ('vag45_partners','team_members','agency_members','seo_settings','agencies','nav_items','site_content','page_heroes'))
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
  FOREACH t IN ARRAY tbls LOOP
    IF t IN ('chat_messages','chat_sessions','inquiries') THEN
      EXECUTE format('CREATE POLICY "CMS editors read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.is_cms_editor(auth.uid()))', t);
      EXECUTE format('CREATE POLICY "CMS editors delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_cms_editor(auth.uid()))', t);
      IF t = 'inquiries' THEN
        EXECUTE format('CREATE POLICY "CMS editors update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_cms_editor(auth.uid())) WITH CHECK (public.is_cms_editor(auth.uid()))', t);
      END IF;
    ELSE
      EXECUTE format('CREATE POLICY "CMS editors insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.is_cms_editor(auth.uid()))', t);
      EXECUTE format('CREATE POLICY "CMS editors update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_cms_editor(auth.uid())) WITH CHECK (public.is_cms_editor(auth.uid()))', t);
      EXECUTE format('CREATE POLICY "CMS editors delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_cms_editor(auth.uid()))', t);
    END IF;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Authenticated users can delete site images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update site images" ON storage.objects;
CREATE POLICY "CMS editors delete site images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images' AND public.is_cms_editor(auth.uid()));
CREATE POLICY "CMS editors update site images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images' AND public.is_cms_editor(auth.uid())) WITH CHECK (bucket_id = 'site-images' AND public.is_cms_editor(auth.uid()));