-- =====================================================================
-- Muscle library content-operations foundation (additive only)
-- =====================================================================

-- ---------- Enums -----------------------------------------------------
CREATE TYPE public.content_review_status AS ENUM (
  'draft',
  'needs_data_review',
  'needs_image_review',
  'needs_anatomy_review',
  'ready_to_publish',
  'published',
  'archived'
);

CREATE TYPE public.image_review_status AS ENUM (
  'pending',
  'approved',
  'replacement_requested',
  'missing'
);

CREATE TYPE public.import_batch_status AS ENUM (
  'draft',
  'previewed',
  'committed',
  'rolled_back',
  'failed'
);

CREATE TYPE public.import_row_outcome AS ENUM (
  'new',
  'updated',
  'unchanged',
  'conflict',
  'invalid'
);

-- ---------- Admin authorization --------------------------------------
-- Administrator status comes ONLY from the protected app_metadata claim.
-- user_metadata is user-editable and is deliberately never consulted.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- ---------- Shared triggers ------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------- import_batches -------------------------------------------
CREATE TABLE public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  created_by_email text,
  source_filename text,
  source_format text,
  status public.import_batch_status NOT NULL DEFAULT 'draft',
  allow_empty_overwrite boolean NOT NULL DEFAULT false,
  total_rows integer NOT NULL DEFAULT 0,
  new_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  unchanged_count integer NOT NULL DEFAULT 0,
  conflict_count integer NOT NULL DEFAULT 0,
  invalid_count integer NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  affected_muscle_ids text[] NOT NULL DEFAULT ARRAY[]::text[],
  committed_at timestamptz,
  rolled_back_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_batches TO authenticated;
GRANT ALL ON public.import_batches TO service_role;

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage import batches"
  ON public.import_batches FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER import_batches_updated_at
  BEFORE UPDATE ON public.import_batches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- muscles ---------------------------------------------------
CREATE TABLE public.muscles (
  id text PRIMARY KEY,
  external_id text,
  name text NOT NULL,
  slug text NOT NULL,
  anatomical_group text,
  muscle_family text,
  origin text,
  insertion text,
  functions text[] NOT NULL DEFAULT ARRAY[]::text[],
  description text,
  image_url text,
  image_alt text,
  image_credit text,
  image_source_url text,
  image_license text,
  image_hash text,
  crop_zoom numeric,
  crop_x numeric,
  crop_y numeric,
  source_name text,
  source_url text,
  body_map text,
  related_video_ids text,
  review_status public.content_review_status NOT NULL DEFAULT 'draft',
  image_status public.image_review_status NOT NULL DEFAULT 'pending',
  anatomy_approved_at timestamptz,
  image_approved_at timestamptz,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  last_import_batch_id uuid REFERENCES public.import_batches(id) ON DELETE SET NULL,
  last_imported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX muscles_slug_key ON public.muscles (slug);
CREATE UNIQUE INDEX muscles_external_id_key ON public.muscles (external_id) WHERE external_id IS NOT NULL;
CREATE INDEX muscles_published_idx ON public.muscles (published);
CREATE INDEX muscles_review_status_idx ON public.muscles (review_status);
CREATE INDEX muscles_image_status_idx ON public.muscles (image_status);
CREATE INDEX muscles_image_hash_idx ON public.muscles (image_hash) WHERE image_hash IS NOT NULL;
CREATE INDEX muscles_image_url_idx ON public.muscles (image_url) WHERE image_url IS NOT NULL;
CREATE INDEX muscles_group_idx ON public.muscles (anatomical_group);
CREATE INDEX muscles_batch_idx ON public.muscles (last_import_batch_id);

GRANT SELECT ON public.muscles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.muscles TO authenticated;
GRANT ALL ON public.muscles TO service_role;

ALTER TABLE public.muscles ENABLE ROW LEVEL SECURITY;

-- Public read is limited to published records.
CREATE POLICY "Published muscles are publicly readable"
  ON public.muscles FOR SELECT TO anon, authenticated
  USING (published = true);

-- Admins see everything, including drafts and archived records.
CREATE POLICY "Admins read all muscles"
  ON public.muscles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins insert muscles"
  ON public.muscles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins update muscles"
  ON public.muscles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete muscles"
  ON public.muscles FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------- muscle_revisions -----------------------------------------
CREATE TABLE public.muscle_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_id text NOT NULL,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  changed_by uuid,
  change_reason text,
  import_batch_id uuid REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX muscle_revisions_muscle_idx ON public.muscle_revisions (muscle_id, version DESC);
CREATE INDEX muscle_revisions_batch_idx ON public.muscle_revisions (import_batch_id);

GRANT SELECT, INSERT ON public.muscle_revisions TO authenticated;
GRANT ALL ON public.muscle_revisions TO service_role;

ALTER TABLE public.muscle_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage muscle revisions"
  ON public.muscle_revisions FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Snapshot the previous state and bump the version before every change.
CREATE OR REPLACE FUNCTION public.record_muscle_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_jsonb(OLD) - 'updated_at' - 'version' IS DISTINCT FROM to_jsonb(NEW) - 'updated_at' - 'version' THEN
    INSERT INTO public.muscle_revisions (muscle_id, version, snapshot, changed_by, import_batch_id)
    VALUES (OLD.id, OLD.version, to_jsonb(OLD), auth.uid(), NEW.last_import_batch_id);

    NEW.version = OLD.version + 1;
    NEW.updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER muscles_record_revision
  BEFORE UPDATE ON public.muscles
  FOR EACH ROW EXECUTE FUNCTION public.record_muscle_revision();

-- ---------- import_rows ----------------------------------------------
CREATE TABLE public.import_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  outcome public.import_row_outcome NOT NULL,
  matched_muscle_id text,
  matched_by text,
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  parsed_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  applied boolean NOT NULL DEFAULT false,
  previous_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX import_rows_batch_idx ON public.import_rows (batch_id, row_number);
CREATE INDEX import_rows_outcome_idx ON public.import_rows (batch_id, outcome);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.import_rows TO authenticated;
GRANT ALL ON public.import_rows TO service_role;

ALTER TABLE public.import_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage import rows"
  ON public.import_rows FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------- Publish safety -------------------------------------------
-- Publishing is only ever an explicit act: a record cannot be marked
-- published unless it carries the minimum data required to be public.
CREATE OR REPLACE FUNCTION public.enforce_publish_requirements()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.published THEN
    IF NEW.name IS NULL OR length(btrim(NEW.name)) = 0
       OR NEW.slug IS NULL OR length(btrim(NEW.slug)) = 0
       OR NEW.origin IS NULL OR length(btrim(NEW.origin)) = 0
       OR NEW.insertion IS NULL OR length(btrim(NEW.insertion)) = 0
       OR NEW.image_url IS NULL OR length(btrim(NEW.image_url)) = 0
       OR NEW.image_alt IS NULL OR length(btrim(NEW.image_alt)) = 0 THEN
      RAISE EXCEPTION 'Cannot publish muscle %: name, slug, origin, insertion, image URL and alt text are all required.', NEW.id;
    END IF;

    IF NEW.published_at IS NULL THEN
      NEW.published_at = now();
    END IF;
    NEW.review_status = 'published';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER muscles_enforce_publish
  BEFORE INSERT OR UPDATE ON public.muscles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_publish_requirements();

CREATE TRIGGER muscles_updated_at
  BEFORE UPDATE ON public.muscles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();