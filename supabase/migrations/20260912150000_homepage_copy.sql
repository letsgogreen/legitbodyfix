CREATE TABLE IF NOT EXISTS public.site_copy (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_copy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site copy"
ON public.site_copy FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage site copy"
ON public.site_copy FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

GRANT SELECT ON public.site_copy TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_copy TO authenticated;
GRANT ALL ON public.site_copy TO service_role;
