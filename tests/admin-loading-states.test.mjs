import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin loading states reserve layout instead of rendering temporary zero values", async () => {
  const [ui, dashboard] = await Promise.all([
    read("src/components/admin/AdminUI.tsx"),
    read("src/routes/admin.index.tsx"),
  ]);

  assert.match(ui, /function AdminLoadingState/);
  assert.match(ui, /animate-pulse/);
  assert.match(ui, /role="status"/);
  assert.match(dashboard, /<AdminLoadingState label="Loading live workspace"/);
  assert.doesNotMatch(dashboard, /loading \? String\(programs\.length\)/i);
});

test("condition editor distinguishes loading, failure, saved, and publish-blocked states", async () => {
  const route = await read("src/routes/admin.conditions.tsx");

  assert.match(route, /variant="editor" label="Loading conditions"/);
  assert.match(route, /Conditions could not be loaded/);
  assert.match(route, /Unsaved changes/);
  assert.match(route, /All changes saved/);
  assert.match(route, /publish \{issues\.length === 1 \? "issue" : "issues"\}/);
});

test("conditions open from a searchable publication-aware library", async () => {
  const route = await read("src/routes/admin.conditions.tsx");

  assert.match(route, /Search title, category, or body region/);
  assert.match(route, /Filter conditions by publication status/);
  assert.match(route, /Condition library/);
  assert.match(route, /No matching conditions/);
  assert.match(route, /All conditions/);
  assert.doesNotMatch(route, /<select aria-label="Condition"/);
});

test("customer, curriculum, and anatomy workspaces share stable loading states", async () => {
  const [customers, curriculum, anatomy] = await Promise.all([
    read("src/routes/admin.customers.tsx"),
    read("src/components/admin/ProgramCurriculum.tsx"),
    read("src/components/admin/ProgramAnatomyPreview.tsx"),
  ]);

  assert.match(customers, /meta=\{loading \? "Loading account totals"/);
  assert.match(customers, /variant="list" label="Loading customers"/);
  assert.match(curriculum, /variant="list" label="Loading curriculum"/);
  assert.match(anatomy, /variant="editor" label="Loading the existing muscle library"/);
});
