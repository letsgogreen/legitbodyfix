"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

var root = path.join(__dirname, "..");

test("public support and policy page explains the real purchase and privacy flow", function () {
  var page = fs.readFileSync(path.join(root, "policies.html"), "utf8");

  assert.match(page, /public-responsive-fixes\.css/);
  assert.match(page, /id="support"/);
  assert.match(page, /id="refunds"/);
  assert.match(page, /id="terms"/);
  assert.match(page, /id="privacy"/);
  assert.match(page, /PayPal/);
  assert.match(page, /Supabase/);
  assert.match(page, /Cloudflare/);
  assert.match(page, /Vercel/);
  assert.match(page, /does not receive or store your full card number/i);
  assert.doesNotMatch(page, /thriveinside@/i, "the private administrator inbox must not be published");
});

test("checkout presents terms and refund policy before payment", function () {
  var checkout = fs.readFileSync(path.join(root, "checkout.html"), "utf8");
  assert.match(checkout, /policies\.html#terms/);
  assert.match(checkout, /policies\.html#refunds/);
});

test("main customer surfaces link to support or policies", function () {
  ["index.html", "library.html", "knowledge.html", "video.html"].forEach(function (file) {
    var page = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(page, /policies\.html#/, file + " does not link to the trust center");
  });
});
