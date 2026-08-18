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

test("admin sign-in verifies the approved inbox before checking the password", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var css = fs.readFileSync(path.join(__dirname, "../assets/css/admin.css"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin.js"), "utf8");

  assert.match(html, /id="adminEmail"[^>]+type="email"/);
  assert.match(html, /id="emailVerificationForm"/);
  assert.match(html, /Continue securely/);
  assert.match(html, /id="verifiedAdminEmail"/);
  assert.match(html, /id="adminPassword"[^>]+type="password"/);
  assert.match(html, /Restricted access/);
  assert.match(html, /Administrator sign-in/);
  assert.doesNotMatch(html, /Owner only\./);
  assert.doesNotMatch(html, /Manage your website, customers, sales/);
  assert.doesNotMatch(html, /Sign in to Control Room/);
  assert.doesNotMatch(html, /auth-intro/);
  assert.doesNotMatch(html, /RUN THE/);
  assert.match(css, /\.auth-card\s*\{[^}]*width:\s*min\(400px, 100%\)/);
  assert.match(css, /\.auth-visible \.topbar\s*\{\s*display:\s*none/);
  assert.match(javascript, /signInWithOtp/);
  assert.match(javascript, /shouldCreateUser:\s*false/);
  assert.match(javascript, /Authorization": "Bearer " \+ session\.access_token/);
  assert.match(javascript, /JSON\.stringify\(\{ password: passwordInput\.value \}\)/);
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
  var repositoryVideos = [{ id: "neck", streamVideoId: "saved-stream-id", streamReady: true, title: "Saved title", relatedMuscleGroupIds: ["trapezius"], relatedMuscleIds: ["upper-trapezius"] }];
  var draftVideos = [{ id: "neck", streamVideoId: "", streamReady: false, title: "Draft title" }];

  var result = draftTools.reconcile(repositoryVideos, draftVideos);

  assert.match(html, /assets\/js\/admin-video-draft\.js\?v=\d+/);
  assert.equal(result.recovered, 1);
  assert.equal(result.videos[0].streamVideoId, "saved-stream-id");
  assert.equal(result.videos[0].streamReady, true);
  assert.equal(result.videos[0].title, "Draft title");
  assert.deepEqual(result.videos[0].relatedMuscleGroupIds, ["trapezius"]);
  assert.deepEqual(result.videos[0].relatedMuscleIds, ["upper-trapezius"]);
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
  assert.match(html, /id="knowledge-base"/);
  assert.match(html, /data-workspace-target="overview"/);
  assert.match(html, /data-workspace-target="site-copy"/);
  assert.match(html, /data-workspace-target="buyer-access"/);
  assert.match(html, /data-workspace-target="sales"/);
  assert.match(html, /data-workspace-target="video-library"/);
  assert.match(html, /data-workspace-target="knowledge-base"/);
  assert.match(html, /What would you like to do\?/);
  assert.match(html, /id="videoSearch"/);
  assert.match(javascript, /showWorkspace/);
  assert.match(javascript, /filterVideos/);
  assert.match(html, /id="densityToggle"/);
  assert.doesNotMatch(html, /Run the<br \/>business/);
  assert.match(html, /aria-label="Control Room overview"/);
  assert.match(html, /id="dashboardKnowledgeCount"/);
  assert.match(javascript, /setCompactDensity/);
  assert.match(javascript, /DENSITY_PREFERENCE_KEY/);
});

test("admin includes an editable versioned knowledge base", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/knowledge-base-admin.js"), "utf8");
  var data = JSON.parse(fs.readFileSync(path.join(__dirname, "../assets/data/knowledge-base.json"), "utf8"));

  assert.match(html, /Knowledge base/);
  assert.match(html, /data-knowledge-type="conditions"/);
  assert.match(html, /data-knowledge-type="muscles"/);
  assert.match(html, /data-knowledge-type="recipes"/);
  assert.match(html, /id="knowledgeSearch"/);
  assert.match(html, /id="publishKnowledge"/);
  assert.match(html, /id="knowledgeEditorSaveState"/);
  assert.match(html, /id="undoKnowledgeChanges"/);
  assert.match(html, /id="redoKnowledgeChanges"/);
  assert.match(html, /id="adminMuscleNavigator"/);
  assert.match(html, /Edit muscles by movement/);
  assert.match(javascript, /publish-knowledge-base/);
  assert.match(javascript, /function renderAdminMuscleNavigator/);
  assert.match(javascript, /function adminMuscleInRegion/);
  assert.match(javascript, /function adminMovementFamily/);
  assert.match(javascript, /admin-muscle-family-heading/);
  assert.match(javascript, /function makeImageStudio/);
  assert.match(javascript, /cardImageScale/);
  assert.match(javascript, /cardImagePosition/);
  assert.match(javascript, /renderMuscleBoard/);
  assert.match(javascript, /renderConditionBoard/);
  assert.match(javascript, /makeImageQueueTools/);
  assert.match(javascript, /imageFilterMatches/);
  assert.match(javascript, /Review next issue/);
  assert.match(javascript, /Nothing needs attention here/);
  assert.match(javascript, /makeConditionDocumentEditor/);
  assert.match(javascript, /Edit the guide like a document/);
  assert.match(javascript, /Public information blocks/);
  assert.match(javascript, /Page settings &amp; sources/);
  assert.match(javascript, /Change the posture thumbnail/);
  assert.match(javascript, /Use auto diagram/);
  assert.match(javascript, /imageFocus/);
  assert.match(javascript, /imageScale/);
  assert.match(javascript, /kind: "thumbnail"/);
  assert.match(javascript, /Upload new image/);
  assert.match(html, /Scan the image board first/);
  assert.match(javascript, /Rotator cuff/);
  assert.match(javascript, /Levator ani group/);
  assert.match(javascript, /Deep posterior leg compartment/);
  assert.match(javascript, /activeAdminMuscleRegion/);
  assert.match(javascript, /activeAdminMuscleAction/);
  assert.match(javascript, /Related session IDs \(comma separated\)/);
  assert.match(javascript, /legitbodyfix\.knowledgeBaseDraft\.v1/);
  assert.match(javascript, /function seedHistory/);
  assert.match(javascript, /function restoreHistory/);
  assert.ok(data.conditions.length >= 2);
  assert.ok(data.muscles.length >= 3);
  assert.ok(data.recipes.length >= 2);
});

test("video workspace provides visual navigation and recoverable draft editing", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/admin.js"), "utf8");
  var css = fs.readFileSync(path.join(__dirname, "../assets/css/admin.css"), "utf8");

  assert.match(html, /id="videoEditorSaveState"/);
  assert.match(html, /id="undoVideoChanges"/);
  assert.match(html, /id="redoVideoChanges"/);
  assert.match(html, /id="videoSessionNavigator"/);
  assert.match(javascript, /function seedVideoHistory/);
  assert.match(javascript, /function restoreVideoHistory/);
  assert.match(javascript, /function renderVideoNavigator/);
  assert.match(css, /video-session-jump/);
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
  assert.match(html, /data-focus-target="siteSectionPicker"/);
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
  assert.match(html, /id="siteSectionPicker"/);
  assert.match(html, /data-toggle-site-section-picker/);
  assert.match(html, /id="closeSiteSectionPicker"/);
  assert.match(html, /id="addSiteSection"/);
  assert.match(html, /id="previewSiteContent"/);
  assert.match(html, /id="publishSiteContent"/);
  assert.match(html, /assets\/js\/site-editor\.js/);
  assert.match(html, /Add a homepage section/);
  assert.match(html, /Ready to add/);
  assert.match(html, /Selected section/);
  assert.match(html, /href="checkout\.html" target="_blank"/);
  assert.match(html, /data-select-site-section="hero"/);
  assert.match(html, /data-select-site-section="split"/);
  assert.match(html, /data-select-site-section="benefits"/);
  assert.match(html, /data-select-site-section="testimonials"/);
  assert.match(html, /data-select-site-section="faq"/);
  assert.match(html, /data-select-site-section="cta"/);
  assert.match(javascript, /legitbodyfix\.siteContentDraft\.v2/);
  assert.match(javascript, /site-editor-footer/);
  assert.match(javascript, /data-select-site-section/);
  assert.match(javascript, /selectTemplate/);
  assert.match(javascript, /setSectionPickerOpen/);
  assert.match(javascript, /action: "publish-site-content"/);
  assert.match(javascript, /customSections/);
  assert.match(javascript, /Move section down/);
  assert.match(javascript, /contenteditable/);
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

test("website editor keeps a visual live preview beside editable sections", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var editor = fs.readFileSync(path.join(__dirname, "../assets/js/site-editor.js"), "utf8");
  var css = fs.readFileSync(path.join(__dirname, "../assets/css/admin.css"), "utf8");
  assert.match(html, /id="siteEditorLiveFrame"/);
  assert.match(html, /id="expandSitePreview"/);
  assert.match(editor, /sendContentToFrame\(livePreviewFrame\)/);
  assert.match(editor, /view\.textContent = "View"/);
  assert.match(editor, /scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/);
  assert.match(css, /\.site-editor-visual-layout/);
  assert.match(css, /\.site-editor-live-preview \{ min-width: 0/);
  assert.match(css, /\.site-editor-inspector \{ position: sticky/);
});

test("website editor supports direct canvas editing and a contextual inspector", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var editor = fs.readFileSync(path.join(__dirname, "../assets/js/site-editor.js"), "utf8");
  var css = fs.readFileSync(path.join(__dirname, "../assets/css/admin.css"), "utf8");
  assert.match(html, /VISUAL CANVAS/);
  assert.match(html, /site-editor-inspector/);
  assert.match(html, /data-canvas-device="mobile"/);
  assert.match(editor, /function enableInlineEditing/);
  assert.match(editor, /contenteditable/);
  assert.match(editor, /selectInspectorSection/);
  assert.match(editor, /Replace image/);
  assert.match(html, /id="undoSiteContent"/);
  assert.match(html, /id="redoSiteContent"/);
  assert.match(html, /id="siteEditorSaveState"/);
  assert.match(html, /id="siteInsertMenu"/);
  assert.match(editor, /function recordHistory/);
  assert.match(editor, /function restoreHistory/);
  assert.match(editor, /openInsertMenu/);
  assert.match(css, /\.site-editor-canvas-stage\[data-canvas-device="mobile"\]/);
});

test("website editor previews every major customer page and routes edits safely", function () {
  var html = fs.readFileSync(path.join(__dirname, "../admin.html"), "utf8");
  var editor = fs.readFileSync(path.join(__dirname, "../assets/js/site-editor.js"), "utf8");
  var css = fs.readFileSync(path.join(__dirname, "../assets/css/admin.css"), "utf8");
  assert.match(html, /data-site-page="home"/);
  assert.match(html, /data-site-page="knowledge"/);
  assert.match(html, /data-site-page="program"/);
  assert.match(html, /data-site-page="library"/);
  assert.match(html, /id="sitePageRoute"/);
  assert.match(editor, /function selectSitePage/);
  assert.match(editor, /workspace: "knowledge-base"/);
  assert.match(editor, /workspace: "video-library"/);
  assert.match(editor, /workspace: "buyer-access"/);
  assert.match(css, /\.site-page-switcher/);
});

