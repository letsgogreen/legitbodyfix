import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const route = readFileSync(new URL('../src/routes/recipes.index.tsx', import.meta.url), 'utf8');
const data = readFileSync(new URL('../src/lib/recipes.functions.ts', import.meta.url), 'utf8');
const filter = readFileSync(new URL('../src/components/site/LearnRegionFilter.tsx', import.meta.url), 'utf8');

test('posture region selection is validated and retained in the URL', () => {
  assert.match(route, /validateSearch:[\s\S]*findBodyRegion/);
  assert.match(filter, /search=\{\{ region: item\.slug \}\}/);
  assert.match(filter, /aria-current=\{activeRegion\?\.slug === item\.slug/);
});

test('legacy spine region values remain visible under Spine & Rib Cage', () => {
  assert.match(route, /\["spine-rib-cage", "spine-ribs"\]/);
});

test('posture library fetch is not restricted to a small featured set', () => {
  assert.match(data, /complete posture library/);
  assert.match(data, /\.limit\(100\)/);
});

test('recipe thumbnails resolve relative admin paths and fail gracefully', () => {
  assert.match(route, /function resolveRecipeImageUrl/);
  assert.match(route, /imageUrl\.startsWith\("\/"\)/);
  assert.match(route, /onError=\{\(event\) => \{ event\.currentTarget\.style\.display = "none"; \}\}/);
});
