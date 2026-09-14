ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS region_code text;

COMMENT ON COLUMN public.page_views.country_code IS 'Coarse ISO country code supplied by the hosting edge. No IP address is stored.';
COMMENT ON COLUMN public.page_views.region_code IS 'Coarse first-level region code supplied by the hosting edge. No city or precise location is stored.';