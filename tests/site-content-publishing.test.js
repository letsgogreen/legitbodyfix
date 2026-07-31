"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var publishing = require("../lib/site-content-publishing");
var paypal = require("../lib/paypal-payments");

function currentContent() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../assets/data/site-content.json"), "utf8"));
}

function response(status, data) {
  return { ok: status >= 200 && status < 300, status: status, json: async function () { return data; } };
}

test("website content validation returns only approved plain-text fields", function () {
  var input = currentContent();
  input.hero.extraHtml = "<script>alert(1)</script>";
  input.pricing.checkoutUrl = "https://evil.example";
  var content = publishing.validateSiteContent(input);

  assert.equal(content.hero.extraHtml, undefined);
  assert.equal(content.pricing.checkoutUrl, undefined);
  assert.equal(content.hero.titleLines.length, 4);
  assert.equal(content.method.steps.length, 3);
});

test("website content validation rejects missing, oversized, and malformed fields", function () {
  var input = currentContent();
  input.hero.kicker = "";
  input.hero.titleLines = ["ONLY ONE"];
  input.footer.legal = "x".repeat(221);

  assert.throws(function () { publishing.validateSiteContent(input); }, function (error) {
    assert.equal(error.code, "invalid_site_content");
    assert.match(error.details.join(" "), /hero\.kicker/);
    assert.match(error.details.join(" "), /hero\.titleLines/);
    assert.match(error.details.join(" "), /footer\.legal/);
    return true;
  });
});

test("website publishing updates only the site content data file", async function () {
  var requests = [];
  var fetchMock = async function (url, options) {
    requests.push({ url: url, options: options });
    if (options.method === "GET") {
      return response(200, { sha: "old-sha", content: Buffer.from("{}\n").toString("base64") });
    }
    return response(200, { commit: { sha: "new-sha", html_url: "https://github.com/example/commit/new-sha" } });
  };

  var result = await publishing.publishSiteContent({
    token: "test-token", repository: "letsgogreen/legitbodyfix", branch: "main"
  }, currentContent(), fetchMock);

  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /assets\/data\/site-content\.json\?ref=main$/);
  assert.equal(requests[1].options.method, "PUT");
  assert.equal(JSON.parse(requests[1].options.body).message, "Update website text from admin");
  assert.equal(result.commitSha, "new-sha");
});

test("displayed website price cannot change the server-owned PayPal price", function () {
  var input = currentContent();
  input.pricing.displayPrice = "$1";
  assert.equal(publishing.validateSiteContent(input).pricing.displayPrice, "$1");
  assert.equal(paypal.getProduct("neck-shoulder-reset").amount, "170.00");
});
