# Admin-controlled public muscle dictionary

This change is not ready for production until the database migration and live-data checks below are complete.

## Rollout order

1. Apply `supabase/migrations/20260903090000_muscle_directory_config.sql` to the same Supabase project used by the admin editor and public server. This adds one nullable JSON column; it does not change RLS, records, or publication state.
2. Confirm published DB records cover the intended public library. Compare IDs with the 179 bundled muscle references; review missing/unpublished entries without automatically publishing or importing them.
3. Deploy a preview and confirm `GET /api/public/muscle-directory` returns 200 and only published records. Confirm server Supabase URL matches the admin client's project.
4. With an authorized admin account, select an existing test record, set manual regions/groups/movements, save, reload the editor, and verify the public dictionary. Restore the original values after the test. Also verify a signed-out/non-admin client cannot update the record.
5. Verify changing publication state removes the entry from public lists, direct detail URLs and search. An empty DB response remains empty; errors must not fall back to stale bundled muscles.
6. Only then promote to production.

## Editor behavior

`/admin/muscles/:id` has a Public dictionary classification section. Each dimension can use automatic inference (null) or manual selections. Region and group overrides require at least one value. Movement overrides may be empty to intentionally exclude the muscle from all movement filters. Multiple group names are entered one per line and apply to every selected region.

Existing anatomical group, family, description and functions are preserved. Saving uses the existing version check and revision trigger. Until the migration is applied, editor saves are locked with an explicit message. Public reads use an anonymous Supabase client and an explicit published filter, never a service-role key.

The dictionary retains bundled guides/recipes but takes its entire muscle list from the live API. No muscle fallback is used, so a read failure cannot accidentally republish an old record.
