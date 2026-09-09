import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../src/routes/index.tsx', import.meta.url), 'utf8');
const regions = readFileSync(new URL('../src/components/site/BodyRegionGrid.tsx', import.meta.url), 'utf8');
const programs = readFileSync(new URL('../src/components/site/FeaturedPrograms.tsx', import.meta.url), 'utf8');

test('homepage data is resolved by the route loader before rendering', () => {
  assert.match(route, /loader:\s*async/);
  assert.match(route, /getHomepageRegionData\(\)/);
  assert.match(route, /getPublicPrograms\(\)/);
  assert.match(route, /Route\.useLoaderData\(\)/);
});

test('homepage components never present zero as a temporary loading value', () => {
  assert.doesNotMatch(regions, /\{ recipes: 0, programs: 0 \}/);
  assert.doesNotMatch(programs, /Loading programs/);
  assert.doesNotMatch(programs, /getPublicPrograms\(\)/);
  assert.match(regions, /Resource totals unavailable/);
});
