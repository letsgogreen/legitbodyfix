import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assetVersion, stampPublicAssets } from '../scripts/version-public-assets.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'recipe-assets-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'assets/js'), { recursive: true });
  mkdirSync(join(root, 'assets/css'), { recursive: true });
  const files = {
    'knowledge.html': '<script src="assets/js/knowledge.js?v=old"></script><link href="assets/css/knowledge.css?v=old"><a href="/start">Start</a>',
    'video.html': '<script src="assets/js/video-sales.js?v=old"></script><link href="assets/css/video-sales.css?v=old">',
    'assets/js/knowledge.js': "import './muscle-directory-data.js?v=old';",
    'assets/js/muscle-directory-data.js': 'export const groups = [];',
    'assets/js/video-sales.js': 'const price = 69;',
    'assets/css/video-sales.css': 'body { color: black; }',
    'assets/css/knowledge.css': 'nav { display: flex; }',
  };
  for (const [name, content] of Object.entries(files)) writeFileSync(join(root, name), content);
  return root;
}

test('generated HTML and nested imports share a stable version', t => {
  const root = fixture(t);
  const version = stampPublicAssets(root);
  for (const name of ['knowledge.html', 'video.html', 'assets/js/knowledge.js']) {
    const contents = readFileSync(join(root, name), 'utf8');
    const versions = [...contents.matchAll(/\?v=([\w-]+)/g)].map(match => match[1]);
    assert.ok(versions.length);
    assert.ok(versions.every(value => value === version));
  }
  assert.equal(stampPublicAssets(root), version);
  assert.match(readFileSync(join(root, 'knowledge.html'), 'utf8'), /href="\/start"/);
});

test('a nested module update invalidates HTML and import references', t => {
  const root = fixture(t);
  const before = stampPublicAssets(root);
  writeFileSync(join(root, 'assets/js/muscle-directory-data.js'), 'export const groups = ["Upper back"];');
  const after = stampPublicAssets(root);
  assert.notEqual(after, before);
  for (const name of ['knowledge.html', 'video.html', 'assets/js/knowledge.js']) {
    const contents = readFileSync(join(root, name), 'utf8');
    assert.ok(contents.includes(`?v=${after}`));
    assert.ok(!contents.includes(`?v=${before}`));
  }
});

test('asset versions are stable across repeated stamping', () => {
  assert.equal(assetVersion(["import './data.js?v=old';"]), assetVersion(["import './data.js?v=123abc';"]));
});
test('JS and CSS changes invalidate versions', () => {
  assert.notEqual(assetVersion(['old JS', 'CSS']), assetVersion(['new JS', 'CSS']));
  assert.notEqual(assetVersion(['JS', 'old CSS']), assetVersion(['JS', 'new CSS']));
});
test('version is a URL-safe content fingerprint', () => {
  assert.match(assetVersion(['source']), /^[a-f0-9]{16}$/);
});

test('a missing HTML target fails before any existing target is rewritten', t => {
  const root = fixture(t);
  const path = join(root, 'knowledge.html');
  const original = readFileSync(path, 'utf8');
  rmSync(join(root, 'video.html'));
  assert.throws(() => stampPublicAssets(root), { code: 'ENOENT' });
  assert.equal(readFileSync(path, 'utf8'), original);
});
