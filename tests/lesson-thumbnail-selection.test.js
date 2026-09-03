const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const source = ts.createSourceFile("admin.lessons.tsx", fs.readFileSync(path.join(__dirname, "../src/routes/admin.lessons.tsx"), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function callback(name) {
  let result;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) result = node.initializer;
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(result);
  return ts.transpileModule(`const handler = ${result.getText(source)};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + "\nhandler;";
}
function context() {
  const state = { custom: "uploaded.jpg", stream: "old-stream.jpg", errors: [] };
  const scope = {
    lesson: { id: "lesson1" }, streamUid: "video1", refreshing: false, cancelled: false,
    setThumbnailUrl: url => { state.custom = url; },
    setStreamThumbnailUrl: url => { state.stream = url; },
    setStreamStatus: () => {}, setDuration: () => {}, onChanged: async () => {},
    setError: value => { if (value) state.errors.push(value); },
    setUploading: () => {}, setUploadProgress: () => {}, setStreamUid: () => {},
    setShowStreamLibrary: () => {}, setSaving: () => {}, setThumbnailRevision: () => {},
    thumbnailTime: "5",
    refreshStreamVideo: async () => ({ status: "ready", thumbnailUrl: "new-stream.jpg" }),
    createStreamTusUpload: async () => ({ uid: "video2", uploadURL: "mock-upload" }),
    uploadTusFile: async () => {},
    attachStreamVideo: async () => ({ status: "ready", thumbnailUrl: "attached.jpg" }),
    setStreamThumbnailFrame: async () => ({ thumbnailUrl: "frame5.jpg" }),
  };
  return { state, scope };
}
for (const name of ["poll", "uploadVideo", "attachExisting"]) {
  test(`${name} updates only the Stream fallback, preserving uploaded thumbnail`, async () => {
    const { state, scope } = context();
    const handler = vm.runInNewContext(callback(name), scope);
    await handler({ name: "video.mp4", size: 100, uid: "video2" });
    assert.equal(state.custom, "uploaded.jpg");
    assert.equal(state.stream, name === "attachExisting" ? "attached.jpg" : "new-stream.jpg");
    assert.deepEqual(state.errors, []);
  });
}
test("explicit frame selection replaces both custom and Stream thumbnail", async () => {
  const { state, scope } = context();
  await vm.runInNewContext(callback("useVideoFrame"), scope)();
  assert.equal(state.custom, "frame5.jpg");
  assert.equal(state.stream, "frame5.jpg");
  assert.deepEqual(state.errors, []);
});
