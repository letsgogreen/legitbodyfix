-- is_admin() only reads the caller's own JWT claim; it never needs elevated rights.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      COALESCE(
        current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata',
        '{}'::jsonb
      ) ->> 'is_admin'
    )::boolean,
    false
  );
$$;

-- The revision trigger function must never be callable directly through the API.
REVOKE ALL ON FUNCTION public.record_muscle_revision() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_publish_requirements() FROM PUBLIC, anon, authenticated;