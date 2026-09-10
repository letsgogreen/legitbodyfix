import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const collector = readFileSync(new URL('../src/lib/recipe-scrape.functions.ts', import.meta.url), 'utf8');
const route = readFileSync(new URL('../src/routes/admin.recipes.scrape.tsx', import.meta.url), 'utf8');
const library = readFileSync(new URL('../src/routes/admin.recipes.index.tsx', import.meta.url), 'utf8');

test('source collection is admin-only, bounded, and blocks private targets through redirects', () => {
  assert.match(collector, /middleware\(\[requireSupabaseAuth\]\)/);
  assert.match(collector, /max\(20\)/);
  assert.match(collector, /blockedHostname/);
  assert.match(collector, /redirect: "manual"/);
  assert.match(collector, /assertPublicHttps\(new URL\(location, url\)\.toString\(\)\)/);
});

test('collected sources become unpublished review drafts', () => {
  assert.match(route, /review_status: "needs_data_review"/);
  assert.match(route, /published: false/);
  assert.match(route, /Original text remains owned by its publisher/);
  assert.match(library, /to="\/admin\/recipes\/scrape"/);
});
