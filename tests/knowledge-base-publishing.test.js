"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var publishing = require("../lib/knowledge-base-publishing");

var valid = {
  conditions: [{ id: "round-shoulder", title: "Round shoulder", summary: "A useful clinical summary.", published: true }],
  muscles: [{ id: "serratus-anterior", title: "Serratus anterior", group: "Shoulder & scapula", family: "Scapular stabilizers", origin: "Upper ribs", insertion: "Medial scapula", actions: "Scapular control", imageUrl: "https://example.com/serratus.png", cardImageScale: 1.35, cardImagePosition: "42% 55%", published: true }],
  recipes: [{ id: "wall-reach", title: "Wall reach", steps: "1. Reach.\n2. Reassess.", published: false }]
};

test("knowledge base validation preserves safe versioned records", function () {
  var result = publishing.validateKnowledgeBase(valid);
  assert.equal(result.conditions[0].id, "round-shoulder");
  assert.equal(result.muscles[0].actions, "Scapular control");
  assert.equal(result.muscles[0].family, "Scapular stabilizers");
  assert.equal(result.muscles[0].imageUrl, "https://example.com/serratus.png");
  assert.equal(result.muscles[0].cardImageScale, 1.35);
  assert.equal(result.muscles[0].cardImagePosition, "42% 55%");
  assert.equal(result.recipes[0].published, false);
});

test("knowledge base validation rejects duplicate or unsafe identifiers", function () {
  var input = JSON.parse(JSON.stringify(valid));
  input.conditions.push({ id: "round-shoulder", title: "Duplicate", published: true });
  assert.throws(function () { publishing.validateKnowledgeBase(input); }, function (error) {
    return error.code === "invalid_knowledge_base" && error.details.some(function (detail) { return /unique/.test(detail); });
  });
});

test("knowledge base publisher skips unchanged content", async function () {
  var content = publishing.serializeKnowledgeBase(valid);
  var calls = 0;
  var result = await publishing.publishKnowledgeBase({ token: "token", repository: "owner/repo", branch: "main" }, valid, async function () {
    calls += 1;
    return { ok: true, json: async function () { return { sha: "abc", content: Buffer.from(content).toString("base64") }; } };
  });
  assert.equal(calls, 1);
  assert.equal(result.unchanged, true);
});

test("knowledge base publisher creates a versioned GitHub update", async function () {
  var requests = [];
  var result = await publishing.publishKnowledgeBase({ token: "token", repository: "owner/repo", branch: "main" }, valid, async function (url, options) {
    requests.push({ url: url, options: options });
    if (options.method === "GET") return { ok: true, json: async function () { return { sha: "old", content: Buffer.from("{}\n").toString("base64") }; } };
    return { ok: true, json: async function () { return { commit: { sha: "new", html_url: "https://github.test/commit/new" } }; } };
  });
  assert.equal(requests.length, 2);
  assert.equal(JSON.parse(requests[1].options.body).message, "Update knowledge base from admin");
  assert.equal(result.commitSha, "new");
});
