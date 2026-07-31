"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

test("homepage keeps the approved movement-library design and live product path", function () {
  var html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");

  assert.match(html, /<span class="brand-mark">LBF<\/span>/);
  assert.match(html, /MOVE<br \/>BETTER\./);
  assert.match(html, /class="body-map"/);
  assert.match(html, /id="courseGrid"/);
  assert.match(html, /href="library\.html">My library<\/a>/);
  assert.match(html, /Full Body Restoration Package/);
  assert.match(html, /\$170<span> one-time<\/span>/);
  assert.match(html, /href="checkout\.html">Choose program/);
  assert.match(html, /assets\/js\/videos\.js/);

  assert.doesNotMatch(html, /payment buttons \(UI placeholder/);
  assert.doesNotMatch(html, /class="pay-btn"/);
});
