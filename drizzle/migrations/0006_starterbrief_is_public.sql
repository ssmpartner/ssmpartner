ALTER TABLE public.starterbrief_editions ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;
DO $$ DECLARE p record; BEGIN
FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='starterbrief_editions' AND 'anon' = ANY(roles) LOOP
EXECUTE format('DROP POLICY %I ON public.starterbrief_editions', p.policyname); END LOOP; END $$;
CREATE POLICY "Anon read public published starterbrief" ON public.starterbrief_editions FOR SELECT TO anon USING (is_published = true AND is_public = true);