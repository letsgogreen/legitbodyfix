const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

function accessReader(user, queryError = null, authError = null) {
  const filters = [];
  const query = {
    select() { return query; },
    eq(key, value) { filters.push([key, value]); return query; },
    then(resolve) { return Promise.resolve({ data: [{ program_id: "owned" }], error: queryError }).then(resolve); },
  };
  const supabase = {
    auth: { getUser: async () => ({ data: { user }, error: authError }) },
    from: () => query,
  };
  const context = { exports: {}, require: () => ({ supabase }) };
  vm.runInNewContext(ts.transpileModule(read("src/lib/customer-access.ts"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  return { readAccess: context.exports.getCustomerAccess, filters };
}

test("ownership is scoped to the signed-in user even for administrators", async () => {
  const { readAccess, filters } = accessReader({ id: "current-user" });
  const result = await readAccess();
  assert.deepEqual([...result.programIds], ["owned"]);
  assert.deepEqual(filters, [["user_id", "current-user"], ["active", true]]);
});

test("signed-out visitors do not query entitlements", async () => {
  const { readAccess, filters } = accessReader(null, null, { name: "AuthSessionMissingError" });
  assert.equal((await readAccess()).programIds.length, 0);
  assert.equal(filters.length, 0);
});

test("access lookup failures propagate instead of allowing a purchase", async () => {
  const { readAccess } = accessReader({ id: "current-user" }, new Error("Unavailable"));
  await assert.rejects(readAccess(), /Unavailable/);
});

test("site navigation always exposes the customer library entry", () => {
  const source = read("src/components/site/SiteNav.tsx");
  assert.match(source, /to="\/library"/);
  assert.match(source, /Sign in \/ Join/);
  assert.match(source, /My library/);
});

test("checkout verifies current ownership before initializing a purchase", () => {
  const source = read("src/components/site/FeaturedPrograms.tsx");
  const verify = source.indexOf("await getCustomerAccess()");
  const open = source.indexOf("paddle.Checkout.open");
  assert.ok(verify !== -1 && open !== -1 && verify < open);
  assert.match(source, /programIds\.includes\(program\.id\)/);
  assert.match(source, /Watch program/);
  assert.match(source, /Could not verify your access/);
});

test("customer entitlement queries are explicitly scoped to the authenticated user", () => {
  const source = read("src/lib/customer-access.ts");
  assert.match(source, /\.eq\("user_id", user\.id\)\.eq\("active", true\)/);
});

test("published lessons remain reachable when their module is not public", () => {
  const source = read("src/routes/library.$programSlug.tsx");
  assert.match(source, /!lesson\.module_id \|\| !modules\.some/);
});
