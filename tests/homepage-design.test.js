"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

test("homepage keeps the approved movement-library design and live product path", function () {
  var html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");

  assert.match(html, /<span class="brand-mark">LBF<\/span>/);
  assert.match(html, /data-content="hero\.titleLines\.0">MOVE/);
  assert.match(html, /class="body-map"/);
  assert.match(html, /id="courseGrid"/);
  assert.match(html, /href="library\.html" data-content="navigation\.myLibrary">My library<\/a>/);
  assert.match(html, /Full Body Restoration Package/);
  assert.match(html, /data-content="pricing\.displayPrice">\$170/);
  assert.match(html, /href="checkout\.html" data-content-href="pricing\.buttonHref"><span data-content="pricing\.buttonLabel">Choose program/);
  assert.match(html, /assets\/js\/videos\.js/);
  assert.match(html, /assets\/js\/site-content\.js/);
  assert.match(html, /data-site-section="hero"/);
  assert.match(html, /assets\/css\/site-editor-public\.css/);
  assert.match(html, /href="knowledge\.html">Movement guides<\/a>/);
  assert.match(html, /02 \/ Muscle dictionary/);
  assert.match(html, /id="knowledge-preview"/);
  assert.match(html, /data-site-section="knowledge"/);
  assert.match(html, /knowledge\.html\?type=conditions&amp;id=round-shoulder/);
  assert.match(html, /Free movement guides/);
  assert.match(html, /Browse movement guides/);

  assert.doesNotMatch(html, /payment buttons \(UI placeholder/);
  assert.doesNotMatch(html, /class="pay-btn"/);
});

test("homepage content loader applies validated content without injecting HTML", function () {
  var html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/site-content.js"), "utf8");
  var publicStyles = fs.readFileSync(path.join(__dirname, "../assets/css/site-editor-public.css"), "utf8");

  assert.match(html, /href="checkout\.html"/);
  assert.match(javascript, /element\.textContent = value/);
  assert.match(javascript, /safeLink/);
  assert.match(javascript, /data-site-section/);
  assert.match(javascript, /"knowledge"/);
  assert.match(publicStyles, /\.hero-custom-image\[hidden\]\s*\{\s*display:\s*none/);
  assert.doesNotMatch(javascript, /innerHTML/);
});
