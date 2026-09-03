-- Individual lesson gifts are independent of paid program entitlements.
BEGIN;
CREATE TABLE public.lesson_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL CHECK (recipient_email = lower(btrim(recipient_email)) AND length(recipient_email) <= 254 AND recipient_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE RESTRICT,
  recipient_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  revoked_at timestamptz
);
CREATE UNIQUE INDEX lesson_gifts_active_unique ON public.lesson_gifts(recipient_email, lesson_id) WHERE revoked_at IS NULL;
CREATE INDEX lesson_gifts_recipient_idx ON public.lesson_gifts(recipient_user_id, lesson_id) WHERE revoked_at IS NULL;
ALTER TABLE public.lesson_gifts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lesson_gifts FROM anon, authenticated;
GRANT SELECT ON public.lesson_gifts TO authenticated;
GRANT INSERT (recipient_email, lesson_id) ON public.lesson_gifts TO authenticated;
GRANT UPDATE (revoked_at) ON public.lesson_gifts TO authenticated;
CREATE POLICY "Admins read lesson gifts" ON public.lesson_gifts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins create lesson gifts" ON public.lesson_gifts FOR INSERT TO authenticated WITH CHECK (
  public.is_admin() AND created_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.lessons l WHERE l.id = lesson_id AND l.published AND l.stream_status = 'ready' AND l.stream_uid IS NOT NULL
  )
);
CREATE POLICY "Admins revoke lesson gifts" ON public.lesson_gifts FOR UPDATE TO authenticated USING (public.is_admin() AND revoked_at IS NULL) WITH CHECK (public.is_admin() AND revoked_at IS NOT NULL);

-- Claim only with the server-held verified email, never client profile metadata.
-- Once claimed, access is bound to the account even if its email changes.
CREATE FUNCTION public.my_gifted_lessons()
RETURNS TABLE (id uuid, title text, duration_seconds integer, stream_status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE verified_email text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT lower(btrim(u.email)) INTO verified_email FROM auth.users u
    WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL;
  UPDATE public.lesson_gifts g SET recipient_user_id = auth.uid(), claimed_at = now()
    WHERE g.recipient_user_id IS NULL AND g.revoked_at IS NULL AND g.recipient_email = verified_email;
  RETURN QUERY SELECT DISTINCT l.id, l.title::text, l.duration_seconds::integer, l.stream_status::text
    FROM public.lesson_gifts g JOIN public.lessons l ON l.id = g.lesson_id
    WHERE g.recipient_user_id = auth.uid() AND g.revoked_at IS NULL AND l.published;
END;
$$;
REVOKE ALL ON FUNCTION public.my_gifted_lessons() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_gifted_lessons() TO authenticated;

CREATE FUNCTION public.has_lesson_gift(target_lesson uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.lesson_gifts g WHERE g.lesson_id = target_lesson
    AND g.recipient_user_id = auth.uid() AND g.revoked_at IS NULL);
$$;
REVOKE ALL ON FUNCTION public.has_lesson_gift(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_lesson_gift(uuid) TO authenticated;
-- Existing signed playback handler already queries lessons under the user's RLS.
CREATE POLICY "Recipients read gifted lessons" ON public.lessons FOR SELECT TO authenticated
  USING (published AND public.has_lesson_gift(id));
COMMIT;
