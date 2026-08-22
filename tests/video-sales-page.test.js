"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

var root = path.join(__dirname, "../public");

test("every video has editable persuasive landing-page content", function () {
  var videos = JSON.parse(fs.readFileSync(path.join(root, "assets/data/videos.json"), "utf8"));
  var knowledge = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  var muscleIds = new Set(knowledge.muscles.filter(function (muscle) { return muscle.published !== false; }).map(function (muscle) { return muscle.id; }));
  var muscleGroupIds = new Set(knowledge.muscles.filter(function (muscle) { return muscle.published !== false; }).map(function (muscle) {
    return String(muscle.family || muscle.group || "").toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }).filter(Boolean));
  var fields = ["landingEyebrow", "landingHeadline", "landingSummary", "landingBenefit1", "landingBenefit2", "landingBenefit3", "landingAudience", "landingReassurance"];

  videos.forEach(function (video) {
    fields.forEach(function (field) {
      assert.equal(typeof video[field], "string", video.id + " is missing " + field);
      assert.ok(video[field].trim().length > 0, video.id + " has empty " + field);
    });
    assert.ok(Array.isArray(video.relatedMuscleGroupIds), video.id + " is missing relatedMuscleGroupIds");
    assert.ok(video.relatedMuscleGroupIds.length >= 1 && video.relatedMuscleGroupIds.length <= 4, video.id + " should feature 1-4 muscle groups");
    video.relatedMuscleGroupIds.forEach(function (id) {
      assert.ok(muscleGroupIds.has(id), video.id + " references missing muscle group " + id);
    });
    assert.ok(Array.isArray(video.relatedMuscleIds), video.id + " is missing relatedMuscleIds");
    assert.ok(video.relatedMuscleIds.length >= 3 && video.relatedMuscleIds.length <= 8, video.id + " should feature 3-8 muscles");
    video.relatedMuscleIds.forEach(function (id) {
      assert.ok(muscleIds.has(id), video.id + " references missing muscle " + id);
    });
  });
});

test("sales page links to checkout without exposing protected playback data", function () {
  var page = fs.readFileSync(path.join(root, "video.html"), "utf8");
  var script = fs.readFileSync(path.join(root, "assets/js/video-sales.js"), "utf8");
  var styles = fs.readFileSync(path.join(root, "assets/css/video-sales.css"), "utf8");

  assert.match(page, /class="button button-lime checkout-link"/);
  assert.match(page, /The full session stays protected/);
  assert.match(page, /Included with purchase/);
  assert.match(page, /Simple access/);
  assert.match(page, /Questions, answered/);
  assert.match(page, /id="relatedKnowledge"/);
  assert.match(page, /id="musclesMatter"/);
  assert.match(page, /The muscles that matter/);
  assert.match(page, /Understand the movement before you practice/);
  assert.match(page, /class="mobile-checkout"/);
  assert.match(page, /class="quick-facts"/);
  assert.match(page, /Secure checkout/);
  assert.match(script, /checkout\.html\?product=/);
  assert.match(script, /setText\("mobilePrice"/);
  assert.match(script, /knowledge-base\.json/);
  assert.match(script, /knowledge\.html\?type=/);
  assert.match(script, /relatedVideoIds/);
  assert.match(script, /relatedMuscleIds/);
  assert.match(script, /relatedMuscleGroupIds/);
  assert.match(script, /createMuscleCard/);
  assert.match(script, /renderMusclesThatMatter/);
  assert.match(script, /shoulder-reset/);
  assert.match(script, /ankle-sprain-rehabilitation/);
  assert.doesNotMatch(script, /streamVideoId/);
  assert.doesNotMatch(script, /videoUrl/);
  assert.doesNotMatch(script, /innerHTML/);
  assert.doesNotMatch(styles, /var\(--[a-z-]+}/, "CSS custom properties must close with a parenthesis");
});

test("admin can preserve and edit landing-page fields", function () {
  var page = fs.readFileSync(path.join(root, "admin.html"), "utf8");
  var script = fs.readFileSync(path.join(root, "assets/js/admin.js"), "utf8");

  assert.match(page, /name="landingHeadline"/);
  assert.match(page, /name="landingBenefit3"/);
  assert.match(page, /name="landingReassurance"/);
  assert.match(page, /class="sales-muscle-selector/);
  assert.match(page, /class="sales-muscle-search/);
  assert.match(page, /class="sales-muscle-group-options/);
  assert.match(script, /landingHeadline:/);
  assert.match(script, /landingReassurance:/);
  assert.match(script, /relatedMuscleIds:/);
  assert.match(script, /relatedMuscleGroupIds:/);
  assert.match(script, /legacyIds:/);
});

test("admin gives every session a dedicated sales-page editor and safe live preview", function () {
  var page = fs.readFileSync(path.join(root, "admin.html"), "utf8");
  var script = fs.readFileSync(path.join(root, "assets/js/admin.js"), "utf8");
  var styles = fs.readFileSync(path.join(root, "assets/css/admin.css"), "utf8");

  assert.match(page, /data-editor-tab="details"/);
  assert.match(page, /data-editor-tab="sales"/);
  assert.match(page, /data-editor-tab="media"/);
  assert.match(page, /data-editor-panel="sales"/);
  assert.match(page, /class="sales-page-preview-card"/);
  assert.match(page, /class="sales-preview-muscles"/);
  assert.match(page, /Open full preview/);
  assert.match(script, /function updateSalesPagePreview/);
  assert.match(script, /video\.html\?id=/);
  assert.match(script, /function showEditorPanel/);
  assert.match(script, /function renderMuscleSelector/);
  assert.match(script, /function muscleGroupCatalog/);
  assert.match(script, /knowledge-base\.json/);
  assert.match(script, /item\.textContent = benefit/);
  assert.doesNotMatch(script, /sales-preview[^\n]+innerHTML/);
  assert.match(styles, /\.sales-page-editor-layout/);
  assert.match(styles, /\.sales-muscle-selector/);
});
