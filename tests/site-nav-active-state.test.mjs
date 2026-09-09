import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const nav = readFileSync(new URL('../src/components/site/SiteNav.tsx', import.meta.url), 'utf8');

test('library underline is applied only while the library route is active', () => {
  assert.match(nav, /function LibraryNavLink/);
  assert.match(nav, /activeProps=\{\{ className: "underline", "aria-current": "page" \}\}/);
  assert.match(nav, /window\.location\.pathname\.startsWith\("\/library"\)/);
  assert.doesNotMatch(nav, /to="\/library" className="[^"]*\bunderline\b/);
});

test('desktop and mobile navigation share the same library active-state component', () => {
  assert.equal((nav.match(/<LibraryNavLink /g) ?? []).length, 2);
});
