-- Recovery migration for deployments where the admin image UI shipped before
-- the content-images storage bucket was created in the shared Supabase project.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read content images'
  ) THEN
    CREATE POLICY "Public read content images"
      ON storage.objects FOR SELECT TO anon, authenticated
      USING (bucket_id = 'content-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins upload content images'
  ) THEN
    CREATE POLICY "Admins upload content images"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'content-images' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins update content images'
  ) THEN
    CREATE POLICY "Admins update content images"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'content-images' AND public.is_admin())
      WITH CHECK (bucket_id = 'content-images' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins delete content images'
  ) THEN
    CREATE POLICY "Admins delete content images"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'content-images' AND public.is_admin());
  END IF;
END
$$;
