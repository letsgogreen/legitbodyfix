-- Additive: existing legacy content is not bulk imported or modified.
CREATE TABLE public.condition_publications (
  slug text PRIMARY KEY,
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.condition_drafts (
  slug text PRIMARY KEY,
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.condition_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condition_drafts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.condition_drafts FROM anon;
GRANT SELECT ON public.condition_publications TO anon, authenticated;
GRANT SELECT ON public.condition_drafts TO authenticated;
-- Withdrawn rows are public tombstones, without private draft content.
CREATE POLICY condition_public_read ON public.condition_publications FOR SELECT USING (true);
CREATE POLICY condition_admin_read ON public.condition_drafts FOR SELECT TO authenticated USING (public.is_admin());
REVOKE INSERT, UPDATE, DELETE ON public.condition_publications, public.condition_drafts FROM anon, authenticated;

CREATE FUNCTION public.save_condition(p_slug text, p_data jsonb, p_version integer, p_action text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_version integer;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator access required'; END IF;
  IF p_slug IS NULL OR p_data IS NULL OR p_version IS NULL OR p_version < 0 OR p_action IS NULL
    OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR length(p_slug) > 180
    OR jsonb_typeof(p_data) <> 'object' OR p_data->>'id' IS DISTINCT FROM p_slug
    OR p_action NOT IN ('draft', 'publish', 'unpublish') THEN
    RAISE EXCEPTION 'Invalid condition';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('condition:' || p_slug, 0));
  SELECT version INTO current_version FROM public.condition_drafts WHERE slug = p_slug;
  IF COALESCE(current_version, 0) <> p_version THEN
    RAISE EXCEPTION 'This condition changed in another session. Reload before saving.';
  END IF;
  IF p_action = 'publish' AND (
    COALESCE(trim(p_data->>'title'), '') = '' OR COALESCE(trim(p_data->>'summary'), '') = ''
    OR COALESCE(trim(p_data->>'screening'), '') = '' OR COALESCE(trim(p_data->>'bodyRegion'), '') = ''
    OR COALESCE(trim(p_data->>'conditionCategory'), '') = ''
  ) THEN RAISE EXCEPTION 'Complete title, summary, screening, region and category before publishing'; END IF;
  INSERT INTO public.condition_drafts(slug, data, version) VALUES(p_slug, p_data, p_version + 1)
    ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data, version = EXCLUDED.version, updated_at = now();
  IF p_action = 'publish' THEN
    INSERT INTO public.condition_publications(slug, data, published) VALUES(p_slug, p_data, true)
      ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data, published = true, updated_at = now();
  ELSIF p_action = 'unpublish' THEN
    INSERT INTO public.condition_publications(slug, data, published) VALUES(p_slug, '{}'::jsonb, false)
      ON CONFLICT (slug) DO UPDATE SET data = '{}'::jsonb, published = false, updated_at = now();
  END IF;
  RETURN p_version + 1;
END $$;
REVOKE ALL ON FUNCTION public.save_condition(text, jsonb, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_condition(text, jsonb, integer, text) TO authenticated;
