-- Match the user-owned Preview backend to the nine muscle records currently
-- published on Production. No additional atlas records are published here.

UPDATE public.muscles
SET
  published = true,
  review_status = 'published',
  published_at = COALESCE(published_at, now()),
  updated_at = now()
WHERE slug IN (
  'external-oblique',
  'latissimus-dorsi',
  'lower-trapezius',
  'pectoralis-minor',
  'rectus-abdominis',
  'serratus-anterior',
  'serratus-posterior-inferior',
  'serratus-posterior-superior',
  'upper-trapezius'
);
