"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var auth = require("../lib/admin-auth");
var publishing = require("../lib/video-publishing");
var videosApi = require("../api/admin/videos");

function sampleVideo(overrides) {
  return Object.assign({
    id: "neck-alignment",
    level: "FOUNDATIONAL",
    moduleNumber: 99,
    title: "Neck Alignment",
    description: "A guided protocol.",
    durationMinutes: 12,
    equipment: "Bodyweight",
    videoUrl: "https://videos.example.com/neck.mp4",
    thumbnailUrl: "https://images.example.com/neck.jpg",
    published: true
  }, overrides || {});
}

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

function jsonResponse(status, data) {
  return {
    ok: status >= 200 && status < 300,
    status: status,
    json: async function () { return data; }
  };
}

test("video validation normalizes trusted fields and module order", function () {
  var videos = publishing.validateVideos([
    sampleVideo({ title: "  Neck Alignment  ", moduleNumber: 42 }),
    sampleVideo({ id: "shoulder-reset", title: "Shoulder Reset", moduleNumber: 1 })
  ]);

  assert.equal(videos[0].title, "Neck Alignment");
  assert.equal(videos[0].moduleNumber, 1);
  assert.equal(videos[1].moduleNumber, 2);
  assert.equal(videos[0].videoUrl, "https://videos.example.com/neck.mp4");
});

test("video validation rejects duplicate ids and unsafe URLs", function () {
  assert.throws(function () {
    publishing.validateVideos([
      sampleVideo({ videoUrl: "http://example.com/video.mp4" }),
      sampleVideo({ title: "Duplicate" })
    ]);
  }, function (error) {
    assert.equal(error.code, "invalid_video_data");
    assert.match(error.details.join(" "), /HTTPS URL/);
    assert.match(error.details.join(" "), /unique/);
    return true;
  });
});

test("publishing updates only the configured GitHub data file", async function () {
  var requests = [];
  var fetchMock = async function (url, options) {
    requests.push({ url: url, options: options });
    if (options.method === "GET") {
      return jsonResponse(200, {
        sha: "existing-file-sha",
        content: Buffer.from("[]\n", "utf8").toString("base64")
      });
    }
    return jsonResponse(200, {
      commit: {
        sha: "new-commit-sha",
        html_url: "https://github.com/letsgogreen/legitbodyfix/commit/new-commit-sha"
      }
    });
  };

  var result = await publishing.publishVideos({
    token: "test-token",
    repository: "letsgogreen/legitbodyfix",
    branch: "main"
  }, [sampleVideo()], fetchMock);

  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /assets\/data\/videos\.json\?ref=main$/);
  assert.equal(requests[1].options.method, "PUT");

  var update = JSON.parse(requests[1].options.body);
  var uploaded = JSON.parse(Buffer.from(update.content, "base64").toString("utf8"));
  assert.equal(update.sha, "existing-file-sha");
  assert.equal(update.branch, "main");
  assert.equal(uploaded[0].moduleNumber, 1);
  assert.equal(result.commitSha, "new-commit-sha");
});

test("admin publishing API blocks preview deployments", async function () {
  var previousPassword = process.env.ADMIN_PASSWORD;
  var previousSecret = process.env.ADMIN_SESSION_SECRET;
  var previousEnvironment = process.env.VERCEL_ENV;
  process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
  process.env.ADMIN_SESSION_SECRET = "a-very-long-test-session-secret-value-123456";
  process.env.VERCEL_ENV = "preview";

  try {
    var token = auth.createSessionToken(process.env.ADMIN_SESSION_SECRET);
    var cookie = auth.createSessionCookie(token).split(";")[0];
    var response = createResponse();

    await videosApi({
      method: "POST",
      headers: { cookie: cookie },
      body: { videos: [sampleVideo()] }
    }, response);

    assert.equal(response.statusCode, 409);
    assert.deepEqual(response.body, { error: "publishing_disabled_in_preview" });
  } finally {
    if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previousPassword;
    if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = previousSecret;
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
  }
});
