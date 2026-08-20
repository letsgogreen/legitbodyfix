"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

test("homepage uses the Lovable composition with real LegitBodyFix product data", function () {
  var html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");

  assert.match(html, /class="hero wrap lovable-hero"/);
  assert.match(html, /data-content="hero\.titleLines\.0">BUILD MORE/);
  assert.match(html, /assets\/images\/hero-training\.jpg/);
  assert.match(html, /data-site-section="visitor-problems"/);
  assert.match(html, /A SYSTEM, NOT A GUESS|ONE SYSTEM/);
  assert.match(html, /data-site-section="why-legitbodyfix"/);
  assert.match(html, /data-site-section="starting-point-cta"/);
  assert.match(html, /data-site-section="program-paths"/);
  assert.match(html, /id="courseGrid"/);
  assert.match(html, /href="library\.html" data-content="navigation\.myLibrary">My library<\/a>/);
  assert.match(html, /data-content="pricing\.displayPrice">FROM \$8/);
  assert.match(html, /assets\/js\/videos\.js/);
  assert.match(html, /assets\/js\/site-content\.js/);
  assert.match(html, /data-site-section="hero"/);
  assert.match(html, /assets\/css\/site-editor-public\.css/);
  assert.match(html, /02 \/ Muscle dictionary/);
  assert.match(html, /id="knowledge-preview"/);
  assert.match(html, /data-site-section="knowledge"/);
  assert.match(html, /knowledge\.html\?type=conditions&amp;id=round-shoulder/);
  assert.match(html, /STOP GUESSING\. MOVE WITH A PLAN\./);

  assert.doesNotMatch(html, /payment buttons \(UI placeholder/);
  assert.doesNotMatch(html, /class="pay-btn"/);
});

test("homepage content loader applies validated content without injecting HTML", function () {
  var html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/site-content.js"), "utf8");
  var publicStyles = fs.readFileSync(path.join(__dirname, "../assets/css/site-editor-public.css"), "utf8");

  assert.match(html, /href="knowledge\.html"/);
  assert.match(javascript, /element\.textContent = value/);
  assert.match(javascript, /safeLink/);
  assert.match(javascript, /data-site-section/);
  assert.match(javascript, /document\.querySelector\('\[data-site-section=/);
  assert.match(javascript, /"knowledge"/);
  assert.match(publicStyles, /\.hero-custom-image\[hidden\]\s*\{\s*display:\s*none/);
  assert.doesNotMatch(javascript, /innerHTML/);
});
