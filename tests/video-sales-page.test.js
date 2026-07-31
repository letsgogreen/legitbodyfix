"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

var root = path.join(__dirname, "..");

test("every video has editable persuasive landing-page content", function () {
  var videos = JSON.parse(fs.readFileSync(path.join(root, "assets/data/videos.json"), "utf8"));
  var fields = ["landingEyebrow", "landingHeadline", "landingSummary", "landingBenefit1", "landingBenefit2", "landingBenefit3", "landingAudience", "landingReassurance"];

  videos.forEach(function (video) {
    fields.forEach(function (field) {
      assert.equal(typeof video[field], "string", video.id + " is missing " + field);
      assert.ok(video[field].trim().length > 0, video.id + " has empty " + field);
    });
  });
});

test("sales page links to checkout without exposing protected playback data", function () {
  var page = fs.readFileSync(path.join(root, "video.html"), "utf8");
  var script = fs.readFileSync(path.join(root, "assets/js/video-sales.js"), "utf8");

  assert.match(page, /class="button button-lime checkout-link"/);
  assert.match(page, /Protected full session/);
  assert.match(script, /checkout\.html\?product=/);
  assert.doesNotMatch(script, /streamVideoId/);
  assert.doesNotMatch(script, /videoUrl/);
  assert.doesNotMatch(script, /innerHTML/);
});

test("admin can preserve and edit landing-page fields", function () {
  var page = fs.readFileSync(path.join(root, "admin.html"), "utf8");
  var script = fs.readFileSync(path.join(root, "assets/js/admin.js"), "utf8");

  assert.match(page, /name="landingHeadline"/);
  assert.match(page, /name="landingBenefit3"/);
  assert.match(page, /name="landingReassurance"/);
  assert.match(script, /landingHeadline:/);
  assert.match(script, /landingReassurance:/);
});
