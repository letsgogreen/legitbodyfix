-- ============ enums ============
CREATE TYPE public.recipe_progression_level AS ENUM (
  'reset_tolerance','mobility','activation','control','integration','loaded_performance'
);
CREATE TYPE public.recipe_muscle_role AS ENUM ('tight','weak');
CREATE TYPE public.candidate_match_status AS ENUM ('unmatched','matched','possible_duplicate','merged','rejected');

-- ============ muscles: additive columns ============
ALTER TABLE public.muscles ADD COLUMN IF NOT EXISTS latin_name text;

CREATE TABLE public.muscle_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_id text NOT NULL REFERENCES public.muscles(id) ON DELETE CASCADE,
  alias text NOT NULL,
  alias_normalized text GENERATED ALWAYS AS (lower(btrim(alias))) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (muscle_id, alias)
);
GRANT SELECT ON public.muscle_aliases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.muscle_aliases TO authenticated;
GRANT ALL ON public.muscle_aliases TO service_role;
ALTER TABLE public.muscle_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aliases of published muscles are public" ON public.muscle_aliases
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.muscles m WHERE m.id = muscle_id AND m.published));
CREATE POLICY "Admins manage muscle aliases" ON public.muscle_aliases
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE INDEX muscle_aliases_normalized_idx ON public.muscle_aliases (alias_normalized);

-- ============ recipes ============
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notion_page_id text UNIQUE,
  notion_url text,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  goal text,
  summary text,
  instructions text,
  regions text[] NOT NULL DEFAULT ARRAY[]::text[],
  movement_functions text[] NOT NULL DEFAULT ARRAY[]::text[],
  symptoms_goals text[] NOT NULL DEFAULT ARRAY[]::text[],
  progression_level public.recipe_progression_level,
  dosage text,
  session_minutes integer,
  assessment_clues text,
  safety_notes text,
  evidence text,
  equipment text[] NOT NULL DEFAULT ARRAY[]::text[],
  image_url text,
  image_alt text,
  internal_notes text,
  notion_status text,
  review_status public.content_review_status NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  featured_rank integer,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  last_reviewed_at date,
  last_synced_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recipes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published recipes are publicly readable" ON public.recipes
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read all recipes" ON public.recipes
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins insert recipes" ON public.recipes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins update recipes" ON public.recipes
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete recipes" ON public.recipes
  FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX recipes_regions_idx ON public.recipes USING gin (regions);
CREATE INDEX recipes_published_idx ON public.recipes (published);

CREATE OR REPLACE FUNCTION public.enforce_recipe_publish_requirements()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.published THEN
    IF NEW.title IS NULL OR length(btrim(NEW.title)) = 0
       OR NEW.goal IS NULL OR length(btrim(NEW.goal)) = 0
       OR NEW.instructions IS NULL OR length(btrim(NEW.instructions)) = 0
       OR NEW.safety_notes IS NULL OR length(btrim(NEW.safety_notes)) = 0
       OR array_length(NEW.regions, 1) IS NULL THEN
      RAISE EXCEPTION 'Cannot publish recipe %: title, goal, instructions, safety notes and at least one region are required.', NEW.slug;
    END IF;
    IF NEW.published_at IS NULL THEN NEW.published_at = now(); END IF;
    NEW.review_status = 'published';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.enforce_recipe_publish_requirements() FROM anon, authenticated;
CREATE TRIGGER recipes_enforce_publish BEFORE INSERT OR UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.enforce_recipe_publish_requirements();
CREATE TRIGGER recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ recipe <-> muscle ============
CREATE TABLE public.recipe_muscles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  muscle_id text NOT NULL REFERENCES public.muscles(id) ON DELETE CASCADE,
  role public.recipe_muscle_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (recipe_id, muscle_id, role)
);
GRANT SELECT ON public.recipe_muscles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_muscles TO authenticated;
GRANT ALL ON public.recipe_muscles TO service_role;
ALTER TABLE public.recipe_muscles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Links between published items are public" ON public.recipe_muscles
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND r.published)
    AND EXISTS (SELECT 1 FROM public.muscles m WHERE m.id = muscle_id AND m.published)
  );
CREATE POLICY "Admins manage recipe muscles" ON public.recipe_muscles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ programs ============
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  outcome text,
  who_its_for text,
  format text,
  duration_label text,
  level text,
  regions text[] NOT NULL DEFAULT ARRAY[]::text[],
  goals text[] NOT NULL DEFAULT ARRAY[]::text[],
  stripe_product_id text,
  stripe_price_id text,
  stripe_price_lookup_key text,
  entitlement_key text UNIQUE,
  image_url text,
  image_alt text,
  featured boolean NOT NULL DEFAULT false,
  featured_rank integer,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published programs are publicly readable" ON public.programs
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read all programs" ON public.programs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins insert programs" ON public.programs
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins update programs" ON public.programs
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete programs" ON public.programs
  FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.program_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  position integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, recipe_id)
);
GRANT SELECT ON public.program_recipes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_recipes TO authenticated;
GRANT ALL ON public.program_recipes TO service_role;
ALTER TABLE public.program_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Links between published program items are public" ON public.program_recipes
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.programs p WHERE p.id = program_id AND p.published)
    AND EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_id AND r.published)
  );
CREATE POLICY "Admins manage program recipes" ON public.program_recipes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ muscle candidates (Notion intake staging) ============
CREATE TABLE public.muscle_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notion_page_id text UNIQUE NOT NULL,
  notion_url text,
  candidate_name text NOT NULL,
  group_hint text,
  ai_draft_functions text,
  ai_draft_origin_insertion text,
  ai_keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  raw_properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  match_status public.candidate_match_status NOT NULL DEFAULT 'unmatched',
  matched_muscle_id text REFERENCES public.muscles(id) ON DELETE SET NULL,
  matched_by text,
  match_score numeric,
  reviewer_notes text,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.muscle_candidates TO authenticated;
GRANT ALL ON public.muscle_candidates TO service_role;
ALTER TABLE public.muscle_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage muscle candidates" ON public.muscle_candidates
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER muscle_candidates_updated_at BEFORE UPDATE ON public.muscle_candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();