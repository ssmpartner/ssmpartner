DROP POLICY IF EXISTS "Portal users read editions" ON public.starterbrief_editions;
CREATE POLICY "Portal users read editions" ON public.starterbrief_editions FOR SELECT TO authenticated
USING (public.is_cms_editor(auth.uid()) OR (public.get_user_role(auth.uid()) IS NOT NULL AND (is_published OR published_at IS NOT NULL)));
DROP POLICY IF EXISTS "Auth read starterbrief files" ON storage.objects;
CREATE POLICY "Auth read starterbrief files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'starterbrief' AND public.get_user_role(auth.uid()) IS NOT NULL);