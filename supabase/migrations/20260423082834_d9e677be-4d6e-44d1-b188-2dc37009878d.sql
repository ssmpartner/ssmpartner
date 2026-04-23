-- News Categories
CREATE TABLE public.news_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#243e3a',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read news categories" ON public.news_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmins manage news categories" ON public.news_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'superadmin')) WITH CHECK (has_role(auth.uid(), 'superadmin'));

-- News Posts
CREATE TABLE public.news_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL DEFAULT '',
  cover_image_url text,
  category_id uuid REFERENCES public.news_categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'all', -- 'all' | 'roles' | 'agencies' | 'mixed'
  is_important boolean NOT NULL DEFAULT false,
  is_urgent_banner boolean NOT NULL DEFAULT false,
  is_highlight boolean NOT NULL DEFAULT false,
  comments_enabled boolean NOT NULL DEFAULT true,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_news_posts_published ON public.news_posts(published, published_at DESC);

-- Helper function: can current user view a news post (based on visibility + role + agency)
CREATE OR REPLACE FUNCTION public.can_view_news(_post_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visibility text;
  v_published boolean;
  v_user_role app_role;
  v_user_agency uuid;
BEGIN
  SELECT visibility, published INTO v_visibility, v_published FROM public.news_posts WHERE id = _post_id;
  IF v_visibility IS NULL THEN RETURN false; END IF;
  IF NOT v_published AND NOT has_role(_user_id, 'superadmin') THEN RETURN false; END IF;
  IF has_role(_user_id, 'superadmin') THEN RETURN true; END IF;
  IF v_visibility = 'all' THEN RETURN true; END IF;

  SELECT role INTO v_user_role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
  SELECT agency_id INTO v_user_agency FROM public.team_members WHERE user_id = _user_id LIMIT 1;

  IF v_visibility IN ('roles','mixed') THEN
    IF EXISTS (SELECT 1 FROM public.news_visibility_roles WHERE post_id = _post_id AND role = v_user_role) THEN
      RETURN true;
    END IF;
  END IF;
  IF v_visibility IN ('agencies','mixed') THEN
    IF v_user_agency IS NOT NULL AND EXISTS (SELECT 1 FROM public.news_visibility_agencies WHERE post_id = _post_id AND agency_id = v_user_agency) THEN
      RETURN true;
    END IF;
  END IF;
  RETURN false;
END;
$$;

-- Visibility tables
CREATE TABLE public.news_visibility_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, role)
);
ALTER TABLE public.news_visibility_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read visibility roles" ON public.news_visibility_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmins manage visibility roles" ON public.news_visibility_roles FOR ALL TO authenticated USING (has_role(auth.uid(),'superadmin')) WITH CHECK (has_role(auth.uid(),'superadmin'));

CREATE TABLE public.news_visibility_agencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, agency_id)
);
ALTER TABLE public.news_visibility_agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read visibility agencies" ON public.news_visibility_agencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Superadmins manage visibility agencies" ON public.news_visibility_agencies FOR ALL TO authenticated USING (has_role(auth.uid(),'superadmin')) WITH CHECK (has_role(auth.uid(),'superadmin'));

-- News Posts policies (after helper exists)
CREATE POLICY "Users can view permitted news"
  ON public.news_posts FOR SELECT TO authenticated
  USING (public.can_view_news(id, auth.uid()));
CREATE POLICY "Superadmins manage news posts"
  ON public.news_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(),'superadmin'))
  WITH CHECK (has_role(auth.uid(),'superadmin'));

-- News Views (tracking)
CREATE TABLE public.news_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.news_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own views" ON public.news_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own views" ON public.news_views FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Superadmins read all views" ON public.news_views FOR SELECT TO authenticated USING (has_role(auth.uid(),'superadmin'));

-- News Acknowledgements (mandatory read confirmations)
CREATE TABLE public.news_acknowledgements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.news_acknowledgements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own ack" ON public.news_acknowledgements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own ack" ON public.news_acknowledgements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Superadmins read all ack" ON public.news_acknowledgements FOR SELECT TO authenticated USING (has_role(auth.uid(),'superadmin'));

-- News Comments
CREATE TABLE public.news_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read visible comments" ON public.news_comments FOR SELECT TO authenticated USING (NOT hidden OR has_role(auth.uid(),'superadmin') OR auth.uid() = user_id);
CREATE POLICY "Users insert own comments" ON public.news_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.can_view_news(post_id, auth.uid()));
CREATE POLICY "Users update own comments" ON public.news_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own / Superadmin all comments" ON public.news_comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(),'superadmin'));
CREATE POLICY "Superadmins moderate comments" ON public.news_comments FOR UPDATE TO authenticated USING (has_role(auth.uid(),'superadmin'));

-- News Likes
CREATE TABLE public.news_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.news_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read likes" ON public.news_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own likes" ON public.news_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own likes" ON public.news_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER trg_news_categories_updated BEFORE UPDATE ON public.news_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_news_posts_updated BEFORE UPDATE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_news_comments_updated BEFORE UPDATE ON public.news_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default categories
INSERT INTO public.news_categories (name, slug, color, sort_order) VALUES
  ('Allgemein', 'allgemein', '#243e3a', 0),
  ('Produkte', 'produkte', '#B3B69C', 1),
  ('Schulung', 'schulung', '#0ea5e9', 2),
  ('Events', 'events', '#f59e0b', 3),
  ('Wichtig', 'wichtig', '#dc2626', 4);