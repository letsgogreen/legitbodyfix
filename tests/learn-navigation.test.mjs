import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = readFileSync(new URL('../src/components/site/SiteNav.tsx', import.meta.url), 'utf8');

test('desktop and mobile Learn links use router navigation and intent preload', () => {
  const links = [...source.matchAll(/l\.href === "\/movement-check" \? <Link([\s\S]*?)>\{l.label\}<\/Link>/g)];
  assert.equal(links.length, 2);
  for (const [, props] of links) {
    assert.match(props, /to="\/movement-check"/);
    assert.match(props, /preload="intent"/);
  }
  assert.match(links[1][1], /onClick=\{\(\) => setOpen\(false\)\}/);
});

test('standalone dictionary retains native navigation without a router context', () => {
  assert.match(source, /nativeNavigation \? NativeLink : RouterLink/);
  assert.match(source, /return <a href=\{to\} \{\.\.\.props\} \/>/);
});
