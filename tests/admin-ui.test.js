"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

test("hidden admin panels stay out of the layout", function () {
  var css = fs.readFileSync(path.join(__dirname, "../assets/css/admin.css"), "utf8");
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");

  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/);
  assert.match(html, /assets\/css\/admin\.css\?v=\d+/);
});

test("opening the admin page as a local file redirects to production", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");

  assert.match(html, /window\.location\.protocol\s*===\s*["']file:["']/);
  assert.match(html, /window\.location\.replace\(["']https:\/\/legitbodyfix\.vercel\.app\/admin\.html["']\)/);
});

test("local design preview is restricted to localhost", function () {
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin.js"), "utf8");

  assert.match(javascript, /\["127\.0\.0\.1", "localhost"\]/);
  assert.match(javascript, /get\("design-preview"\) === "1"/);
});

test("admin offers protected Stream uploads and does not present R2 as the buyer-video path", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin.js"), "utf8");

  assert.match(html, /Upload to Stream/);
  assert.match(html, /Check processing/);
  assert.doesNotMatch(html, /Legacy public video file/);
  assert.doesNotMatch(html, /Upload to R2/);
  assert.match(javascript, /uploads\?kind=stream/);
  assert.match(javascript, /uploadTusFile/);
});

test("admin offers an authenticated customer-access grant control", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin.js"), "utf8");

  assert.match(html, /id="accessGrantForm"/);
  assert.match(html, /Customer access/);
  assert.match(javascript, /api\/admin\/videos/);
  assert.match(javascript, /action: "grant-access"/);
});

test("admin presents the rebuilt control room workspaces", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin-interface.js"), "utf8");

  assert.match(html, /class="control-room"/);
  assert.match(html, /id="site-copy"/);
  assert.match(html, /id="buyer-access"/);
  assert.match(html, /id="video-library"/);
  assert.match(html, /data-workspace-target="overview"/);
  assert.match(html, /data-workspace-target="site-copy"/);
  assert.match(html, /data-workspace-target="buyer-access"/);
  assert.match(html, /data-workspace-target="video-library"/);
  assert.match(html, /What would you like to do\?/);
  assert.match(html, /id="videoSearch"/);
  assert.match(javascript, /showWorkspace/);
  assert.match(javascript, /filterVideos/);
});

test("admin offers one complete site editor with safe layout controls", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/site-editor.js"), "utf8");

  assert.match(html, /id="siteContentForm"/);
  assert.match(html, /id="siteSectionType"/);
  assert.match(html, /id="addSiteSection"/);
  assert.match(html, /id="previewSiteContent"/);
  assert.match(html, /id="publishSiteContent"/);
  assert.match(html, /assets\/js\/site-editor\.js/);
  assert.match(html, /Section templates/);
  assert.match(html, /Add to your homepage/);
  assert.match(html, /href="checkout\.html" target="_blank"/);
  assert.match(html, /data-add-site-section="hero"/);
  assert.match(html, /data-add-site-section="split"/);
  assert.match(html, /data-add-site-section="benefits"/);
  assert.match(html, /data-add-site-section="testimonials"/);
  assert.match(html, /data-add-site-section="faq"/);
  assert.match(html, /data-add-site-section="cta"/);
  assert.match(javascript, /legitbodyfix\.siteContentDraft\.v2/);
  assert.match(javascript, /site-editor-footer/);
  assert.match(javascript, /data-add-site-section/);
  assert.match(javascript, /action: "publish-site-content"/);
  assert.match(javascript, /customSections/);
  assert.match(javascript, /Move section down/);
  assert.doesNotMatch(javascript, /contenteditable/);
  assert.doesNotMatch(javascript, /innerHTML/);
});

