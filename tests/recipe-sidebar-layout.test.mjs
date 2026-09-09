import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = readFileSync(new URL('../src/routes/admin.recipes.$recipeId.tsx', import.meta.url), 'utf8');

test('cover upload precedes the desktop draft preview', () => {
  const upload = source.indexOf('<ImageUploadField');
  const preview = source.indexOf('<DraftPreview', upload);
  assert.ok(upload > 0 && preview > upload);
  assert.ok(source.includes('<Panel className="hidden p-4 xl:block">\n            <DraftPreview'));
});

test('desktop preview does not stick over image and relationship controls', () => {
  assert.doesNotMatch(source, /<Panel[^>]*className="[^"]*(?:sticky|z-10)[^"]*">\s*<DraftPreview/);
  assert.match(source, /bucket="recipe-images"/);
});
