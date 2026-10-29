import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {forwardLeanConnections, selectForwardLeanConnections, hasPatternArticle, patternConnectionsFor, selectPatternConnections} from '../src/data/recipe-pattern-connections.ts';
import {recipePatternArticles, patternSources} from '../src/data/recipe-articles/index.ts';

test('connections retain editorial order and omit missing or unrelated recipes', () => {
  const records = [{slug:'unrelated'}, {slug:'asymmetric-weight-shift'}, {slug:'heel-rise'}];
  const selected = selectForwardLeanConnections(records);
  assert.deepEqual(selected.map(row => row.slug), ['heel-rise', 'asymmetric-weight-shift']);
  assert.ok(selected.every(row => row.connectionReason.length > 30));
  assert.equal(new Set(forwardLeanConnections.map(row => row.slug)).size, forwardLeanConnections.length);
  assert.deepEqual(selectForwardLeanConnections([]), []);
});

test('related records are publication-filtered and article layout stays readable', () => {
  const server = readFileSync(new URL('../src/lib/recipes.functions.ts', import.meta.url), 'utf8');
  const route = readFileSync(new URL('../src/routes/recipes.$slug.tsx', import.meta.url), 'utf8');
  const component = readFileSync(new URL('../src/components/recipes/ForwardLeanContext.tsx', import.meta.url), 'utf8');
  assert.match(server, /connections.length[\s\S]*?\.eq\("published", true\)/);
  assert.match(route, /<RecipePatternContext slug=\{recipe.slug\}/);
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
  assert.ok(route.indexOf('<RecipeBlockContent') < route.indexOf('<RecipePatternContext'));
  assert.ok(admin.indexOf('<RecipeBlockEditor') < admin.indexOf('<RecipePatternContext'));
  assert.match(admin, /enabled: Boolean\(record && hasPatternArticle\(record.slug\)\)/);
  assert.match(admin, /selectPatternConnections\(record.slug, relatedRecipesQuery.data \?\? \[\]\)/);
  assert.match(admin, /currently managed in code/);
});

const publishedSlugs = [
  'excessive-anterior-pelvic-tilt', 'excessive-posterior-tilt', 'asymmetric-weight-shift',
  'rib-flare', 'round-shoulder', 'forward-head-posture', 'shoulder-elevation',
  'scapula-anterior-tilt', 'varus-knee', 'valgus-foot', 'feet-turn-out',
  'knee-dominance', 'valgus-knee-knee-collapsing-inward', 'heel-rise',
  'excessive-forward-trunk-leaning',
];

test('all 14 additional articles have individually written, sourced sections', () => {
  assert.equal(Object.keys(recipePatternArticles).length, 14);
  for (const [slug, article] of Object.entries(recipePatternArticles)) {
    assert.ok(publishedSlugs.includes(slug), slug);
    assert.ok(article.title.length > 20, slug);
    assert.ok(article.intro.length > 0, slug);
    assert.ok(article.sections.length >= 3, slug);
    assert.equal(new Set(article.sections.map(section => section.heading)).size, article.sections.length, slug);
    const evidence = article.sections.flatMap(section => section.evidence ?? []);
    assert.ok(evidence.length >= 1, `No evidence: ${slug}`);
    for (const id of evidence) {
      assert.ok(patternSources[id], `Unknown evidence ${id}: ${slug}`);
      assert.match(patternSources[id].url, /^https:\/\/(?:pubmed|pmc)\.ncbi\.nlm\.nih\.gov\//);
      assert.ok(patternSources[id].scope.length > 35);
    }
    assert.ok(article.interpretation.length > 60, slug);
  }
  assert.equal(new Set(Object.values(recipePatternArticles).map(article => article.title)).size, 14);
});

test('connection graph has no draft links, self-links or duplicates', () => {
  for (const slug of publishedSlugs) {
    assert.ok(hasPatternArticle(slug));
    const links = patternConnectionsFor(slug);
    assert.ok(links.length >= 2 && links.length <= 4, slug);
    assert.equal(new Set(links.map(link => link.slug)).size, links.length, slug);
    for (const link of links) {
      assert.notEqual(link.slug, slug);
      assert.ok(publishedSlugs.includes(link.slug), `${slug} -> ${link.slug}`);
      assert.ok(link.reason.length > 50);
    }
    assert.deepEqual(selectPatternConnections(slug, []), []);
    assert.deepEqual(selectPatternConnections(slug, publishedSlugs.map(slug => ({slug}))).map(item => item.slug), links.map(item => item.slug));
  }
  assert.equal(hasPatternArticle('varus-foot'), false);
  assert.equal(hasPatternArticle('unknown'), false);
  assert.deepEqual(patternConnectionsFor('unknown'), []);
  assert.equal(hasPatternArticle('__proto__'), false);
  assert.deepEqual(patternConnectionsFor('constructor'), []);
});

test('generic article uses semantic headings, visible references and image cards', () => {
  const source = readFileSync(new URL('../src/components/recipes/RecipePatternContext.tsx', import.meta.url), 'utf8');
  assert.match(source, /<article/);
  assert.match(source, /max-w-\[70ch\]/);
  assert.match(source, /text-\[18px\]/);
  assert.match(source, /sm:text-\[19px\]/);
  assert.match(source, /<RelatedPatternCard/);
  assert.match(source, /source.scope/);
  assert.doesNotMatch(source, /<details|<summary|dangerouslySetInnerHTML/);
});
