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
  assert.match(html, /href="library\.html">My library<\/a>/);
  assert.match(html, /Full Body Restoration Package/);
  assert.match(html, /data-content="pricing\.displayPrice">\$170/);
  assert.match(html, /href="checkout\.html"><span data-content="pricing\.buttonLabel">Choose program/);
  assert.match(html, /assets\/js\/videos\.js/);
  assert.match(html, /assets\/js\/site-content\.js/);

  assert.doesNotMatch(html, /payment buttons \(UI placeholder/);
  assert.doesNotMatch(html, /class="pay-btn"/);
});

test("homepage content loader only applies text and cannot replace fixed checkout links", function () {
  var html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/site-content.js"), "utf8");

  assert.match(html, /href="checkout\.html"/);
  assert.match(javascript, /element\.textContent = value/);
  assert.doesNotMatch(javascript, /innerHTML/);
  assert.doesNotMatch(javascript, /setAttribute\(["']href/);
});
