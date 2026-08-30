-- Restore the first canonical posture guide and its editorial relationships in
-- the user-owned backend. It intentionally remains a draft until the linked
-- recipe, imagery, and public program are reviewed and published.

INSERT INTO public.guides (
  slug,
  title,
  pattern_summary,
  common_regions,
  self_check,
  watch_for,
  published,
  review_status
) VALUES (
  'forward-head-posture',
  'Forward Head Posture',
  'Forward head posture describes a pattern where the head sits forward of the shoulders and rib cage during daily activity, sitting, or training. It is commonly associated with desk work, screen use, and reduced awareness of neutral spine position — but it is a movement pattern to explore, not a diagnosis.',
  ARRAY['head-neck', 'shoulder-arm', 'spine-ribs'],
  'Stand relaxed against a wall with your heels a few inches out. Notice whether the back of your head naturally touches the wall without forcing it, or whether there is a noticeable gap. A gap alone is not a problem — it is simply useful information about your current resting position.',
  'Persistent neck pain, numbness or tingling in the arms or hands, headaches that worsen with neck position, or any symptom that does not improve with rest may benefit from a professional assessment before continuing exercise.',
  false,
  'needs_data_review'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  pattern_summary = EXCLUDED.pattern_summary,
  common_regions = EXCLUDED.common_regions,
  self_check = EXCLUDED.self_check,
  watch_for = EXCLUDED.watch_for,
  updated_at = now();

INSERT INTO public.guide_recipes (guide_id, recipe_id, position)
SELECT g.id, r.id, 1
FROM public.guides g
JOIN public.recipes r ON r.slug = 'forward-head-posture'
WHERE g.slug = 'forward-head-posture'
ON CONFLICT (guide_id, recipe_id) DO UPDATE SET position = EXCLUDED.position;

INSERT INTO public.guide_programs (guide_id, program_id, position)
SELECT g.id, p.id, 1
FROM public.guides g
JOIN public.programs p ON p.slug = 'neck-shoulder-reset'
WHERE g.slug = 'forward-head-posture'
ON CONFLICT (guide_id, program_id) DO UPDATE SET position = EXCLUDED.position;
