import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../public/knowledge.html', import.meta.url), 'utf8');
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
for (const [query, pending] of [['?type=muscles', true], ['?type=muscles&id=trapezius', true], ['?type=all', false]]) {
  test(`initial view ${query}`, () => {
    const attributes = new Map();
    vm.runInNewContext(bootstrap, {
      URLSearchParams,
      window: { location: { search: query, hash: '' } },
      document: { documentElement: { setAttribute: (key, value) => attributes.set(key, value) } },
    });
    assert.equal(attributes.has('data-muscle-loading'), pending);
  });
}
test('ready content is revealed only after URL selection', () => {
  const js = readFileSync(new URL('../public/assets/js/knowledge.js', import.meta.url), 'utf8');
  assert.match(js, /openFromUrl\(\);\s*document\.documentElement\.removeAttribute\("data-muscle-loading"\)/);
  assert.match(html, /html\[data-muscle-loading\] #main \{ display: none; \}/);
});
