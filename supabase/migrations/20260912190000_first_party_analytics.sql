CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL CHECK (char_length(session_id) BETWEEN 8 AND 80),
  path text NOT NULL CHECK (char_length(path) BETWEEN 1 AND 500),
  referrer_host text CHECK (referrer_host IS NULL OR char_length(referrer_host) <= 255),
  utm_source text CHECK (utm_source IS NULL OR char_length(utm_source) <= 120),
  utm_medium text CHECK (utm_medium IS NULL OR char_length(utm_medium) <= 120),
  utm_campaign text CHECK (utm_campaign IS NULL OR char_length(utm_campaign) <= 180),
  device_type text NOT NULL DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'tablet', 'mobile'))
);

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_session_id_idx ON public.page_views (session_id);
CREATE INDEX IF NOT EXISTS page_views_path_idx ON public.page_views (path);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors record page views"
ON public.page_views FOR INSERT TO anon, authenticated
WITH CHECK (path NOT LIKE '/admin%');

CREATE POLICY "Admins read page views"
ON public.page_views FOR SELECT TO authenticated
USING (public.is_admin());

GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;

COMMENT ON TABLE public.page_views IS 'Privacy-conscious first-party traffic events. No IP address, personal identifier, or full referrer URL is stored.';
