-- Keep administrator authorization narrow even if another account still has
-- stale app_metadata.is_admin = true. user_metadata remains intentionally unused.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
    AND lower(COALESCE(auth.jwt() ->> 'email', '')) = 'thriveinside@protonmail.com';
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
