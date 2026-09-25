ALTER TABLE public.page_views
ADD COLUMN IF NOT EXISTS visitor_id uuid,
ADD COLUMN IF NOT EXISTS city text CHECK (city IS NULL OR char_length(city) <= 120),
ADD COLUMN IF NOT EXISTS network_hash text CHECK (network_hash IS NULL OR char_length(network_hash) = 20);

CREATE INDEX IF NOT EXISTS page_views_visitor_id_idx
ON public.page_views (visitor_id)
WHERE visitor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS page_views_network_hash_idx
ON public.page_views (network_hash)
WHERE network_hash IS NOT NULL;

COMMENT ON COLUMN public.page_views.visitor_id IS
  'Random first-party browser identifier used to group repeat visits. It is not linked to a customer account or direct personal information.';
COMMENT ON COLUMN public.page_views.city IS
  'Approximate city inferred by the hosting edge from the public IP address.';
COMMENT ON COLUMN public.page_views.network_hash IS
  'Truncated keyed hash of the public IP address for recognizing repeat networks without storing the raw address.';
