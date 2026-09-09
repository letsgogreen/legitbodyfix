import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const nav = readFileSync(new URL('../src/components/site/LearnNav.tsx', import.meta.url), 'utf8');
const conditions = readFileSync(new URL('../src/components/site/ConditionsPage.tsx', import.meta.url), 'utf8');

test('Learn tabs retain the selected region without document reloads', () => {
  assert.match(nav, /const regionSearch = region \? \{ region \} : \{\}/);
  assert.match(nav, /to="\/movement-check" search=\{regionSearch\}/);
  assert.match(nav, /to="\/recipes" search=\{\{ region \}\}/);
  assert.match(nav, /to="\/conditions" search=\{\{ region \}\}/);
  assert.match(nav, /preload="intent"/);
  assert.match(nav, /Posture & movement/);
});

test('dictionary receives the matching anatomical region', () => {
  assert.match(nav, /"shoulder-arm": "shoulder-scapula"/);
  assert.match(nav, /"ankle-foot": "foot-ankle"/);
  assert.match(nav, /&region=\$\{muscleRegions\[region\]\}/);
});

test('condition filtering supports each Learn body region', () => {
  for (const slug of ['head-neck', 'shoulder-arm', 'spine-rib-cage', 'hip-pelvis', 'ankle-foot']) {
    assert.match(conditions, new RegExp(`"${slug}"`));
  }
  assert.match(conditions, /\bknee:/);
  assert.match(conditions, /matchesRegion && matchesQuery/);
  assert.match(conditions, /to="\/conditions\/\$slug"/);
});
