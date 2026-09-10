import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const route = readFileSync(new URL('../src/routes/admin.recipes.index.tsx', import.meta.url), 'utf8');

test('movement content uses a responsive card library with useful editorial signals', () => {
  assert.match(route, /Posture library/);
  assert.match(route, /md:grid-cols-2 xl:grid-cols-3/);
  assert.match(route, /Missing: \{missing\.join/);
  assert.match(route, /Open editor →/);
});

test('movement library supports publication and completeness filters', () => {
  assert.match(route, /All statuses/);
  assert.match(route, /Needs work/);
  assert.match(route, /function missingFields/);
});

test('movement counts are not rendered as zero while data is loading', () => {
  assert.match(route, /loading \? "Loading movement content…"/);
  assert.match(route, /loading \? <div className="mt-2 h-4 w-72 animate-pulse/);
});
