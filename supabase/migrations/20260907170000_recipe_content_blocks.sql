ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS content_blocks jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.recipes
  DROP CONSTRAINT IF EXISTS recipes_content_blocks_array;
ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_content_blocks_array CHECK (jsonb_typeof(content_blocks) = 'array');

COMMENT ON COLUMN public.recipes.content_blocks IS
  'Ordered article blocks: heading, paragraph, toggle, image, youtube, and divider.';
