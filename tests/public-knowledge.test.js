"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

var root = path.join(__dirname, "..");

test("public knowledge hub exposes searchable published education safely", function () {
  var html = fs.readFileSync(path.join(root, "knowledge.html"), "utf8");
  var javascript = fs.readFileSync(path.join(root, "assets/js/knowledge.js"), "utf8");
  var css = fs.readFileSync(path.join(root, "assets/css/muscle-dictionary.css"), "utf8");

  assert.match(html, /id="knowledgeGrid"/);
  assert.match(html, /public-responsive-fixes\.css/);
  assert.match(html, /data-knowledge-filter="conditions"/);
  assert.match(html, /Complete follow-along progressions stay inside the paid programs/);
  assert.match(html, /How movement guides help/);
  assert.match(html, /Program previews/);
  assert.match(html, /Muscle dictionary/);
  assert.match(html, /muscle-dictionary\.css/);
  assert.match(html, /data-muscle-region="lower-leg"/);
  assert.match(html, /data-muscle-region="foot"/);
  assert.match(html, /data-muscle-region="head-neck"/);
  assert.match(html, /data-muscle-region="shoulder-chest"/);
  assert.match(html, /data-muscle-region="arm-hand"/);
  assert.match(html, /data-muscle-region="pelvic-floor"/);
  assert.match(html, /id="knowledgePaths"/);
  assert.match(html, /id="muscleAtlas"/);
  assert.match(html, /knowledge-organization\.css/);
  assert.match(html, /id="muscleSort"/);
  assert.match(html, /id="muscleFunction"/);
  assert.match(html, /id="muscleReset"/);
  assert.match(html, /Knee internal rotators/);
  assert.match(javascript, /item\.published !== false/);
  assert.match(javascript, /textContent = text/);
  assert.match(javascript, /URLSearchParams/);
  assert.match(javascript, /relatedVideoIds/);
  assert.match(javascript, /video\.html\?id=/);
  assert.match(javascript, /assets\/data\/videos\.json/);
  assert.match(javascript, /Functions and actions/);
  assert.match(javascript, /function muscleRegion/);
  assert.match(javascript, /function muscleFunctionalRoles/);
  assert.match(javascript, /function updateFunctionOptions/);
  assert.match(javascript, /option\.dataset\.baseLabel/);
  assert.match(javascript, /option\.disabled/);
  assert.match(javascript, /muscleReset\.addEventListener/);
  assert.match(javascript, /activeMuscleFunction/);
  assert.match(javascript, /role\.toLowerCase\(\)\.includes\(query\)/);
  assert.match(javascript, /Neck flexor/);
  assert.match(javascript, /Neck extensor/);
  assert.match(javascript, /Shoulder internal rotator/);
  assert.match(javascript, /Shoulder external rotator/);
  assert.match(javascript, /Hip flexor/);
  assert.match(javascript, /Hip extensor/);
  assert.match(javascript, /Hip internal rotator/);
  assert.match(javascript, /Hip external rotator/);
  assert.match(javascript, /Knee internal rotator/);
  assert.match(javascript, /Knee external rotator/);
  assert.match(javascript, /Scapular upward rotator/);
  assert.match(javascript, /Forearm pronator/);
  assert.match(javascript, /Trunk extensor/);
  assert.match(javascript, /Ankle dorsiflexor/);
  assert.match(javascript, /Toe flexor/);
  assert.match(javascript, /Neck lateral flexor/);
  assert.match(javascript, /Finger abductor/);
  assert.match(javascript, /Thumb opposer/);
  assert.match(javascript, /Inspiratory muscle/);
  assert.match(javascript, /Pelvic floor supporter/);
  assert.match(javascript, /Urinary continence muscle/);
  assert.match(javascript, /"upper arm", "forearm", "hand"/);
  assert.match(javascript, /"head and neck", "anterior neck", "lateral neck", "suboccipital neck"/);
  assert.match(javascript, /"erector spinae", "deep back", "thorax", "posterior thorax"/);
  assert.match(javascript, /"pelvic diaphragm", "superficial perineum", "deep perineum", "pelvic sphincters"/);
  assert.match(javascript, /"deep hip", "anterior thigh", "medial thigh", "posterior thigh"/);
  assert.match(javascript, /"anterior lower leg", "lateral lower leg", "posterior lower leg"/);
  assert.match(javascript, /function renderMuscleGroups/);
  assert.match(javascript, /muscle-region-section/);
  assert.match(javascript, /across 8 body regions/);
  assert.match(javascript, /muscle-subgroup-heading/);
  assert.match(javascript, /openAnatomyViewer/);
  assert.match(javascript, /Enlarge anatomy plate/);
  assert.match(javascript, /This plate may show nearby muscles/);
  assert.match(css, /\.anatomy-viewer/);
  assert.match(css, /\.knowledge-card-media-label/);
  assert.match(javascript, /localeCompare/);
  assert.match(javascript, /detail-anatomy-image/);
  assert.match(javascript, /Regional anatomy reference/);
  assert.match(javascript, /Special:FilePath\/1117_Muscles_of_the_Back\.png/);
  assert.match(javascript, /Special:FilePath\/1115_Muscles_of_the_Pelvic_Floor\.jpg/);
  assert.match(javascript, /\^https:/);
  assert.doesNotMatch(javascript, /innerHTML/);
  assert.doesNotMatch(javascript, /\["steps",\s*"Sequence"\]/);

  var functionOptions = Array.from(html.matchAll(/<option value="([^"]+)">/g), function (match) { return match[1]; })
    .filter(function (value) { return !["all", "body", "alpha"].includes(value); });
  functionOptions.forEach(function (value) {
    assert.ok(javascript.includes('"' + value + '"'), "missing function classifier for " + value);
  });
});

