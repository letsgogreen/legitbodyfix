CREATE TABLE IF NOT EXISTS public.recipe_drafts (
  recipe_id uuid PRIMARY KEY REFERENCES public.recipes(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid DEFAULT auth.uid(),
  CONSTRAINT recipe_drafts_data_object CHECK (jsonb_typeof(data) = 'object')
);

ALTER TABLE public.recipe_drafts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.recipe_drafts FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_drafts TO authenticated;
GRANT ALL ON public.recipe_drafts TO service_role;

DROP POLICY IF EXISTS "Admins read recipe drafts" ON public.recipe_drafts;
DROP POLICY IF EXISTS "Admins insert recipe drafts" ON public.recipe_drafts;
DROP POLICY IF EXISTS "Admins update recipe drafts" ON public.recipe_drafts;
DROP POLICY IF EXISTS "Admins delete recipe drafts" ON public.recipe_drafts;

CREATE POLICY "Admins read recipe drafts" ON public.recipe_drafts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins insert recipe drafts" ON public.recipe_drafts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins update recipe drafts" ON public.recipe_drafts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete recipe drafts" ON public.recipe_drafts FOR DELETE TO authenticated USING (public.is_admin());

COMMENT ON TABLE public.recipe_drafts IS
  'Admin-only unpublished working copies. Public readers cannot access this table.';
