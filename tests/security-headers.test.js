var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");

var config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "vercel.json"), "utf8"));

test("all public and private routes receive baseline browser security headers", function () {
  var globalRule = config.headers.find(function (rule) { return rule.source === "/(.*)"; });
  assert.ok(globalRule, "A global security-header rule is required.");

  var headers = Object.fromEntries(globalRule.headers.map(function (header) {
    return [header.key.toLowerCase(), header.value];
  }));

  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.equal(headers["x-frame-options"], "DENY");
  assert.equal(headers["referrer-policy"], "strict-origin-when-cross-origin");
  assert.match(headers["permissions-policy"], /camera=\(\)/);
  assert.match(headers["content-security-policy"], /frame-ancestors 'none'/);
  assert.match(headers["content-security-policy"], /object-src 'none'/);
  assert.match(headers["content-security-policy"], /https:\/\/\*\.paypal\.com/);
  assert.match(headers["content-security-policy"], /https:\/\/\*\.supabase\.co/);
  assert.match(headers["content-security-policy"], /https:\/\/\*\.cloudflarestream\.com/);
});
