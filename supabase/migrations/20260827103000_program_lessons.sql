-- Real program curriculum management. Media stays private until entitlement-aware
-- delivery is added; only administrators can read or mutate these records for now.

CREATE TABLE public.program_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, position)
);

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.program_modules(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL,
  summary text,
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  video_path text,
  thumbnail_url text,
  position integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  preview_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, slug),
  UNIQUE (program_id, position)
);

CREATE INDEX program_modules_program_position_idx ON public.program_modules (program_id, position);
CREATE INDEX lessons_program_position_idx ON public.lessons (program_id, position);
CREATE INDEX lessons_module_position_idx ON public.lessons (module_id, position);

CREATE TRIGGER program_modules_updated_at BEFORE UPDATE ON public.program_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_modules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.program_modules TO service_role;
GRANT ALL ON public.lessons TO service_role;

ALTER TABLE public.program_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage program modules" ON public.program_modules
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage lessons" ON public.lessons
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-videos',
  'lesson-videos',
  false,
  2147483648,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Admins read lesson videos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'lesson-videos' AND public.is_admin());
CREATE POLICY "Admins upload lesson videos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-videos' AND public.is_admin());
CREATE POLICY "Admins update lesson videos" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'lesson-videos' AND public.is_admin())
  WITH CHECK (bucket_id = 'lesson-videos' AND public.is_admin());
CREATE POLICY "Admins delete lesson videos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'lesson-videos' AND public.is_admin());