test("muscle dictionary records include anatomy fields, visual orientation, and references", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  assert.ok(data.muscles.length >= 161);
  data.muscles.forEach(function (muscle) {
    assert.ok(muscle.origin, muscle.id + " needs an origin");
    assert.ok(muscle.insertion, muscle.id + " needs an insertion");
    assert.ok(muscle.actions, muscle.id + " needs functions and actions");
    assert.ok(muscle.imageUrl || muscle.bodyMap, muscle.id + " needs an image or body map");
    if (muscle.imageUrl) {
      assert.match(muscle.imageUrl, /^https:\/\//);
      assert.ok(muscle.imageAlt);
      assert.ok(muscle.imageCredit);
      assert.match(muscle.imageCreditUrl, /^https:\/\//);
    }
    assert.ok(muscle.sourceName, muscle.id + " needs a reference name");
    assert.match(muscle.sourceUrl, /^https:\/\//);
  });
});

test("muscle dictionary covers the major whole-body regions", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  assert.equal(data.muscles.filter(function (muscle) { return muscle.imageUrl; }).length, data.muscles.length, "every muscle needs a specific illustration");
  var bodyMaps = new Set(data.muscles.map(function (muscle) { return muscle.bodyMap; }).filter(Boolean));
  ["head-neck", "shoulder", "chest", "forearm", "abdomen", "back", "hip-front", "hip-back", "thigh-front", "thigh-back", "lower-leg-front", "lower-leg-back", "foot"].forEach(function (bodyMap) {
    assert.ok(bodyMaps.has(bodyMap), "missing muscle coverage for " + bodyMap);
  });
  ["supraspinatus", "subclavius", "internal-oblique", "gluteus-minimus", "psoas-major", "iliacus", "tibialis-posterior", "extensor-digitorum-brevis", "extensor-hallucis-brevis", "longus-colli", "anterior-scalene", "middle-scalene", "posterior-scalene", "sternohyoid", "omohyoid", "sternothyroid", "thyrohyoid", "rectus-capitis-posterior-major", "rectus-capitis-posterior-minor", "obliquus-capitis-superior", "obliquus-capitis-inferior", "iliocostalis-lumborum", "iliocostalis-thoracis", "iliocostalis-cervicis", "longissimus-thoracis", "spinalis-thoracis", "spinalis-cervicis", "spinalis-capitis", "flexor-digitorum-profundus", "dorsal-interossei-hand", "obturator-internus", "vastus-intermedius", "articularis-genus", "plantaris", "abductor-hallucis", "dorsal-interossei-foot", "rotatores", "internal-intercostals", "transversus-thoracis", "serratus-posterior-superior", "levator-ani", "puborectalis", "pubococcygeus", "iliococcygeus", "bulbospongiosus", "deep-transverse-perineal", "compressor-urethrae", "urethrovaginal-sphincter", "external-urethral-sphincter", "external-anal-sphincter", "extensor-pollicis-longus", "palmar-interossei-hand", "flexor-digiti-minimi-brevis-foot"].forEach(function (id) {
    assert.ok(data.muscles.some(function (muscle) { return muscle.id === id; }), "missing foundational muscle " + id);
  });
});

test("pelvic floor is a complete standalone atlas region", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  var pelvicGroups = new Set(["Pelvic diaphragm", "Superficial perineum", "Deep perineum", "Pelvic sphincters"]);
  var pelvicFloor = data.muscles.filter(function (muscle) { return pelvicGroups.has(muscle.group); });
  assert.ok(pelvicFloor.length >= 13);
  ["levator-ani", "coccygeus", "puborectalis", "pubococcygeus", "iliococcygeus", "superficial-transverse-perineal", "bulbospongiosus", "ischiocavernosus", "deep-transverse-perineal", "compressor-urethrae", "urethrovaginal-sphincter", "external-urethral-sphincter", "external-anal-sphincter"].forEach(function (id) {
    assert.ok(pelvicFloor.some(function (muscle) { return muscle.id === id; }), "missing pelvic floor muscle " + id);
  });
});

