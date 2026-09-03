const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.join(__dirname, "..");
function load(file, imports) {
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: (name) => imports[name] ?? require(name) });
  return exports;
}
const { bodyRegions } = load("src/data/body-regions.ts", {});

for (let selected = 0; selected < 6; selected++) {
  test(`all six regions remain direct links when ${bodyRegions[selected].title} is selected`, () => {
    let hook = 0;
    const { BodyRegionGrid } = load("src/components/site/BodyRegionGrid.tsx", {
      react: {
        ...React,
        useState: (initial) => [hook++ === 0 ? selected : initial, () => {}],
        useEffect: () => {},
        useMemo: (compute) => compute(),
      },
      "@/data/body-regions": { bodyRegions },
      "@/integrations/supabase/client": { supabase: {} },
      "@tanstack/react-router": {
        Link: ({ to, search, children, ...props }) =>
          React.createElement("a", { ...props, href: `${to}?region=${search.region}` }, children),
      },
    });
    const html = renderToStaticMarkup(React.createElement(BodyRegionGrid));
    const list = html.match(/<ul[\s\S]*?<\/ul>/)[0];
    assert.equal((list.match(/<a /g) ?? []).length, 6);
    assert.doesNotMatch(list, /<button/);
    for (const region of bodyRegions) {
      assert.ok(list.includes(`href="/movement-check?region=${region.slug}"`));
    }
    assert.equal((list.match(/bg-ink text-ink-foreground/g) ?? []).length, 1);
    assert.equal((list.match(/focus-visible:outline-offset-2/g) ?? []).length, 6);
    assert.ok(html.includes(`Selected · ${bodyRegions[selected].title.replaceAll("&", "&amp;")}`));
  });
}
