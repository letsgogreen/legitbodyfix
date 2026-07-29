"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var stream = require("../lib/cloudflare-stream");

function environment() {
  return {
    CLOUDFLARE_STREAM_ACCOUNT_ID: "0123456789abcdef0123456789abcdef",
    CLOUDFLARE_STREAM_API_TOKEN: "stream-api-token-with-enough-safe-characters",
    CLOUDFLARE_STREAM_CUSTOMER_CODE: "abc123-stream-customer"
  };
}

test("reads only valid server-side Cloudflare Stream configuration", function () {
  assert.deepEqual(stream.getStreamConfig(environment()), {
    accountId: "0123456789abcdef0123456789abcdef",
    apiToken: "stream-api-token-with-enough-safe-characters",
    customerCode: "abc123-stream-customer"
  });

  var invalid = environment();
  invalid.CLOUDFLARE_STREAM_ACCOUNT_ID = "not-an-account";
  invalid.CLOUDFLARE_STREAM_API_TOKEN = "short";
  invalid.CLOUDFLARE_STREAM_CUSTOMER_CODE = "bad customer code";
  assert.deepEqual(stream.getStreamConfigIssues(invalid), [
    "CLOUDFLARE_STREAM_ACCOUNT_ID",
    "CLOUDFLARE_STREAM_API_TOKEN",
    "CLOUDFLARE_STREAM_CUSTOMER_CODE"
  ]);
  assert.equal(stream.getStreamConfig(invalid), null);
});

test("creates a short-lived non-downloadable player URL without exposing a token field", async function () {
  var request;
  var playback = await stream.getSignedPlayback({
    accountId: "0123456789abcdef0123456789abcdef",
    apiToken: "stream-api-token-with-enough-safe-characters",
    customerCode: "customer-abc123-stream-customer"
  }, "fedcba9876543210fedcba9876543210", {
    now: new Date("2026-07-29T00:00:00Z"),
    ttlSeconds: 900,
    fetchImplementation: async function (url, options) {
      request = { url: url, options: options };
      return {
        ok: true,
        status: 200,
        json: async function () { return { success: true, result: { token: "signed-playback-token" } }; }
      };
    }
  });

  assert.match(request.url, /\/accounts\/0123456789abcdef0123456789abcdef\/stream\/fedcba9876543210fedcba9876543210\/token$/);
  assert.equal(request.options.headers.Authorization, "Bearer stream-api-token-with-enough-safe-characters");
  assert.deepEqual(JSON.parse(request.options.body), { exp: 1785284100, downloadable: false });
  assert.equal(playback.playerUrl, "https://customer-abc123-stream-customer.cloudflarestream.com/signed-playback-token/iframe");
  assert.equal(playback.expiresAt, "2026-07-29T00:15:00.000Z");
  assert.equal(Object.prototype.hasOwnProperty.call(playback, "token"), false);
});
