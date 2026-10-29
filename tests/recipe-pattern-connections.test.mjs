import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {forwardLeanConnections, selectForwardLeanConnections} from '../src/data/recipe-pattern-connections.ts';

test('connections retain editorial order and omit missing or unrelated recipes', () => {
  const records = [{slug:'unrelated'}, {slug:'asymmetric-weight-shift'}, {slug:'heel-rise'}];
  const selected = selectForwardLeanConnections(records);
  assert.deepEqual(selected.map(row => row.slug), ['heel-rise', 'asymmetric-weight-shift']);
  assert.ok(selected.every(row => row.connectionReason.length > 30));
  assert.equal(new Set(forwardLeanConnections.map(row => row.slug)).size, forwardLeanConnections.length);
  assert.deepEqual(selectForwardLeanConnections([]), []);
});

test('related records are publication-filtered and explanation is scoped to forward lean', () => {
  const server = readFileSync(new URL('../src/lib/recipes.functions.ts', import.meta.url), 'utf8');
  const route = readFileSync(new URL('../src/routes/recipes.$slug.tsx', import.meta.url), 'utf8');
  const component = readFileSync(new URL('../src/components/recipes/ForwardLeanContext.tsx', import.meta.url), 'utf8');
  assert.match(server, /input.slug === forwardLeanSlug[\s\S]*?\.eq\("published", true\)/);
  assert.match(route, /recipe.slug === forwardLeanSlug \? <ForwardLeanContext/);
  assert.match(component, /md:grid-cols-2/);
  assert.match(component, /<article/);
  assert.doesNotMatch(component, /<details|<summary/);
  assert.match(component, /max-w-\[70ch\]/);
  assert.match(component, /text-\[18px\]/);
  assert.match(component, /not validated causal pathways/);
});

test('public muscles precede shared context and admin shows that same section', () => {
  const route = readFileSync(new URL('../src/routes/recipes.$slug.tsx', import.meta.url), 'utf8');
  const admin = readFileSync(new URL('../src/routes/admin.recipes.$recipeId.tsx', import.meta.url), 'utf8');
  assert.ok(route.indexOf('<RecipeBlockContent') < route.indexOf('<ForwardLeanContext'));
  assert.ok(admin.indexOf('<RecipeBlockEditor') < admin.indexOf('<ForwardLeanContext'));
  assert.match(admin, /enabled: record\?\.slug === forwardLeanSlug/);
  assert.match(admin, /selectForwardLeanConnections\(relatedRecipesQuery.data \?\? \[\]\)/);
  assert.match(admin, /currently managed in code/);
});
