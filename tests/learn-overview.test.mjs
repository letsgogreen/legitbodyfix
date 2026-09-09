import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const route = readFileSync(new URL('../src/routes/movement-check.tsx', import.meta.url), 'utf8');

test('Learn opens on an overview instead of choosing a body region for the visitor', () => {
  assert.match(route, /if \(!region\) return <LearnOverview \/>/);
  assert.match(route, /Explore movement from one clear starting point/);
  assert.match(route, /bodyRegions\.map\(\(item, index\)/);
});

test('the overview does not fetch region-specific data', () => {
  assert.match(route, /if \(!deps\.region\) return \{ muscleGroups: \[\], recipeData: \{ recipes: \[\], failed: false \} \}/);
  assert.match(route, /Promise\.all\(\[/);
});

test('Learn supports region-first and resource-first paths', () => {
  assert.match(route, /Where do you want to start\?/);
  assert.match(route, /Browse by resource type/);
  assert.match(route, /Posture & movement/);
  assert.match(route, /Conditions/);
  assert.match(route, /Muscle dictionary/);
});

test('a selected region connects articles, conditions, anatomy, and programs', () => {
  assert.match(route, /\{region\.title\} condition guides/);
  assert.match(route, /to="\/conditions"/);
  assert.match(route, /search=\{\{ region: region\.slug \}\}/);
  assert.match(route, /Browse related conditions/);
});
