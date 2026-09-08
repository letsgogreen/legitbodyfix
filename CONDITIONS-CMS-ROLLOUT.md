# Conditions CMS rollout

Status: implementation only; no production migration or deployment performed.

1. Apply `supabase/migrations/20260908120000_condition_cms.sql` to the intended database. It adds two empty tables and a restricted transactional save function; it does not import or overwrite the eight legacy articles.
2. Deploy application code. Open `/admin/conditions` as the existing administrator.
3. Select Shoulder dislocation recovery. Confirm Shoulder Movement is selected. Save a draft, refresh, and confirm the public article is unchanged.
4. Preview and publish the reviewed draft. Verify `/conditions/shoulder-dislocation-recovery` shows the published snapshot and the related sales link.
5. Verify a stale second editor cannot save over a newer version. Verify anonymous users cannot read `condition_drafts` or call `save_condition`.
6. Test unpublish on a dedicated test record in a non-production database: its legacy fallback must remain hidden; the private draft must remain available.

Publication snapshots never contain unsaved drafts. Unpublishing retains a public tombstone with an empty JSON object. Reverting application code to the pre-CMS version would ignore tombstones and restore static legacy pages, so use a reviewed application rollback rather than blindly reverting after unpublishing content.

Current limits: edits cover existing conditions; program options use the existing video sales catalog, not newly created database-only programs. Manual draft saving is explicit (no autosave). Full authenticated save/publish and SQL integration verification require the migration plus administrator login.

Verified locally: production build; 12 condition/block tests; shoulder related URL rendered in browser. Operational DB changes are pending approval.
