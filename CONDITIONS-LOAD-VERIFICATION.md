# Conditions load reliability — 2026-09-08

## Scope

- Conditions reads reuse the client used by AdminAuthGate.
- Loading disables retry; missing-table, access, and other query failures have distinct guidance.
- No changes to authentication rules, RLS, migrations, saved content, prices, or access grants.
- Save/publish server functions are unchanged.

## Verified locally

- 15 tests passed: conditions, recipe-blocks, condition-load-error.
- Production build passed.
- Reload /admin/conditions: all eight guides loaded.
- Select Shoulder dislocation recovery: existing text and Anterior Humeral Glide Fix link present.
- Switch to preview: existing guidance and related program displayed.
- Navigate to Programs and return: Conditions list loaded without an error.
- Browser verification did not save or publish content.

## Limits / release checks

- Intermittent failures were observed on both local and production before these changes; reload recovered them.
- Multiple Supabase client warning and different read/auth clients were observed, but a single definitive cause was not proven.
- Successful local checks do not establish that every intermittent failure is eliminated.
- After deployment, repeat reload, guide selection, preview, and navigation on production.
- Save/publish and forced network-failure recovery were not exercised in this verification.
- This document is a verification record, not authorization to deploy.
