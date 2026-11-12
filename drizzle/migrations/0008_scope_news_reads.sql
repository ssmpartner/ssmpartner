DROP POLICY IF EXISTS "Authenticated read likes" ON public.news_likes;
CREATE POLICY "Read likes of visible posts" ON public.news_likes FOR SELECT TO authenticated USING (public.can_view_news(post_id, auth.uid()));
DROP POLICY IF EXISTS "Authenticated read visibility agencies" ON public.news_visibility_agencies;
CREATE POLICY "Read visibility agencies of visible posts" ON public.news_visibility_agencies FOR SELECT TO authenticated USING (public.can_view_news(post_id, auth.uid()));
DROP POLICY IF EXISTS "Authenticated read visibility roles" ON public.news_visibility_roles;
CREATE POLICY "Read visibility roles of visible posts" ON public.news_visibility_roles FOR SELECT TO authenticated USING (public.can_view_news(post_id, auth.uid()));