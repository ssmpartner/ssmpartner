CREATE TABLE public.deleted_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid,
  label text,
  data jsonb NOT NULL,
  deleted_by uuid,
  deleted_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.deleted_records TO authenticated;
GRANT ALL ON public.deleted_records TO service_role;
ALTER TABLE public.deleted_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmins view trash" ON public.deleted_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'superadmin'));
CREATE POLICY "Superadmins purge trash" ON public.deleted_records FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'superadmin'));

CREATE OR REPLACE FUNCTION public.archive_deleted_row()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE j jsonb := to_jsonb(OLD);
BEGIN
  INSERT INTO public.deleted_records(table_name, record_id, label, data, deleted_by)
  VALUES (TG_TABLE_NAME, (j->>'id')::uuid,
    COALESCE(j->>'name', j->>'title', j->>'question', j->>'company', j->>'label_de', j->>'label', j->>'description', j->>'author_name', j->>'page_key', j->>'headline', j->>'id'),
    j, auth.uid());
  RETURN OLD;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['team_members','agencies','agency_members','agency_reviews','news_posts','news_categories','events','career_faqs','career_videos','job_positions','slider_images','vag45_downloads','vag45_partners','chatbot_knowledge','nav_items','inquiries','page_heroes','wizard_pricing','seo_settings','site_content']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_archive_delete ON public.%I', t);
    EXECUTE format('CREATE TRIGGER trg_archive_delete BEFORE DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.archive_deleted_row()', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.restore_deleted_record(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.deleted_records;
BEGIN
  IF NOT public.has_role(auth.uid(),'superadmin') THEN RAISE EXCEPTION 'Nur Superadmins'; END IF;
  SELECT * INTO r FROM public.deleted_records WHERE id = _id;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Eintrag nicht gefunden'; END IF;
  EXECUTE format('INSERT INTO public.%I SELECT * FROM jsonb_populate_record(NULL::public.%I, $1)', r.table_name, r.table_name) USING r.data;
  DELETE FROM public.deleted_records WHERE id = _id;
END $$;
REVOKE ALL ON FUNCTION public.restore_deleted_record(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.restore_deleted_record(uuid) TO authenticated;