"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

var root = path.join(__dirname, "..");

test("public knowledge hub exposes searchable published education safely", function () {
  var html = fs.readFileSync(path.join(root, "knowledge.html"), "utf8");
  var javascript = fs.readFileSync(path.join(root, "assets/js/knowledge.js"), "utf8");

  assert.match(html, /id="knowledgeGrid"/);
  assert.match(html, /public-responsive-fixes\.css/);
  assert.match(html, /data-knowledge-filter="conditions"/);
  assert.match(html, /Complete follow-along progressions stay inside the paid programs/);
  assert.match(html, /How movement guides help/);
  assert.match(html, /Program previews/);
  assert.match(javascript, /item\.published !== false/);
  assert.match(javascript, /textContent = text/);
  assert.match(javascript, /URLSearchParams/);
  assert.match(javascript, /relatedVideoIds/);
  assert.match(javascript, /video\.html\?id=/);
  assert.match(javascript, /assets\/data\/videos\.json/);
  assert.doesNotMatch(javascript, /innerHTML/);
  assert.doesNotMatch(javascript, /\["steps",\s*"Sequence"\]/);
});

test("published knowledge records link to existing purchasable sessions", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  var videos = JSON.parse(fs.readFileSync(path.join(root, "assets/data/videos.json"), "utf8"));
  var videoIds = new Set(videos.filter(function (video) { return video.published !== false; }).map(function (video) { return video.id; }));

  ["conditions", "muscles", "recipes"].forEach(function (type) {
    data[type].filter(function (item) { return item.published; }).forEach(function (item) {
      String(item.relatedVideoIds || "").split(",").map(function (id) { return id.trim(); }).filter(Boolean).forEach(function (id) {
        assert.ok(videoIds.has(id), type + " record " + item.id + " references a missing session");
      });
    });
  });
});

test("knowledge seed data provides unique public identifiers", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  ["conditions", "muscles", "recipes"].forEach(function (type) {
    assert.ok(Array.isArray(data[type]) && data[type].length > 0);
    assert.equal(new Set(data[type].map(function (item) { return item.id; })).size, data[type].length);
    data[type].forEach(function (item) { assert.ok(item.title); assert.equal(typeof item.published, "boolean"); });
  });
});
