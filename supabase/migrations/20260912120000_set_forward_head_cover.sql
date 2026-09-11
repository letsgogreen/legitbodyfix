-- Use a versioned site asset instead of an expiring imported image URL.
UPDATE public.recipes
SET
  image_url = '/assets/images/postures/forward-head-posture.png',
  image_alt = 'Side-by-side anatomical illustration comparing forward and comfortably stacked head and neck positions',
  updated_at = now()
WHERE slug = 'forward-head-posture';

