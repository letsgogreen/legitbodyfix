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
  assert.match(html, /Muscle dictionary/);
  assert.match(html, /muscle-dictionary\.css/);
  assert.match(html, /data-muscle-region="lower-leg-foot"/);
  assert.match(html, /data-muscle-region="head-neck"/);
  assert.match(html, /data-muscle-region="shoulder-arm"/);
  assert.match(html, /id="knowledgePaths"/);
  assert.match(html, /id="muscleAtlas"/);
  assert.match(html, /knowledge-organization\.css/);
  assert.match(html, /id="muscleSort"/);
  assert.match(javascript, /item\.published !== false/);
  assert.match(javascript, /textContent = text/);
  assert.match(javascript, /URLSearchParams/);
  assert.match(javascript, /relatedVideoIds/);
  assert.match(javascript, /video\.html\?id=/);
  assert.match(javascript, /assets\/data\/videos\.json/);
  assert.match(javascript, /Functions and actions/);
  assert.match(javascript, /function muscleRegion/);
  assert.match(javascript, /localeCompare/);
  assert.match(javascript, /detail-anatomy-image/);
  assert.match(javascript, /Regional anatomy reference/);
  assert.match(javascript, /Special:FilePath\/Gray378\.png/);
  assert.match(javascript, /\^https:/);
  assert.doesNotMatch(javascript, /innerHTML/);
  assert.doesNotMatch(javascript, /\["steps",\s*"Sequence"\]/);
});

test("muscle dictionary records include anatomy fields, visual orientation, and references", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  assert.ok(data.muscles.length >= 60);
  data.muscles.forEach(function (muscle) {
    assert.ok(muscle.origin, muscle.id + " needs an origin");
    assert.ok(muscle.insertion, muscle.id + " needs an insertion");
    assert.ok(muscle.actions, muscle.id + " needs functions and actions");
    assert.ok(muscle.imageUrl || muscle.bodyMap, muscle.id + " needs an image or body map");
    if (muscle.imageUrl) {
      assert.match(muscle.imageUrl, /^https:\/\//);
      assert.ok(muscle.imageAlt);
      assert.ok(muscle.imageCredit);
      assert.match(muscle.imageCreditUrl, /^https:\/\//);
    }
    assert.ok(muscle.sourceName, muscle.id + " needs a reference name");
    assert.match(muscle.sourceUrl, /^https:\/\//);
  });
});

test("muscle dictionary covers the major whole-body regions", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  assert.ok(data.muscles.filter(function (muscle) { return muscle.imageUrl; }).length >= 52, "needs extensive muscle-specific illustration coverage");
  var bodyMaps = new Set(data.muscles.map(function (muscle) { return muscle.bodyMap; }).filter(Boolean));
  ["head-neck", "shoulder", "chest", "forearm", "abdomen", "back", "hip-front", "hip-back", "thigh-front", "thigh-back", "lower-leg-front", "lower-leg-back", "foot"].forEach(function (bodyMap) {
    assert.ok(bodyMaps.has(bodyMap), "missing muscle coverage for " + bodyMap);
  });
  ["supraspinatus", "internal-oblique", "gluteus-minimus", "tibialis-posterior", "intrinsic-foot-muscles"].forEach(function (id) {
    assert.ok(data.muscles.some(function (muscle) { return muscle.id === id; }), "missing foundational muscle " + id);
  });
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
