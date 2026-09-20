-- The analytics route writes with the server key. The original migration only
-- granted INSERT to browser roles, so service-key requests returned 503. Add
-- the coarse location columns used by the route and grant the server role the
-- least privileges it needs for collection and reporting.

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS region_code text;

GRANT INSERT, SELECT ON public.page_views TO service_role;

COMMENT ON COLUMN public.page_views.country_code IS
  'Coarse ISO country code supplied by the hosting edge. No IP address is stored.';
COMMENT ON COLUMN public.page_views.region_code IS
  'Coarse first-level region code supplied by the hosting edge. No city or precise location is stored.';

