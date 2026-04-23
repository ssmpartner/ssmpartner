-- News: Ansprechperson
ALTER TABLE public.news_posts
  ADD COLUMN IF NOT EXISTS contact_person_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL;

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  cover_image_url text,
  category_id uuid REFERENCES public.news_categories(id) ON DELETE SET NULL,
  location text,
  location_url text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  registration_enabled boolean NOT NULL DEFAULT true,
  registration_deadline timestamptz,
  capacity integer,
  contact_person_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'all',
  published boolean NOT NULL DEFAULT false,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Trigger updated_at
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins manage events"
  ON public.events FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Authenticated read published events"
  ON public.events FOR SELECT TO authenticated
  USING (published = true OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Users insert own registration"
  ON public.event_registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own registration"
  ON public.event_registrations FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Users read own / Superadmin all registrations"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);