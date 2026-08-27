-- Cloudflare Stream becomes the primary delivery layer. Keep video_path during
-- migration so existing Supabase Storage uploads are not destroyed.
ALTER TABLE public.lessons
  ADD COLUMN stream_uid text UNIQUE,
  ADD COLUMN stream_status text NOT NULL DEFAULT 'not_uploaded'
    CHECK (stream_status IN ('not_uploaded', 'uploading', 'processing', 'ready', 'error')),
  ADD COLUMN stream_error text,
  ADD COLUMN stream_thumbnail_url text;

CREATE INDEX lessons_stream_status_idx ON public.lessons (stream_status);
