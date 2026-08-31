INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'program-images',
    'program-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  ),
  (
    'lesson-images',
    'lesson-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  ),
  (
    'muscle-images',
    'muscle-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  ),
  (
    'region-images',
    'region-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
WHERE id IN ('content-images', 'recipe-images', 'program-images', 'lesson-images', 'muscle-images', 'region-images');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read managed image buckets'
  ) THEN
    CREATE POLICY "Public read managed image buckets"
      ON storage.objects FOR SELECT TO anon, authenticated
      USING (bucket_id IN ('content-images', 'recipe-images', 'program-images', 'lesson-images', 'muscle-images', 'region-images'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins upload managed image buckets'
  ) THEN
    CREATE POLICY "Admins upload managed image buckets"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id IN ('content-images', 'recipe-images', 'program-images', 'lesson-images', 'muscle-images', 'region-images') AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins update managed image buckets'
  ) THEN
    CREATE POLICY "Admins update managed image buckets"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id IN ('content-images', 'recipe-images', 'program-images', 'lesson-images', 'muscle-images', 'region-images') AND public.is_admin())
      WITH CHECK (bucket_id IN ('content-images', 'recipe-images', 'program-images', 'lesson-images', 'muscle-images', 'region-images') AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins delete managed image buckets'
  ) THEN
    CREATE POLICY "Admins delete managed image buckets"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id IN ('content-images', 'recipe-images', 'program-images', 'lesson-images', 'muscle-images', 'region-images') AND public.is_admin());
  END IF;
END $$;
