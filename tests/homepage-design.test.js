"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

test("the original Lovable React frontend is present as the application root", function () {
  var root = path.join(__dirname, "..");
  var route = fs.readFileSync(path.join(root, "src/routes/index.tsx"), "utf8");
  var styles = fs.readFileSync(path.join(root, "src/styles.css"), "utf8");
  var packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

  assert.match(route, /Build more ways to move\./i);
  assert.match(route, /Sound familiar\?/);
  assert.match(route, /A system, not a guess\./);
  assert.match(route, /4-Week Movement Reset/);
  assert.match(route, /Complete Movement System/);
  assert.match(route, /Stop guessing\. Move with a plan\./i);
  assert.match(styles, /LegitBodyFix brand tokens/);
  assert.equal(packageJson.dependencies["@tanstack/react-start"], "1.168.32");
  assert.equal(packageJson.dependencies.react, "^19.2.0");
});

test("legacy assets and server APIs remain available for integration", function () {
  var root = path.join(__dirname, "..");

  assert.ok(fs.existsSync(path.join(root, "legacy-site/assets/data/videos.json")));
  assert.ok(fs.existsSync(path.join(root, "legacy-site/admin.html")));
  assert.ok(fs.existsSync(path.join(root, "legacy-site/checkout.html")));
  assert.ok(fs.existsSync(path.join(root, "legacy-site/library.html")));
  assert.ok(fs.existsSync(path.join(root, "api/access/library.js")));
  assert.ok(fs.existsSync(path.join(root, "api/paypal/orders/create.js")));
});
