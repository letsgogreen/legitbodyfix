-- Group the four existing dictionary entries without deleting dictionary records.
DO $$
DECLARE
  target record;
  entries jsonb;
  block jsonb;
  result jsonb := '[]'::jsonb;
  ids jsonb := '["rectus-capitis-posterior-major","rectus-capitis-posterior-minor","obliquus-capitis-superior","obliquus-capitis-inferior"]'::jsonb;
  added boolean := false;
BEGIN
  SELECT id, content_blocks INTO STRICT target FROM public.recipes WHERE slug = 'forward-head-posture';
  IF (SELECT count(*) FROM public.muscles WHERE id IN (SELECT jsonb_array_elements_text(ids)) AND published) <> 4 THEN
    RAISE EXCEPTION 'Four published suboccipital dictionary entries are required';
  END IF;
  entries := coalesce(target.content_blocks::jsonb, '[]'::jsonb);
  FOR block IN SELECT value FROM jsonb_array_elements(entries) LOOP
    IF block->>'type' = 'toggle' AND (
      coalesce(block->'muscleIds', '[]'::jsonb) ?| ARRAY['rectus-capitis-posterior-major','rectus-capitis-posterior-minor','obliquus-capitis-superior','obliquus-capitis-inferior']
      OR lower(coalesce(block->>'title','')) LIKE '%suboccipital%'
    ) THEN
      IF EXISTS (SELECT 1 FROM jsonb_array_elements_text(coalesce(block->'muscleIds','[]'::jsonb)) v WHERE NOT ids ? v) THEN
        RAISE EXCEPTION 'Mixed muscle group requires manual review';
      END IF;
      IF NOT added THEN
        result := result || jsonb_build_array(jsonb_build_object('id','forward-head-suboccipital-group','type','toggle','title','Suboccipital muscles','text','','muscleRole','tight','muscleIds',ids));
        added := true;
      END IF;
    ELSE
      result := result || jsonb_build_array(block);
    END IF;
  END LOOP;
  IF NOT added THEN RAISE EXCEPTION 'No existing suboccipital card found; inspect before adding'; END IF;
  UPDATE public.recipes SET content_blocks = result WHERE id = target.id;
END $$;
