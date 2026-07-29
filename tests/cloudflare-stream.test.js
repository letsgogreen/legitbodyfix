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
  assert.deepEqual(stream.getStreamApiConfig(environment()), {
    accountId: "0123456789abcdef0123456789abcdef",
    apiToken: "stream-api-token-with-enough-safe-characters"
  });
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

test("creates a private one-time multipart upload URL without exposing the API token", async function () {
  var request;
  var upload = await stream.createDirectUpload({
    accountId: "0123456789abcdef0123456789abcdef",
    apiToken: "stream-api-token-with-enough-safe-characters"
  }, {
    fileName: "neck-reset.mp4",
    size: 125 * 1024 * 1024
  }, {
    fetchImplementation: async function (url, options) {
      request = { url: url, options: options };
      return {
        ok: true,
        status: 200,
        json: async function () {
          return {
            success: true,
            result: {
              uid: "fedcba9876543210fedcba9876543210",
              uploadURL: "https://upload.videodelivery.net/fedcba9876543210fedcba9876543210"
            }
          };
        }
      };
    }
  });

  assert.match(request.url, /\/stream\/direct_upload$/);
  assert.equal(request.options.headers.Authorization, "Bearer stream-api-token-with-enough-safe-characters");
  assert.deepEqual(JSON.parse(request.options.body), {
    maxDurationSeconds: 3600,
    requireSignedURLs: true
  });
  assert.deepEqual(upload, {
    protocol: "multipart",
    streamVideoId: "fedcba9876543210fedcba9876543210",
    uploadUrl: "https://upload.videodelivery.net/fedcba9876543210fedcba9876543210"
  });
  assert.equal(JSON.stringify(upload).includes("api-token"), false);
});

test("uses resumable TUS uploads for files larger than 200 MB and records the media ID", async function () {
  var request;
  var upload = await stream.createDirectUpload({
    accountId: "0123456789abcdef0123456789abcdef",
    apiToken: "stream-api-token-with-enough-safe-characters"
  }, {
    fileName: "twenty-minute-session.mp4",
    size: 250 * 1024 * 1024
  }, {
    fetchImplementation: async function (url, options) {
      request = { url: url, options: options };
      return {
        ok: true,
        status: 201,
        headers: {
          get: function (name) {
            if (name.toLowerCase() === "location") return "https://upload.videodelivery.net/tus-upload-endpoint";
            if (name.toLowerCase() === "stream-media-id") return "fedcba9876543210fedcba9876543210";
            return null;
          }
        }
      };
    }
  });

  assert.match(request.url, /\/stream\?direct_user=true$/);
  assert.equal(request.options.headers["Tus-Resumable"], "1.0.0");
  assert.equal(request.options.headers["Upload-Length"], String(250 * 1024 * 1024));
  assert.match(request.options.headers["Upload-Metadata"], /requiresignedurls/);
  assert.deepEqual(upload, {
    protocol: "tus",
    streamVideoId: "fedcba9876543210fedcba9876543210",
    uploadUrl: "https://upload.videodelivery.net/tus-upload-endpoint"
  });
});

test("reports when Stream has finished processing a protected video", async function () {
  var status = await stream.getVideoStatus({
    accountId: "0123456789abcdef0123456789abcdef",
    apiToken: "stream-api-token-with-enough-safe-characters"
  }, "fedcba9876543210fedcba9876543210", {
    fetchImplementation: async function () {
      return {
        ok: true,
        status: 200,
        json: async function () { return { success: true, result: { readyToStream: true, status: { state: "ready" } } }; }
      };
    }
  });

  assert.deepEqual(status, {
    streamVideoId: "fedcba9876543210fedcba9876543210",
    state: "ready",
    ready: true
  });
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
