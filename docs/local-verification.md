# Browser-free verification

Run `pnpm check:local` after dependencies are installed, or run
`node scripts/check-local.mjs` directly. The command stops at the first failed check.

The checks run locally without applying migrations, uploading files, issuing gifts,
sending emails, charging payments, or deploying. Build output is generated locally.

## Coverage

- Full TypeScript check and production build.
- Six-region link rendering in all selected states.
- Program price-save callback updates and refresh invocation.
- Public program thumbnail visibility and admin preview authorization logic.
- Uploaded lesson thumbnails preserved during Stream status refresh.
- Image upload/save lifecycle, duplicate prevention and failure handling.
- Image upload handler claims, allowed buckets, MIME declarations, size limits,
  storage fallback and storage error propagation.
- Existing muscle navigation and email-template invariants.

React rendering/handler tests use stubs; storage and service clients are mocks.
These tests do not prove that live credentials, RLS policies, buckets, video
processing, image contents or browser interactions work. They also do not replace
the repository's older test suites or the separate PostgreSQL gift-policy tests.

## Still gated

The muscle-directory and lesson-gift migrations were applied to the live project;
see `resumed-rollout-status.md` for the verified scope. Hosted email/SMTP setup
is explicitly paused by the user. Production deployment remains gated.
Live upload/save/reload, selected video frame rendering, authenticated playback,
real checkout and desktop/mobile interaction need separate verification.
