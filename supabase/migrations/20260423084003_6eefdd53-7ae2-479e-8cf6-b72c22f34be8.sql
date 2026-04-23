ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS cover_video_url text;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS media_urls text[] NOT NULL DEFAULT '{}'::text[];