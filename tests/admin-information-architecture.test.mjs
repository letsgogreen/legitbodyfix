import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routes = new URL("../src/routes/", import.meta.url);
const read = (name) => readFileSync(new URL(name, routes), "utf8");

test("daily content libraries keep import and legacy utilities out of primary actions", () => {
  const movement = read("admin.recipes.index.tsx");
  const muscles = read("admin.muscles.index.tsx");

  assert.doesNotMatch(movement, /Notion import|Legacy guide links/);
  assert.doesNotMatch(muscles, /Bulk import/);
  assert.match(movement, /Collect sources/);
});

test("retired utilities stay out of the visible admin navigation", () => {
  const shell = read("admin.tsx");

  assert.doesNotMatch(shell, /Advanced tools/);
  assert.doesNotMatch(shell, /\/admin\/tools/);
});

test("dashboard hides healthy integration noise and permanent refresh controls", () => {
  const dashboard = read("admin.index.tsx");

  assert.match(dashboard, /hasIntegrationBlockers\(integrations\)/);
  assert.match(dashboard, /actions=\{error \?/);
  assert.doesNotMatch(dashboard, /label: "Lessons"/);
});
