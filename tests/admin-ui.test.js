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

test("admin sign-in is a compact owner-only email and password gate", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var css = fs.readFileSync(path.join(__dirname, "../assets/css/admin.css"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin.js"), "utf8");

  assert.match(html, /id="adminEmail"[^>]+type="email"/);
  assert.match(html, /id="adminPassword"[^>]+type="password"/);
  assert.match(html, /Owner only\./);
  assert.doesNotMatch(html, /auth-intro/);
  assert.doesNotMatch(html, /RUN THE/);
  assert.match(css, /\.auth-card\s*\{[^}]*width:\s*min\(460px, 100%\)/);
  assert.match(javascript, /JSON\.stringify\(\{ email: emailInput\.value, password: passwordInput\.value \}\)/);
});

test("admin previews thumbnails and protected videos without exposing raw playback URLs", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin.js"), "utf8");

  assert.match(html, /Thumbnail preview/);
  assert.match(html, /class="thumbnail-preview-image"/);
  assert.match(html, /Protected video preview/);
  assert.match(html, /class="stream-preview-player"/);
  assert.match(html, /class="stream-media-badge" data-state="empty">Not uploaded/);
  assert.match(html, /No video uploaded/);
  assert.match(html, /class="button button-dark preview-stream-video"/);
  assert.match(javascript, /kind=stream-playback/);
  assert.match(javascript, /function safeStreamPlayerUrl/);
  assert.match(javascript, /cloudflarestream/);
  assert.match(javascript, /function previewStreamVideo/);
  assert.match(javascript, /badge\.textContent = "Uploaded · Ready"/);
  assert.match(javascript, /card\.dataset\.streamState = "processing"/);
  assert.match(javascript, /button\.textContent = "Play uploaded video"/);
  assert.doesNotMatch(javascript, /\.m3u8/);
  assert.doesNotMatch(javascript, /\.mpd/);
});

test("admin reconciles stale browser drafts with repository-saved Stream media", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var draftTools = require("../assets/js/admin-video-draft.js");
  var repositoryVideos = [{ id: "neck", streamVideoId: "saved-stream-id", streamReady: true, title: "Saved title" }];
  var draftVideos = [{ id: "neck", streamVideoId: "", streamReady: false, title: "Draft title" }];

  var result = draftTools.reconcile(repositoryVideos, draftVideos);

  assert.match(html, /assets\/js\/admin-video-draft\.js\?v=\d+/);
  assert.equal(result.recovered, 1);
  assert.equal(result.videos[0].streamVideoId, "saved-stream-id");
  assert.equal(result.videos[0].streamReady, true);
  assert.equal(result.videos[0].title, "Draft title");
  assert.equal(draftVideos[0].streamVideoId, "");
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
  assert.match(html, /id="sales"/);
  assert.match(html, /id="video-library"/);
  assert.match(html, /data-workspace-target="overview"/);
  assert.match(html, /data-workspace-target="site-copy"/);
  assert.match(html, /data-workspace-target="buyer-access"/);
  assert.match(html, /data-workspace-target="sales"/);
  assert.match(html, /data-workspace-target="video-library"/);
  assert.match(html, /What would you like to do\?/);
  assert.match(html, /id="videoSearch"/);
  assert.match(javascript, /showWorkspace/);
  assert.match(javascript, /filterVideos/);
});

test("admin includes a searchable read-only sales ledger", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/sales-admin.js"), "utf8");

  assert.match(html, /id="salesTitle">Sales</);
  assert.match(html, /id="salesTableBody"/);
  assert.match(html, /id="salesSearch"/);
  assert.match(html, /read-only record of payments and buyer access/);
  assert.doesNotMatch(html, /id="refundDialog"/);
  assert.doesNotMatch(html, /Issue full refund/);
  assert.match(javascript, /\/api\/admin\/sales/);
  assert.doesNotMatch(javascript, /method:\s*"POST"/);
  assert.doesNotMatch(javascript, /refundCapture|confirmRefund|openRefund/);
  assert.doesNotMatch(javascript, /providerCaptureId\s*:/);
});

test("admin navigation groups every visible item around a working destination", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin-interface.js"), "utf8");

  assert.match(html, /Business setup/);
  assert.match(html, /Core systems connected/);
  assert.match(html, /Build &amp; sell/);
  assert.match(html, /Programs &amp; videos/);
  assert.match(html, /Customer views/);
  assert.match(html, /href="index\.html" target="_blank"/);
  assert.match(html, /href="checkout\.html" target="_blank"/);
  assert.match(html, /href="library\.html" target="_blank"/);
  assert.match(html, /id="sidebarVideoCount"/);
  assert.match(javascript, /syncSidebarVideoCount/);
  assert.doesNotMatch(html, />Analytics</);
  assert.doesNotMatch(html, />Marketing</);
});

test("admin navigation supports fast switching and a collapsible workspace rail", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var css = fs.readFileSync(path.join(__dirname, "../assets/css/admin.css"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin-interface.js"), "utf8");

  assert.match(html, /id="commandPalette"/);
  assert.match(html, /id="commandSearch"/);
  assert.match(html, /data-command-workspace="site-copy"/);
  assert.match(html, /id="railCollapseButton"/);
  assert.match(html, /data-focus-target="siteSectionType"/);
  assert.match(html, /data-focus-target="addVideo"/);
  assert.match(html, /data-focus-target="accessGrantEmail"/);
  assert.match(css, /data-rail-collapsed="true"/);
  assert.match(javascript, /legitbodyfix\.adminRailCollapsed\.v1/);
  assert.match(javascript, /openCommandPalette/);
  assert.match(javascript, /event\.key\.toLowerCase\(\) === "k"/);
  assert.match(javascript, /event\.key === "\/"/);
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

test("website editor includes responsive private preview controls", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var editor = fs.readFileSync(path.join(__dirname, "../assets/js/site-editor.js"), "utf8");
  var publicSite = fs.readFileSync(path.join(__dirname, "../assets/js/site-content.js"), "utf8");

  assert.match(html, /id="sitePreviewDialog"/);
  assert.match(html, /data-preview-device="desktop"/);
  assert.match(html, /data-preview-device="tablet"/);
  assert.match(html, /data-preview-device="mobile"/);
  assert.match(html, /id="sitePreviewFrame"/);
  assert.match(editor, /function setPreviewDevice/);
  assert.match(editor, /function updateOpenPreview/);
  assert.match(editor, /legitbodyfix:site-preview/);
  assert.match(publicSite, /event\.origin !== window\.location\.origin/);
  assert.match(publicSite, /legitbodyfix:site-preview/);
});

