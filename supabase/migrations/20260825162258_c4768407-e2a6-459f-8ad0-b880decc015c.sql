CREATE TABLE public.guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  pattern_summary text,
  common_regions text[] NOT NULL DEFAULT ARRAY[]::text[],
  self_check text,
  watch_for text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  review_status content_review_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.guides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guides TO authenticated;
GRANT ALL ON public.guides TO service_role;

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published guides are publicly readable" ON public.guides FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read all guides" ON public.guides FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins insert guides" ON public.guides FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins update guides" ON public.guides FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins delete guides" ON public.guides FOR DELETE TO authenticated USING (is_admin());

CREATE TRIGGER guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_guide_publish_requirements()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.published THEN
    IF NEW.title IS NULL OR length(btrim(NEW.title)) = 0
       OR NEW.slug IS NULL OR length(btrim(NEW.slug)) = 0
       OR NEW.pattern_summary IS NULL OR length(btrim(NEW.pattern_summary)) = 0
       OR NEW.self_check IS NULL OR length(btrim(NEW.self_check)) = 0
       OR NEW.watch_for IS NULL OR length(btrim(NEW.watch_for)) = 0 THEN
      RAISE EXCEPTION 'Cannot publish guide %: title, slug, pattern summary, self-check and watch-for are all required.', NEW.slug;
    END IF;
    IF NEW.published_at IS NULL THEN NEW.published_at = now(); END IF;
    NEW.review_status = 'published';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER guides_enforce_publish BEFORE INSERT OR UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION enforce_guide_publish_requirements();

CREATE TABLE public.guide_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  position integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guide_id, recipe_id)
);
GRANT SELECT ON public.guide_recipes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_recipes TO authenticated;
GRANT ALL ON public.guide_recipes TO service_role;
ALTER TABLE public.guide_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Links between published guide items are public" ON public.guide_recipes FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM guides g WHERE g.id = guide_recipes.guide_id AND g.published)
   AND EXISTS (SELECT 1 FROM recipes r WHERE r.id = guide_recipes.recipe_id AND r.published));
CREATE POLICY "Admins manage guide recipes" ON public.guide_recipes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE TABLE public.guide_muscles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  muscle_id text NOT NULL REFERENCES public.muscles(id) ON DELETE CASCADE,
  role recipe_muscle_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guide_id, muscle_id)
);
GRANT SELECT ON public.guide_muscles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_muscles TO authenticated;
GRANT ALL ON public.guide_muscles TO service_role;
ALTER TABLE public.guide_muscles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Links between published guide muscles are public" ON public.guide_muscles FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM guides g WHERE g.id = guide_muscles.guide_id AND g.published)
   AND EXISTS (SELECT 1 FROM muscles m WHERE m.id = guide_muscles.muscle_id AND m.published));
CREATE POLICY "Admins manage guide muscles" ON public.guide_muscles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE TABLE public.guide_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  position integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guide_id, program_id)
);
GRANT SELECT ON public.guide_programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_programs TO authenticated;
GRANT ALL ON public.guide_programs TO service_role;
ALTER TABLE public.guide_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Program links of published guides are public" ON public.guide_programs FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM guides g WHERE g.id = guide_programs.guide_id AND g.published));
CREATE POLICY "Admins manage guide programs" ON public.guide_programs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());