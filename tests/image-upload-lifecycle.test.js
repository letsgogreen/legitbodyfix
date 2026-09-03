const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const source = ts.createSourceFile("ImageUploadField.tsx", fs.readFileSync(path.join(__dirname, "../src/components/admin/ImageUploadField.tsx"), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let uploadNode;
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === "upload") uploadNode = node;
  ts.forEachChild(node, visit);
}
visit(source);
const code = ts.transpileModule(uploadNode.getText(source), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + "\nupload;";
const image = () => new File(["image"], "cover.png", { type: "image/png" });
function setup(onUploaded, uploadContentImage = async () => ({ url: "https://test.invalid/image.png" })) {
  const state = { busy: false, error: "", message: "", urls: [], requests: 0 };
  const scope = {
    uploadInFlight: { current: false }, MAX_BYTES: 10 * 1024 * 1024,
    ACCEPTED: new Set(["image/png"]), FormData, Error,
    safeName: name => name, folder: "test", bucket: "program-images",
    setUploading: value => { state.busy = value; },
    setError: value => { state.error = value; },
    setMessage: value => { state.message = value; },
    onChange: url => state.urls.push(url), onUploaded,
    uploadContentImage: async args => { state.requests++; return uploadContentImage(args); },
  };
  return { state, upload: vm.runInNewContext(code, scope) };
}
test("busy state lasts through saving and prevents overlapping uploads", async () => {
  let finish;
  let saving;
  const started = new Promise(resolve => { saving = resolve; });
  const pendingSave = new Promise(resolve => { finish = resolve; });
  const { state, upload } = setup(() => { saving(); return pendingSave; });
  const first = upload(image());
  await started;
  assert.equal(state.busy, true);
  await upload(image());
  assert.equal(state.requests, 1);
  finish();
  await first;
  assert.equal(state.busy, false);
  assert.equal(state.error, "");
});
test("async save rejection is displayed and leaves upload available for retry", async () => {
  const { state, upload } = setup(async () => { throw new Error("Save failed"); });
  await upload(image());
  assert.equal(state.error, "Save failed");
  assert.equal(state.busy, false);
  assert.equal(state.message, "");
  await upload(image());
  assert.equal(state.requests, 2);
});
test("storage failure does not change the image or run saving", async () => {
  let saves = 0;
  const { state, upload } = setup(() => { saves++; }, async () => { throw new Error("Storage unavailable"); });
  await upload(image());
  assert.equal(state.error, "Storage unavailable");
  assert.equal(state.busy, false);
  assert.equal(saves, 0);
  assert.deepEqual(state.urls, []);
});
test("upload without auto-save explicitly prompts the user to save", async () => {
  const { state, upload } = setup();
  await upload(image());
  assert.match(state.message, /Save this item/);
  assert.equal(state.urls.length, 1);
});
test("invalid files are rejected before storage access", async () => {
  const { state, upload } = setup();
  await upload(new File(["text"], "test.txt", { type: "text/plain" }));
  assert.match(state.error, /Use a JPG/);
  await upload({ type: "image/png", size: 10 * 1024 * 1024 + 1 });
  assert.match(state.error, /10 MB/);
  assert.equal(state.requests, 0);
  assert.equal(state.busy, false);
});