test("lower-leg and pelvic-floor records use useful anatomical subgroups", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  var groups = new Set(data.muscles.map(function (muscle) { return muscle.group; }));
  ["Pelvic diaphragm", "Superficial perineum", "Deep perineum", "Pelvic sphincters", "Anterior lower leg", "Lateral lower leg", "Posterior lower leg"].forEach(function (group) {
    assert.ok(groups.has(group), "missing anatomical subgroup " + group);
  });
  assert.ok(!data.muscles.some(function (muscle) { return muscle.id === "intrinsic-foot-muscles"; }), "aggregate foot placeholder should be removed");
});

test("neck and erector-spinae families use named muscles instead of aggregate cards", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  ["scalenes", "erector-spinae", "iliocostalis", "spinalis"].forEach(function (id) {
    assert.ok(!data.muscles.some(function (muscle) { return muscle.id === id; }), "aggregate record should be removed: " + id);
  });
  var groups = new Set(data.muscles.map(function (muscle) { return muscle.group; }));
  ["Anterior neck", "Lateral neck", "Suboccipital neck", "Erector spinae"].forEach(function (group) {
    assert.ok(groups.has(group), "missing anatomical subgroup " + group);
  });
});

test("published knowledge records link to existing purchasable sessions", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  var videos = JSON.parse(fs.readFileSync(path.join(root, "assets/data/videos.json"), "utf8"));
  var videoIds = new Set(videos.filter(function (video) { return video.published !== false; }).map(function (video) { return video.id; }));

  ["conditions", "muscles", "recipes"].forEach(function (type) {
    data[type].filter(function (item) { return item.published; }).forEach(function (item) {
      if (type === "muscles") assert.ok(String(item.relatedVideoIds || "").trim(), "muscle record " + item.id + " needs a related session");
      String(item.relatedVideoIds || "").split(",").map(function (id) { return id.trim(); }).filter(Boolean).forEach(function (id) {
        assert.ok(videoIds.has(id), type + " record " + item.id + " references a missing session");
      });
    });
  });
});

test("muscle references use one canonical label for each source", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  var labelsByUrl = new Map();
  data.muscles.forEach(function (muscle) {
    if (labelsByUrl.has(muscle.sourceUrl)) assert.equal(muscle.sourceName, labelsByUrl.get(muscle.sourceUrl), "inconsistent source label for " + muscle.sourceUrl);
    else labelsByUrl.set(muscle.sourceUrl, muscle.sourceName);
  });
});

test("knowledge seed data provides unique public identifiers", function () {
  var data = JSON.parse(fs.readFileSync(path.join(root, "assets/data/knowledge-base.json"), "utf8"));
  ["conditions", "muscles", "recipes"].forEach(function (type) {
    assert.ok(Array.isArray(data[type]) && data[type].length > 0);
    assert.equal(new Set(data[type].map(function (item) { return item.id; })).size, data[type].length);
    data[type].forEach(function (item) { assert.ok(item.title); assert.equal(typeof item.published, "boolean"); });
  });
});
