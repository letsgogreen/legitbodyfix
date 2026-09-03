const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

test("price-save callback updates both IDs and refreshes through the drawer prop", () => {
  const source = ts.createSourceFile(
    "admin.programs.tsx",
    fs.readFileSync(path.join(__dirname, "../src/routes/admin.programs.tsx"), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let callback;
  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(source) === "PaddlePricePanel") {
      const attribute = node.attributes.properties.find(
        (item) => ts.isJsxAttribute(item) && item.name.getText(source) === "onChanged",
      );
      callback = attribute.initializer.expression;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(callback, "The price panel must notify the drawer after saving");
  const updates = [];
  let refreshes = 0;
  const handler = vm.runInNewContext(`(${callback.getText(source)})`, {
    update: (key, value) => updates.push([key, value]),
    onRefresh: () => { refreshes++; return Promise.resolve(); },
  });
  handler({ productId: "pro_test", priceId: "pri_test" });
  assert.deepEqual(updates, [
    ["paddle_product_id", "pro_test"],
    ["paddle_price_id", "pri_test"],
  ]);
  assert.equal(refreshes, 1);
});
