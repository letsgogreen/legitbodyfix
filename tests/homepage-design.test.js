"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

test("the Phase 1 homepage presents an honest region-first program journey", function () {
  var root = path.join(__dirname, "..");
  var route = fs.readFileSync(path.join(root, "src/routes/index.tsx"), "utf8");
  var regions = fs.readFileSync(path.join(root, "src/data/body-regions.ts"), "utf8");
  var programs = fs.readFileSync(path.join(root, "src/data/programs.ts"), "utf8");
  var howItWorks = fs.readFileSync(path.join(root, "src/components/site/HowItWorks.tsx"), "utf8");
  var featuredPrograms = fs.readFileSync(
    path.join(root, "src/components/site/FeaturedPrograms.tsx"),
    "utf8",
  );
  var styles = fs.readFileSync(path.join(root, "src/styles.css"), "utf8");
  var packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

  assert.match(route, /MOVEMENT GUIDANCE FOR ACTIVE ADULTS/);
  assert.match(route, /Move better with a plan\./i);
  assert.match(route, /Where do you want to start\?/);
  assert.match(route, /Not sure where to begin\?/);

  [
    "Head & neck",
    "Shoulder & arm",
    "Spine & rib cage",
    "Hip & pelvis",
    "Knee",
    "Ankle & foot",
  ].forEach(function (label) {
    assert.match(regions, new RegExp(label.replace("&", "&")));
  });

  [
    "Neck & Shoulder Reset",
    "Ankle Recovery Program",
    "Shoulder Movement Program",
    "Bunion / Hallux Valgus Guide",
  ].forEach(function (name) {
    assert.match(programs, new RegExp(name.replace(/[\/]/g, "\\/")));
  });

  assert.match(featuredPrograms, /Coming soon/);
  assert.match(howItWorks, /Choose your focus/);
  assert.match(howItWorks, /Check your starting point/);
  assert.match(howItWorks, /Follow your program/);
  assert.doesNotMatch(route, /7-Day Movement Reset/);
  assert.doesNotMatch(route, /4-Week Movement Reset/);
  assert.doesNotMatch(route, /8-Week Build & Return/);
  assert.doesNotMatch(route, /Complete Movement System/);
  assert.doesNotMatch(route, /Movement Library/);
  assert.doesNotMatch(route, /Sound familiar\?/);
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
