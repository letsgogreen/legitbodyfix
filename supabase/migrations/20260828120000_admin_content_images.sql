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

CREATE POLICY "Public read content images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'content-images');

CREATE POLICY "Admins upload content images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'content-images' AND public.is_admin());

CREATE POLICY "Admins update content images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'content-images' AND public.is_admin())
WITH CHECK (bucket_id = 'content-images' AND public.is_admin());

CREATE POLICY "Admins delete content images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'content-images' AND public.is_admin());

CREATE TABLE public.site_media (
  key text PRIMARY KEY,
  image_url text NOT NULL DEFAULT '',
  image_alt text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site media"
ON public.site_media FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage site media"
ON public.site_media FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

GRANT SELECT ON public.site_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_media TO authenticated;
GRANT ALL ON public.site_media TO service_role;

INSERT INTO public.site_media (key, image_url, image_alt)
VALUES
  ('body-region:head-neck', 'https://commons.wikimedia.org/wiki/Special:FilePath/Sternocleidomastoideus.png', 'Anatomical illustration of the neck region'),
  ('body-region:shoulder-arm', 'https://commons.wikimedia.org/wiki/Special:FilePath/Deltoideus.png', 'Anatomical illustration of the shoulder and arm region'),
  ('body-region:spine-rib-cage', 'https://commons.wikimedia.org/wiki/Special:FilePath/1117_Muscles_of_the_Back.png', 'Anatomical illustration of the spine and rib cage region'),
  ('body-region:hip-pelvis', '/assets/images/postures/anterior-pelvic-tilt.png', 'Movement illustration of the hip and pelvis region'),
  ('body-region:knee', '/assets/images/postures/knee-valgus-varus.jpg', 'Movement illustration of the knee region'),
  ('body-region:ankle-foot', 'https://commons.wikimedia.org/wiki/Special:FilePath/Gastrocnemius.png', 'Anatomical illustration of the ankle and foot region')
ON CONFLICT (key) DO NOTHING;
