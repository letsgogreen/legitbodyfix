import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/assets/js/video-sales.js', import.meta.url), 'utf8');
const load = source.slice(source.lastIndexOf('  Promise.all(['), source.lastIndexOf('})();'));
async function run(catalog, fail = false) {
  let rendered;
  let unavailable = false;
  const requests = [];
  await vm.runInNewContext(load, {
    videoId: 'neck-alignment',
    fetch: async (url, options) => {
      requests.push([url, options.cache]);
      return { ok: !fail, json: async () => url.includes('videos.json') ? [{ id: 'neck-alignment', price: 45 }] : { catalog } };
    },
    isPurchasablePrice: value => typeof value === 'number' && Number.isFinite(value) && value > 0,
    render: video => { rendered = video; },
    showUnavailable: () => { unavailable = true; },
  });
  return { rendered, unavailable, requests };
}
test('sales price comes from checkout even when static JSON is stale', async () => {
  const result = await run([{ id: 'neck-alignment', amount: 69, currency: 'USD' }]);
  assert.equal(result.rendered.price, 69);
  assert.ok(result.requests.every(([, cache]) => cache === 'no-store'));
});
test('missing or invalid checkout price never falls back to stale price', async () => {
  for (const catalog of [[], [{ id: 'neck-alignment', amount: -1, currency: 'USD' }], [{ id: 'neck-alignment', amount: 69, currency: 'EUR' }]]) {
    const result = await run(catalog);
    assert.equal(result.rendered, undefined);
    assert.equal(result.unavailable, true);
  }
});
test('network failure does not advertise an unverified price', async () => {
  const result = await run([], true);
  assert.equal(result.rendered, undefined);
  assert.equal(result.unavailable, true);
});
