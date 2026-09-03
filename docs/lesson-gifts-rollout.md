# Individual video gifts

Admin: `/admin/customers` > Gift a video. Recipient: `/library` > Gifted videos.

Apply `20260903120000_lesson_gifts.sql` before deploying this feature. It adds an independent gift table, two restricted functions, and a lesson read policy. Existing paid/manual program entitlements and storage policies are untouched. Only published, Stream-ready videos can be gifted. No email is sent and no charge or order is created.

An administrator enters the recipient's email and chooses a lesson, then confirms. Active duplicates are rejected by a database unique index. Revocation preserves the record and creator/date/claim history. Revoking a gift does not revoke purchased program access. Signed playback URLs already issued can work until their existing expiry.

The authenticated recipient calls `my_gifted_lessons` on opening the library. It matches against `auth.users.email` only when `email_confirmed_at` is present, binds pending gifts to the account atomically, and returns published lesson metadata. It does not trust a browser-supplied email, JWT user metadata, or editable customer profile. Claiming is repeatable without new grants. Claimed gifts stay bound to their user ID. Deleted recipient users are restricted rather than making their grants claimable by a later owner of the email.

RLS grants recipients SELECT on precisely gifted published lessons. The existing playback server function still derives Stream UID from a user-RLS lesson read and signs it server-side. No public video URLs or service-role credentials are added.

## Required integration checks before production

- Admin can create a gift, reload history, and revoke it; anonymous and ordinary authenticated clients cannot select gift history, insert gifts, change ownership, revoke, or restore revoked rows.
- Matching verified recipient claims once; wrong email and unverified users cannot claim; editing customer profile/user metadata does not change eligibility.
- Recipient sees and plays the gifted lesson only; sibling lesson playback remains forbidden unless separately purchased/gifted.
- Duplicate grants fail; pending revoked gifts cannot be claimed; revoked/unpublished lessons cannot receive new signed playback tokens.
- Original paid program access survives gift grant/revoke.
- New signup and Google/email login converge on the intended recipient account; email changes after claim do not transfer ownership.

Local syntax/type checks do not replace these database and authenticated playback tests. No production migration, gift, or email is issued by adding this code.

## Local database verification

`scripts/test-lesson-gifts.mjs` executes this exact migration in in-memory PostgreSQL (PGlite 0.3.14), with simulated auth roles/users and baseline lesson/paid-access policies. Pass an installed PGlite `dist/index.js` path as its argument. All 23 cases passed locally: SQL execution, role/column permissions, verified ownership, duplicate handling, sibling isolation, claim persistence, unpublished/revoked blocking, and paid-access preservation. This is not a check of the live project's complete policy set or a Cloudflare playback test.
