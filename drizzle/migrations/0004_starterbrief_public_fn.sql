CREATE OR REPLACE FUNCTION public.is_published_starterbrief(_name text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$ SELECT EXISTS (SELECT 1 FROM public.starterbrief_editions WHERE is_published AND pdf_url = _name) $$;
GRANT EXECUTE ON FUNCTION public.is_published_starterbrief(text) TO anon, authenticated;
DROP POLICY "Public reads published starterbrief file" ON storage.objects;
CREATE POLICY "Public reads published starterbrief file" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'starterbrief' AND public.is_published_starterbrief(name));