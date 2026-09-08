import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { conditionSchema, conditionIssues, mergeConditions } from "../src/lib/conditions.ts";
const catalog = JSON.parse(readFileSync(new URL("../public/assets/data/knowledge-base.json", import.meta.url)));
const originals = catalog.conditions;
test("all eight existing condition guides survive without CMS data", () => {
  assert.equal(mergeConditions(originals, []).length, 8);
});
test("shoulder dislocation links to the real shoulder sales page", () => {
  const shoulder = mergeConditions(originals, []).find(item => item.id === "shoulder-dislocation-recovery");
  assert.equal(shoulder.relatedVideoIds, "shoulder-movement");
  const videos = JSON.parse(readFileSync(new URL("../public/assets/data/videos.json", import.meta.url)));
  assert.ok(videos.find(item => item.id === shoulder.relatedVideoIds));
});
test("published snapshots replace legacy content without duplicates", () => {
  const first = mergeConditions(originals, [])[0];
  const result = mergeConditions(originals, [{ slug: first.id, data: { ...first, title: "Updated" }, published: true }]);
  assert.equal(result.length, 8);
  assert.equal(result.find(item => item.id === first.id).title, "Updated");
});
test("unpublish tombstone suppresses legacy fallback", () => {
  const first = mergeConditions(originals, [])[0];
  assert.equal(mergeConditions(originals, [{ slug: first.id, data: {}, published: false }]).length, 7);
});
test("malformed publication cannot crash or revive its legacy record", () => {
  const first = mergeConditions(originals, [])[0];
  assert.equal(mergeConditions(originals, [{ slug: first.id, data: null, published: true }]).length, 7);
});
test("incomplete drafts parse but cannot publish", () => {
  const draft = conditionSchema.parse({ id: "test-condition" });
  assert.equal(conditionIssues(draft).length, 5);
});
test("unsafe source and malformed video block block publishing", () => {
  const first = mergeConditions(originals, [])[0];
  assert.ok(conditionIssues({ ...first, sourceUrl: "javascript:alert(1)", content_blocks: [{ id: "video", type: "youtube", url: "https://evil.test", caption: "" }] }).length >= 2);
});
