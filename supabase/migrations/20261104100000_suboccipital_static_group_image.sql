-- Keep all four dictionary links; use one credited static group illustration.
DO $$
DECLARE
  target record;
  blocks jsonb;
  result jsonb := '[]'::jsonb;
  block jsonb;
BEGIN
  SELECT id, content_blocks INTO STRICT target FROM public.recipes WHERE slug = 'forward-head-posture';
  blocks := target.content_blocks::jsonb;
  IF (SELECT count(*) FROM jsonb_array_elements(blocks) b WHERE b->>'id' = 'forward-head-suboccipital-group' AND b->>'type' = 'toggle') <> 1 THEN
    RAISE EXCEPTION 'Expected one existing suboccipital group';
  END IF;
  FOR block IN SELECT value FROM jsonb_array_elements(blocks) LOOP
    IF block->>'id' = 'forward-head-suboccipital-static-image' THEN CONTINUE; END IF;
    result := result || jsonb_build_array(block);
    IF block->>'id' = 'forward-head-suboccipital-group' THEN
      result := result || jsonb_build_array(jsonb_build_object(
        'id', 'forward-head-suboccipital-static-image', 'type', 'image',
        'url', 'https://www.legitbodyfix.com/images/anatomy/suboccipital-muscles.png',
        'alt', 'Suboccipital muscles', 'fit', 'contain', 'aspect', 'square',
        'caption', 'Green: obliquus capitis superior. Red: obliquus capitis inferior. Blue: rectus capitis posterior major. Orange: rectus capitis posterior minor. Anatomography / DBCLS; unchanged. [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en). [Image source](https://commons.wikimedia.org/wiki/File:Suboccipital_muscles06.png).',
        'source', ''
      ));
    END IF;
  END LOOP;
  UPDATE public.recipes SET content_blocks = result WHERE id = target.id;
END $$;
