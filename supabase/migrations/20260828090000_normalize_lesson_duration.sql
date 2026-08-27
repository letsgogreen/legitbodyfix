-- A duration is unknown until Stream reports it. Zero is not a valid playback
-- duration and prevents otherwise unrelated lesson updates when the production
-- constraint is stricter than the original local migration.
UPDATE public.lessons
SET duration_seconds = NULL
WHERE duration_seconds IS NOT NULL
  AND duration_seconds <= 0;

ALTER TABLE public.lessons
  DROP CONSTRAINT IF EXISTS lessons_duration_seconds_check;

ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_duration_seconds_check
  CHECK (duration_seconds IS NULL OR duration_seconds > 0);
