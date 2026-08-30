CREATE OR REPLACE FUNCTION public.normalize_lesson_duration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.duration_seconds IS NOT NULL AND NEW.duration_seconds <= 0 THEN
    NEW.duration_seconds := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_lesson_duration_before_write ON public.lessons;

CREATE TRIGGER normalize_lesson_duration_before_write
BEFORE INSERT OR UPDATE OF duration_seconds ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.normalize_lesson_duration();

REVOKE EXECUTE ON FUNCTION public.normalize_lesson_duration() FROM PUBLIC, anon, authenticated;
