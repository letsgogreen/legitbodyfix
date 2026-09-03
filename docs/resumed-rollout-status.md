# Resumed rollout — 2026-09-03

Target confirmed through the signed-in Supabase dashboard:
`legitbodyfix-access` / `choyenazxmlcnnyayozy` / main (Production).

## Completed

- Read-only SQL inspection: 179 muscle records, 9 published; `lesson_gifts` absent.
- Existing Storage policies include admin-only INSERT/UPDATE/DELETE for all six
  managed image buckets and public image SELECT. The bucket list's displayed
  policy count of zero did not accurately represent the actual SQL policies.
- Existing `public.is_admin()` checks both trusted `app_metadata.is_admin` and
  the configured administrator email.
- Applied the statements in `20260903090000_muscle_directory_config.sql` using
  the dashboard SQL editor. Verified `directory_config` exists with type `jsonb`.
- Preview `/api/public/muscle-directory` returned HTTP 200 after the addition;
  previously it returned 503 with PostgreSQL error 42703.
- After the user's action-time approval, applied
  `20260903120000_lesson_gifts.sql` in the same project. SQL Editor reported
  success. Local in-memory PostgreSQL permission tests also passed (23 cases).
- Live read-only verification: RLS enabled; anonymous table SELECT and claim
  function execution denied; authenticated users cannot directly insert/update
  recipient ownership; admin-only create/revoke policies installed. The existing
  `Customers read entitled lessons` policy remains present alongside the new
  recipient policy. Gift record count is zero.

## Not applied / pending

- User explicitly paused hosted email branding/custom SMTP on 2026-09-03.
  The dashboard requires custom SMTP for edited templates. No SMTP credentials
  or email-template changes were saved by the agent. The user's unsaved toggle
  was shown enabled in a screenshot; its persisted state has not been verified.
  Do not resume SMTP setup or send test emails without a new request.

- No muscle records were edited, imported, or published by this rollout.
- The public dictionary will show only the 9 currently published DB records.
  Do not bulk publish the remaining 170 without explicit content review/approval.
- Lesson-gift database structure is applied; no real gifts have been issued.
  A real recipient claim and signed video playback still require verification.
- No Storage policies, bucket permissions, OAuth credentials, hosted email
  templates, production deployment or main branch were changed.
- Recent browser-free fixes remain local and uncommitted.
- Admin save/reload, actual image upload, live gifted playback and email rendering
  are still unverified.
- Browser check of the preview `/admin/customers` reached the administrator
  sign-in gate. The production site's existing login did not authenticate this
  preview origin. No login email was sent; user sign-in is needed to inspect
  the gift-management UI against the applied database.

## Next release checks (email work excluded)

1. Run local regression/type/build checks and the separate PostgreSQL gift tests.
2. Update the feature-branch preview with the local fixes; do not merge main yet.
3. Sign into that preview as administrator and check gift form loading, upload,
   save/reload, thumbnail selection and program price refresh.
4. With an explicitly designated test recipient and lesson, verify gift claim,
   signed playback and revocation without changing existing paid access.
5. Resolve the public dictionary content gate (9 published of 179 records)
   before approving a production release. Do not bulk publish draft records.
