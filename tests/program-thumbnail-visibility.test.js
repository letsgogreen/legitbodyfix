const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function fixture({ cover = null, publishedThumbnail = "public.jpg", publicLesson = true } = {}) {
  const tables = {
    programs: [{ id: "p1", slug: "test", name: "Test", published: true, image_url: cover, image_alt: "Cover", paddle_price_id: null }],
    program_modules: [],
    lessons: [
      { id: "draft", program_id: "p1", position: 0, published: false, thumbnail_url: "private.jpg" },
      { id: "live", program_id: "p1", position: 1, published: publicLesson, thumbnail_url: publishedThumbnail, stream_thumbnail_url: "stream.jpg" },
    ],
  };
  const reads = [];
  const client = { from(table) {
    reads.push(table);
    let rows = [...tables[table]];
    const query = {
      select() { return query; },
      eq(key, value) { rows = rows.filter(row => row[key] === value); return query; },
      in(key, values) { rows = rows.filter(row => values.includes(row[key])); return query; },
      order(key) { rows.sort((a, b) => (a[key] ?? 0) > (b[key] ?? 0) ? 1 : -1); return query; },
      maybeSingle() { return Promise.resolve({ data: rows[0] ?? null, error: null }); },
      then(resolve, reject) { return Promise.resolve({ data: rows, error: null }).then(resolve, reject); },
    };
    return query;
  } };
  const source = fs.readFileSync(path.join(__dirname, "../src/lib/public-programs.functions.ts"), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  const imports = {
    "@tanstack/react-start": { createServerFn: () => {
      const builder = { middleware: () => builder, validator: () => builder, handler: fn => fn };
      return builder;
    } },
    "@supabase/supabase-js": { createClient: () => client },
    "@/lib/paddle.functions": { fetchPaddlePrices: async () => ({}) },
    "@/integrations/supabase/auth-middleware": { requireSupabaseAuth: {} },
    "@/integrations/supabase/client.server": { supabaseAdmin: client },
  };
  vm.runInNewContext(output, { exports, require: name => {
    assert.ok(name in imports, `Unexpected dependency: ${name}`);
    return imports[name];
  } });
  return { api: exports, client, reads };
}

for (const options of [
  { expected: "public.jpg" },
  { cover: "cover.jpg", expected: "cover.jpg" },
  { publishedThumbnail: null, expected: "stream.jpg" },
  { publicLesson: false, expected: null },
]) {
  test(`public list and detail use the same published cover fallback: ${JSON.stringify(options)}`, async () => {
    const { api, reads } = fixture(options);
    const list = await api.getPublicPrograms();
    const detail = await api.getPublicProgramDetail({ data: { slug: "test" } });
    assert.equal(list[0].imageUrl, options.expected);
    assert.equal(detail.imageUrl, options.expected);
    assert.ok(detail.lessons.every(lesson => lesson.id !== "draft"));
    assert.equal(reads.filter(table => table === "lessons").length, 2, "One lesson read per public request");
  });
}

test("authorized admin preview retains draft thumbnails", async () => {
  const { api, client } = fixture();
  const preview = await api.getAdminProgramPreview({ data: { slug: "test" }, context: {
    supabase: client,
    claims: { email: "thriveinside@protonmail.com", app_metadata: { is_admin: true } },
  } });
  assert.equal(preview.imageUrl, "private.jpg");
  assert.equal(preview.lessons.length, 2);
});

test("admin preview rejects non-admin claims", async () => {
  const { api, client } = fixture();
  await assert.rejects(api.getAdminProgramPreview({ data: { slug: "test" }, context: {
    supabase: client, claims: { app_metadata: { is_admin: false } },
  } }), /Administrator access required/);
});
