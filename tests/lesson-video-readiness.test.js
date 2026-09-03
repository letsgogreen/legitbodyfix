const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../src/lib/lesson-video-readiness.ts"), "utf8");
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context);
const { isLessonVideoReady } = context.exports;

test("counts Stream-ready videos without a legacy video path", () => {
  const lessons = Array.from({ length: 4 }, (_, i) => ({
    stream_uid: `video-${i}`, stream_status: "ready", video_path: null,
  }));
  assert.equal(lessons.filter(isLessonVideoReady).length, 4);
});

test("does not count processing, failed, or unidentified videos as ready", () => {
  for (const lesson of [
    { stream_uid: "video", stream_status: "processing" },
    { stream_uid: "video", stream_status: "error" },
    { stream_uid: null, stream_status: "ready" },
    { stream_uid: "", stream_status: "ready" },
    { stream_uid: "  ", stream_status: "ready" },
    { stream_uid: null, stream_status: "empty", video_path: "legacy.mp4" },
  ]) assert.equal(isLessonVideoReady(lesson), false);
});

test("readiness is independent of publication and counts each lesson once", () => {
  assert.equal(isLessonVideoReady({ stream_uid: "video", stream_status: "ready", published: false, video_path: "legacy.mp4" }), true);
});

test("dashboard summary and program rows share the same readiness predicate", () => {
  const dashboard = fs.readFileSync(path.join(__dirname, "../src/routes/admin.index.tsx"), "utf8");
  assert.match(dashboard, /lessons\.filter\(isLessonVideoReady\)/);
  assert.match(dashboard, /curriculum\.filter\(isLessonVideoReady\)/);
  assert.doesNotMatch(dashboard, /with video|\.video_path/);
});
