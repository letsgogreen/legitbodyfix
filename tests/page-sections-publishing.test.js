"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var publishing = require("../lib/page-sections-publishing");

function validSection(type) {
  var items = [];
  if (type === "benefits") items = [{ title: "One", body: "First benefit" }, { title: "Two", body: "Second benefit" }];
  if (type === "testimonials") items = [{ title: "Customer", body: "A verified quote" }];
  if (type === "faq") items = [{ title: "Question?", body: "Answer." }];
  return {
    id: type + "-section", type: type, theme: "paper", visible: true,
    eyebrow: "LegitBodyFix", title: "Approved heading", body: items.length ? "" : "Approved supporting copy.",
    buttonLabel: type === "hero" || type === "cta" ? "Choose program" : "",
    buttonHref: type === "hero" || type === "cta" ? "#pricing" : "",
    imageUrl: "", items: items
  };
}

function response(status, data) {
  return { ok: status >= 200 && status < 300, status: status, json: async function () { return data; } };
}

test("page builder accepts the six locked templates", function () {
  var content = { version: 99, sections: publishing.TYPES.map(validSection) };
  content.sections.find(function (section) { return section.type === "split"; }).imageUrl = "https://images.example.com/result.webp";
  var validated = publishing.validatePageSections(content);
  assert.equal(validated.version, 1);
  assert.deepEqual(validated.sections.map(function (section) { return section.type; }), publishing.TYPES);
});

test("page builder strips unknown fields and rejects unsafe links", function () {
  var content = { sections: [validSection("cta")] };
  content.sections[0].rawHtml = "<script>alert(1)</script>";
  content.sections[0].buttonHref = "javascript:alert(1)";
  assert.throws(function () { publishing.validatePageSections(content); }, function (error) {
    assert.equal(error.code, "invalid_page_sections");
    assert.match(error.details.join(" "), /buttonHref/);
    return true;
  });
  content.sections[0].buttonHref = "checkout.html";
  assert.equal(publishing.validatePageSections(content).sections[0].rawHtml, undefined);
});

test("page builder enforces unique ids, approved themes, item limits, and section limit", function () {
  var first = validSection("benefits");
  var second = validSection("benefits");
  second.theme = "hot-pink";
  second.items = [];
  assert.throws(function () { publishing.validatePageSections({ sections: [first, second] }); }, function (error) {
    assert.match(error.details.join(" "), /unique/);
    assert.match(error.details.join(" "), /approved color theme/);
    assert.match(error.details.join(" "), /items/);
    return true;
  });
  assert.throws(function () { publishing.validatePageSections({ sections: Array.from({ length: 21 }, function (_, index) {
    var item = validSection("cta"); item.id = "cta-" + index; return item;
  }) }); }, /invalid/i);
});

test("page layout publishing updates only the versioned page sections file", async function () {
  var requests = [];
  var fetchMock = async function (url, options) {
    requests.push({ url: url, options: options });
    if (options.method === "GET") return response(200, { sha: "old", content: Buffer.from("{}\n").toString("base64") });
    return response(200, { commit: { sha: "new", html_url: "https://github.com/example/commit/new" } });
  };
  var result = await publishing.publishPageSections({ token: "test", repository: "letsgogreen/legitbodyfix", branch: "main" }, { sections: [validSection("cta")] }, fetchMock);
  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /assets\/data\/page-sections\.json\?ref=main$/);
  assert.equal(JSON.parse(requests[1].options.body).message, "Update page sections from admin");
  assert.equal(result.commitSha, "new");
});

test("public renderer uses DOM text nodes and URL allowlists", function () {
  var fs = require("node:fs");
  var path = require("node:path");
  var javascript = fs.readFileSync(path.join(__dirname, "../assets/js/page-sections.js"), "utf8");
  assert.match(javascript, /element\.textContent = value/);
  assert.match(javascript, /safeLink/);
  assert.match(javascript, /safeImage/);
  assert.doesNotMatch(javascript, /innerHTML/);
});
