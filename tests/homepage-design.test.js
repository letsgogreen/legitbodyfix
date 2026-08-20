"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

test("homepage preserves the original Lovable frontend baseline", function () {
  var html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");

  assert.match(html, /LegitBodyFix — Build More Ways to Move/);
  assert.match(html, /MOVEMENT SYSTEM/);
  assert.match(html, /Build more ways to move\./i);
  assert.match(html, /assets\/images\/hero-training\.jpg/);
  assert.match(html, /Sound familiar\?/);
  assert.match(html, /A system, not a guess\./);
  assert.match(html, /Find what's limiting your movement\./);
  assert.match(html, /Start small\. Go deeper when you're ready\./);
  assert.match(html, /4-Week Movement Reset/);
  assert.match(html, /\$59/);
  assert.match(html, /Complete Movement System/);
  assert.match(html, /\$179/);
  assert.match(html, /Assess\. Restore\. Rebuild\. Apply\./);
  assert.match(html, /Understand your body without the overwhelm\./);
  assert.match(html, /Stop guessing\. Move with a plan\./i);
});

test("original frontend remains isolated from protected application pages", function () {
  var root = path.join(__dirname, "..");
  var html = fs.readFileSync(path.join(root, "index.html"), "utf8");

  assert.match(html, /href="knowledge\.html"/);
  assert.ok(fs.existsSync(path.join(root, "library.html")));
  assert.ok(fs.existsSync(path.join(root, "checkout.html")));
  assert.ok(fs.existsSync(path.join(root, "admin.html")));
  assert.ok(fs.existsSync(path.join(root, "api/access/library.js")));
  assert.doesNotMatch(html, /assets\/js\/site-content\.js/);
  assert.doesNotMatch(html, /assets\/js\/videos\.js/);
});
