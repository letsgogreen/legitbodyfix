const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const admin = { email: "thriveinside@protonmail.com", app_metadata: { is_admin: true } };
const buckets = ["content-images", "program-images", "lesson-images", "recipe-images", "muscle-images", "region-images"];
function form({ bucket = "program-images", type = "image/png", size = 4 } = {}) {
  const data = new FormData();
  data.set("file", new File([new Uint8Array(size)], "Cover Photo.png", { type }));
  data.set("folder", "Program Covers/p1");
  data.set("bucket", bucket);
  return data;
}
function fixture({ serviceUnavailable = false, uploadError = null, missingBucket = false, publicBucket = true, metadataHidden = false } = {}) {
  const calls = [];
  function client(kind) {
    return { storage: {
      getBucket: async bucket => { calls.push({ operation: "getBucket", kind, bucket }); return { data: missingBucket || metadataHidden ? null : { name: bucket, public: publicBucket }, error: null }; },
      createBucket: async (bucket, options) => { calls.push({ operation: "createBucket", kind, bucket, options }); return { error: null }; },
      from: bucket => ({
        upload: async (objectPath, file, options) => { calls.push({ operation: "upload", kind, bucket, objectPath, options }); return { error: uploadError ? new Error(uploadError) : null }; },
        getPublicUrl: objectPath => ({ data: { publicUrl: `https://storage.invalid/${bucket}/${objectPath}` } }),
      }),
    } };
  }
  const session = client("session");
  const service = client("service");
  const source = fs.readFileSync(path.join(__dirname, "../src/lib/content-images.functions.ts"), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  const imports = {
    zod: require("zod"),
    "@/integrations/supabase/auth-middleware": { requireSupabaseAuth: {} },
    "@tanstack/react-start": { createServerFn: () => {
      let validate;
      const builder = { middleware: () => builder, validator: fn => { validate = fn; return builder; }, handler: fn => args => fn({ ...args, data: validate(args.data) }) };
      return builder;
    } },
  };
  vm.runInNewContext(output, { exports, FormData, File, Error, URL, require: name => {
    if (name === "@/integrations/supabase/client.server") {
      if (serviceUnavailable) throw new Error("Service key unavailable");
      return { supabaseAdmin: service };
    }
    assert.ok(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  } });
  return { calls, upload: async (data = form(), claims = admin) => exports.uploadContentImage({ data, context: { claims, supabase: session } }) };
}
for (const bucket of buckets) {
  test(`uploads to the requested allowed bucket: ${bucket}`, async () => {
    const { upload, calls } = fixture();
    const result = await upload(form({ bucket }));
    assert.equal(result.bucket, bucket);
    assert.match(result.path, /^program-covers\/p1\/\d+-cover-photo\.png$/);
    assert.equal(result.url, `https://storage.invalid/${bucket}/${result.path}`);
    const write = calls.find(call => call.operation === "upload");
    assert.equal(write.kind, "service");
    assert.equal(write.options.upsert, false);
    assert.equal(write.options.contentType, "image/png");
  });
}
test("rejects non-admin claims before any storage access", async () => {
  const { upload, calls } = fixture();
  for (const claims of [{}, { email: admin.email }, { email: "other@example.com", app_metadata: { is_admin: true } }]) {
    await assert.rejects(upload(form(), claims), /Administrator access required/);
  }
  assert.equal(calls.length, 0);
});
test("rejects unsupported buckets, file types and oversized files before storage", async () => {
  const { upload, calls } = fixture();
  await assert.rejects(upload(form({ bucket: "lesson-videos" })));
  await assert.rejects(upload(form({ type: "image/svg+xml" })), /Use a JPG/);
  await assert.rejects(upload(form({ size: 10 * 1024 * 1024 + 1 })), /10 MB/);
  assert.equal(calls.length, 0);
});
test("requires form data and a file", async () => {
  const { upload, calls } = fixture();
  await assert.rejects(upload({}), /form data/);
  const data = form(); data.delete("file");
  await assert.rejects(upload(data), /Choose an image/);
  assert.equal(calls.length, 0);
});
test("service setup failure uses the authenticated session instead", async () => {
  const { upload, calls } = fixture({ serviceUnavailable: true });
  await upload();
  assert.equal(calls.find(call => call.operation === "upload").kind, "session");
});
test("missing bucket is created with bounded image-only settings", async () => {
  const { upload, calls } = fixture({ missingBucket: true });
  await upload();
  const create = calls.find(call => call.operation === "createBucket");
  assert.equal(create.options.public, true);
  assert.equal(create.options.fileSizeLimit, 10 * 1024 * 1024);
  assert.ok(create.options.allowedMimeTypes.every(type => type.startsWith("image/")));
});
test("missing-bucket errors identify the requested bucket and return no success URL", async () => {
  const { upload } = fixture({ serviceUnavailable: true, uploadError: "Bucket not found" });
  await assert.rejects(upload(form({ bucket: "lesson-images" })), /public Supabase Storage bucket named lesson-images/);
});
test("RLS failures remain errors rather than successful uploads", async () => {
  const { upload } = fixture({ uploadError: "new row violates row-level security policy" });
  await assert.rejects(upload(), /row-level security/);
});

for (const serviceUnavailable of [false, true]) {
  test(`known-private image bucket is rejected without upload or permission changes (session fallback: ${serviceUnavailable})`, async () => {
    const { upload, calls } = fixture({ publicBucket: false, serviceUnavailable });
    await assert.rejects(upload(), /Image bucket program-images is private/);
    assert.ok(calls.every(call => call.operation === "getBucket"));
  });
}

test("session fallback remains usable when RLS hides bucket metadata", async () => {
  const { upload, calls } = fixture({ serviceUnavailable: true, metadataHidden: true });
  await upload();
  assert.equal(calls.find(call => call.operation === "upload").kind, "session");
});
