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

  assert.match(route, /Find the limit\./i);
  assert.match(route, /Build the way forward\./i);
  assert.match(route, /Find my starting point/);
  assert.match(route, /Browse focused programs/);
  assert.match(route, /Direct access by region/);
  assert.match(route, /Already know where you want to start\?/);
  assert.match(route, /search=\{\{ path: "area", area: slug \}\}/);
  assert.match(route, /Head & neck/);
  assert.match(route, /Ankle & foot/);
  assert.match(route, /Knee capacity/);
  assert.match(route, /Spinal movement & scoliosis support/);
  assert.match(styles, /LegitBodyFix brand tokens/);
  assert.equal(packageJson.dependencies["@tanstack/react-start"], "1.168.32");
  assert.equal(packageJson.dependencies.react, "^19.2.0");
});

test("legacy assets and server APIs remain preserved outside the deployment root", function () {
  var root = path.join(__dirname, "..");

  assert.ok(fs.existsSync(path.join(root, "legacy-site/assets/data/videos.json")));
  assert.ok(fs.existsSync(path.join(root, "legacy-site/admin.html")));
  assert.ok(fs.existsSync(path.join(root, "legacy-site/checkout.html")));
  assert.ok(fs.existsSync(path.join(root, "legacy-site/library.html")));
  assert.ok(fs.existsSync(path.join(root, "legacy-site/api/access/library.js")));
  assert.ok(fs.existsSync(path.join(root, "legacy-site/api/paypal/orders/create.js")));
  assert.ok(fs.existsSync(path.join(root, "legacy-site/lib/paypal-payments.js")));
});
