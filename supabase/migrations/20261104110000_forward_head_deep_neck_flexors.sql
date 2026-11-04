-- Group the existing longus capitis/colli references; preserve dictionary data.
DO $$
DECLARE
  target record;
  block jsonb;
  result jsonb := '[]'::jsonb;
  added boolean := false;
  ids jsonb := '["longus-capitis","longus-colli"]'::jsonb;
BEGIN
  SELECT id, content_blocks INTO STRICT target FROM public.recipes WHERE slug = 'forward-head-posture';
  IF (SELECT count(*) FROM public.muscles WHERE id IN ('longus-capitis','longus-colli') AND published) <> 2 THEN
    RAISE EXCEPTION 'Both published dictionary entries are required';
  END IF;
  FOR block IN SELECT value FROM jsonb_array_elements(target.content_blocks::jsonb) LOOP
    IF block->>'id' = 'forward-head-deep-neck-static-image' THEN CONTINUE; END IF;
    IF block->>'type' = 'toggle' AND (
      coalesce(block->'muscleIds','[]'::jsonb) ?| ARRAY['longus-capitis','longus-colli']
      OR lower(coalesce(block->>'title','')) = 'deep neck flexors'
    ) THEN
      IF EXISTS (SELECT 1 FROM jsonb_array_elements_text(coalesce(block->'muscleIds','[]'::jsonb)) v WHERE NOT ids ? v) THEN
        RAISE EXCEPTION 'Mixed group requires manual review';
      END IF;
      IF coalesce(block->>'text','') <> '' OR coalesce(block->>'note','') <> '' OR coalesce(block->>'side','') <> '' THEN
        RAISE EXCEPTION 'Existing custom text requires manual preservation';
      END IF;
      IF NOT added THEN
        result := result || jsonb_build_array(
          jsonb_build_object('id','forward-head-deep-neck-flexors','type','toggle','title','Deep neck flexors','text','','muscleRole','weak','muscleIds',ids),
          jsonb_build_object('id','forward-head-deep-neck-static-image','type','image','url','https://www.legitbodyfix.com/images/anatomy/deep-neck-flexors.png','alt','Deep neck flexors','fit','contain','aspect','auto','caption','Anterior view showing longus capitis and longus colli. Henry Vandyke Carter, Gray''s Anatomy, plate 387; public domain, unchanged. [Image source](https://commons.wikimedia.org/wiki/File:Gray387.png).','source','')
        );
        added := true;
      END IF;
    ELSE
      result := result || jsonb_build_array(block);
    END IF;
  END LOOP;
  IF NOT added THEN RAISE EXCEPTION 'No existing deep neck flexor cards found'; END IF;
  UPDATE public.recipes SET content_blocks = result WHERE id = target.id;
END $$;
