"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var auth = require("../lib/admin-auth");
var r2Upload = require("../lib/r2-upload");
var uploadsApi = require("../api/admin/uploads");
var fs = require("node:fs");
var path = require("node:path");

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader: function (name, value) { this.headers[name] = value; },
    status: function (code) { this.statusCode = code; return this; },
    json: function (body) { this.body = body; return this; }
  };
}

function uploadEnvironment() {
  return {
    R2_ACCOUNT_ID: "0123456789abcdef0123456789abcdef",
    R2_ACCESS_KEY_ID: "access-key-id",
    R2_SECRET_ACCESS_KEY: "secret-access-key",
    R2_BUCKET: "legitbodyfix-videos",
    R2_PUBLIC_BASE_URL: "https://media.example.com"
  };
}

test("creates a short-lived signed R2 upload URL and public playback URL", function () {
  var config = r2Upload.getUploadConfig(uploadEnvironment());
  var result = r2Upload.createPresignedUpload(config, {
    fileName: "Neck routine.mp4",
    contentType: "video/mp4",
    size: 1024
  }, {
    now: new Date("2026-07-18T05:00:00Z"),
    nonce: "testnonce"
  });

  assert.match(result.uploadUrl, /^https:\/\/legitbodyfix-videos\.0123456789abcdef0123456789abcdef\.r2\.cloudflarestorage\.com\/videos\/2026-07\//);
  assert.match(result.uploadUrl, /X-Amz-SignedHeaders=content-type%3Bhost/);
  assert.match(result.uploadUrl, /X-Amz-Signature=[a-f0-9]{64}$/);
  assert.equal(result.videoUrl, "https://media.example.com/" + result.objectKey);
  assert.equal(result.contentType, "video/mp4");
});

test("rejects unsupported formats and oversized video uploads", function () {
  var config = r2Upload.getUploadConfig(uploadEnvironment());

  assert.throws(function () {
    r2Upload.createPresignedUpload(config, {
      fileName: "notes.txt",
      contentType: "text/plain",
      size: 10
    });
  }, function (error) { return error.code === "unsupported_video_type"; });

  assert.throws(function () {
    r2Upload.createPresignedUpload(config, {
      fileName: "large.mp4",
      contentType: "video/mp4",
      size: r2Upload.MAX_UPLOAD_BYTES + 1
    });
  }, function (error) { return error.code === "invalid_file_size"; });
});

test("upload URL API requires an authenticated production administrator", async function () {
  var names = [
    "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "VERCEL_ENV", "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_BASE_URL"
  ];
  var previous = {};
  names.forEach(function (name) { previous[name] = process.env[name]; });

  try {
    process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
    process.env.ADMIN_SESSION_SECRET = "a-very-long-test-session-secret-value-123456";
    process.env.VERCEL_ENV = "production";
    Object.assign(process.env, uploadEnvironment());
    var cookie = auth.createSessionCookie(auth.createSessionToken(process.env.ADMIN_SESSION_SECRET)).split(";")[0];
    var response = createResponse();

    await uploadsApi({
      method: "POST",
      headers: { cookie: cookie },
      body: { fileName: "routine.mp4", contentType: "video/mp4", size: 2048 }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.match(response.body.uploadUrl, /X-Amz-Signature=/);
    assert.match(response.body.videoUrl, /^https:\/\/media\.example\.com\//);
  } finally {
    names.forEach(function (name) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    });
  }
});

test("public video cards link only to valid HTTPS video URLs", function () {
  var script = fs.readFileSync(path.join(__dirname, "../assets/js/videos.js"), "utf8");

  assert.match(script, /function playableUrl\(value\)/);
  assert.match(script, /card\.href = videoUrl/);
  assert.match(script, /card\.target = "_blank"/);
});
