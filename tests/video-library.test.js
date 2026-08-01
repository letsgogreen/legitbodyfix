"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var videoLibrary = require("../lib/video-library");
var libraryApi = require("../api/access/library");

var entitledProgram = [{ id: "neck-shoulder-reset" }];

test("returns only published sessions owned by the buyer's purchased program", function () {
  var videos = videoLibrary.listAccessibleVideos(entitledProgram);

  assert.equal(videos.length, 6);
  assert.equal(videos[0].id, "neck-alignment");
  assert.equal(videos[0].programId, "neck-shoulder-reset");
  assert.equal(videos[0].ready, true);
  assert.equal(Object.prototype.hasOwnProperty.call(videos[0], "videoUrl"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(videos[0], "streamVideoId"), false);
  assert.deepEqual(videoLibrary.listAccessibleVideos([{ id: "unrelated-program" }]), []);
});

test("refuses playback metadata for a session outside the buyer's entitlement", function () {
  assert.equal(videoLibrary.getAccessibleVideo([{ id: "unrelated-program" }], "neck-alignment"), null);
  assert.equal(videoLibrary.getAccessibleVideo(entitledProgram, "not-a-real-video"), null);
  assert.equal(videoLibrary.getAccessibleVideo(entitledProgram, "neck-alignment").title, "Neck Alignment");
});

test("preserves access and playback lookup for the ankle session's former id", function () {
  var legacyPurchase = [{ id: "shoulder-reset" }];
  var videos = videoLibrary.listAccessibleVideos(legacyPurchase);

  assert.equal(videos.length, 1);
  assert.equal(videos[0].id, "ankle-sprain-rehabilitation");
  assert.equal(videoLibrary.getAccessibleVideo(legacyPurchase, "shoulder-reset").id, "ankle-sprain-rehabilitation");
});

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

test("buyer library response never returns the legacy public R2 video URL", async function () {
  var names = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY"];
  var previous = {};
  names.forEach(function (name) { previous[name] = process.env[name]; });
  var originalFetch = globalThis.fetch;

  try {
    process.env.SUPABASE_URL = "https://example-project.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_abcdefghijklmnopqrstuvwx";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_abcdefghijklmnopqrstuvwx";
    globalThis.fetch = async function (url) {
      if (url.includes("/auth/v1/user")) {
        return { ok: true, status: 200, json: async function () { return { id: "buyer-1", email: "buyer@example.com" }; } };
      }
      return {
        ok: true,
        status: 200,
        json: async function () {
          return [{
            created_at: "2026-07-29T00:00:00Z",
            programs: { id: "neck-shoulder-reset", title: "Neck & Shoulder Reset", price: 49, currency: "USD", active: true }
          }];
        }
      };
    };

    var response = createResponse();
    await libraryApi({ method: "GET", headers: { authorization: "Bearer buyer-token" } }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["Cache-Control"], "no-store");
    assert.equal(response.body.videos.length, 6);
    // A public thumbnail may be hosted in R2, but a buyer must never receive
    // the legacy direct video field. Playback is issued separately as a
    // short-lived Cloudflare Stream token.
    assert.equal(response.body.videos.some(function (video) {
      return Object.prototype.hasOwnProperty.call(video, "videoUrl");
    }), false);
  } finally {
    globalThis.fetch = originalFetch;
    names.forEach(function (name) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    });
  }
});
