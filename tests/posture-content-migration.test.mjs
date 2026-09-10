import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { recipeContentBlockSchema } from '../src/lib/recipe-blocks.schema.ts';

const migrationFiles = [
  '../supabase/migrations/20260911103000_enrich_first_posture_guides.sql',
  '../supabase/migrations/20260911113000_enrich_lower_body_posture_guides.sql',
  '../supabase/migrations/20260911123000_enrich_trunk_ankle_posture_guides.sql',
  '../supabase/migrations/20260911133000_enrich_upper_body_posture_guides.sql',
  '../supabase/migrations/20260911143000_complete_posture_guides.sql',
];
const migrations = migrationFiles.map((file) => readFileSync(new URL(file, import.meta.url), 'utf8'));
const migration = migrations.join('\n');
const expectedSlugs = [
  'asymmetric-weight-shift',
  'excessive-anterior-pelvic-tilt',
  'excessive-forward-trunk-leaning',
  'excessive-posterior-tilt',
  'feet-turn-out',
  'forward-head-posture',
  'heel-rise',
  'knee-dominance',
  'rib-flare',
  'round-shoulder',
  'scapula-anterior-tilt',
  'shoulder-elevation',
  'valgus-foot',
  'valgus-knee-knee-collapsing-inward',
  'varus-knee',
];

test('editorial migrations update all 15 published posture guides exactly once', () => {
  for (const slug of expectedSlugs) {
    assert.equal([...migration.matchAll(new RegExp(`WHERE slug = '${slug}'`, 'g'))].length, 1, slug);
  }
  assert.equal([...migration.matchAll(/WHERE slug = '/g)].length, expectedSlugs.length);
  assert.equal([...migration.matchAll(/content_blocks = \$json\$/g)].length, 15);
});

test('all embedded content block payloads are valid JSON with unique block ids', () => {
  const payloads = [...migration.matchAll(/\$json\$([\s\S]*?)\$json\$/g)].map((match) => JSON.parse(match[1]));
  assert.equal(payloads.length, 15);
  const allIds = [];
  for (const blocks of payloads) {
    assert.ok(blocks.length >= 8);
    assert.equal(new Set(blocks.map((block) => block.id)).size, blocks.length);
    for (const block of blocks) {
      assert.equal(recipeContentBlockSchema.safeParse(block).success, true, block.id);
      allIds.push(block.id);
    }
    assert.ok(blocks.some((block) => block.type === 'callout'));
    assert.ok(blocks.some((block) => block.type === 'button'));
    assert.ok(blocks.filter((block) => block.type === 'button').every((block) => block.url.startsWith('https://')));
  }
  assert.equal(new Set(allIds).size, allIds.length);
});

test('editorial pass retains non-diagnostic framing and safety guidance', () => {
  assert.match(migration, /not a diagnosis/i);
  assert.match(migration, /appearance alone/i);
  assert.match(migration, /safety_notes =/);
  assert.match(migration, /last_reviewed_at = '2026-09-11'/);
  assert.doesNotMatch(migration, /'reviewed'::public\.content_review_status/);
  assert.equal([...migration.matchAll(/safety_notes =/g)].length, 15);
  assert.equal([...migration.matchAll(/review_status = 'published'/g)].length, 15);
});

test('source calls to action invite examination instead of authority-based trust', () => {
  const labels = [...migration.matchAll(/"type":"button","label":"([^"]+)"/g)].map((match) => match[1]);
  assert.ok(labels.length > 0);
  assert.ok(labels.every((label) => !/^Read the (APTA|WHO)/.test(label)), labels.join('\n'));
  assert.ok(labels.every((label) => !/^Review (the )?(APTA|WHO|OSHA)/.test(label)), labels.join('\n'));
  assert.ok(labels.some((label) => /evidence and limitations/i.test(label)));
});
