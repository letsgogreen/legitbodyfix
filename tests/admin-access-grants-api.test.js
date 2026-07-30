"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var auth = require("../lib/admin-auth");
var handler = require("../api/admin/access-grants");

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

function setEnvironment() {
  process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
  process.env.ADMIN_SESSION_SECRET = "a-very-long-test-session-secret-value-123456";
  process.env.SUPABASE_URL = "https://example-project.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_abcdefghijklmnopqrstuvwx";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_abcdefghijklmnopqrstuvwx";
  process.env.VERCEL_ENV = "production";
}

function saveEnvironment() {
  var names = [
    "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY", "VERCEL_ENV"
  ];
  var previous = {};
  names.forEach(function (name) { previous[name] = process.env[name]; });
  return function restoreEnvironment() {
    names.forEach(function (name) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    });
  };
}

test("access grants require an authenticated production administrator", async function () {
  var restore = saveEnvironment();
  try {
    setEnvironment();
    var secret = process.env.ADMIN_SESSION_SECRET;
    var cookie = auth.createSessionCookie(auth.createSessionToken(secret)).split(";")[0];
    var calls = [];
    var originalFetch = globalThis.fetch;
    globalThis.fetch = async function (url, options) {
      calls.push({ url: url, options: options });
      return { ok: true, status: 200, json: async function () { return [{ id: "entitlement-1" }]; } };
    };

    try {
      var response = createResponse();
      await handler({
        method: "POST",
        headers: { cookie: cookie },
        body: { email: "Buyer@Example.com", programId: "neck-shoulder-reset" }
      }, response);

      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body, {
        granted: true,
        email: "buyer@example.com",
        programId: "neck-shoulder-reset"
      });
      assert.equal(calls.length, 1);
      assert.match(calls[0].url, /\/rest\/v1\/entitlements/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  } finally {
    restore();
  }
});

test("access grants are unavailable outside the production deployment", async function () {
  var restore = saveEnvironment();
  try {
    setEnvironment();
    process.env.VERCEL_ENV = "preview";
    var cookie = auth.createSessionCookie(auth.createSessionToken(process.env.ADMIN_SESSION_SECRET)).split(";")[0];
    var response = createResponse();
    await handler({
      method: "POST",
      headers: { cookie: cookie },
      body: { email: "buyer@example.com", programId: "neck-shoulder-reset" }
    }, response);

    assert.equal(response.statusCode, 409);
    assert.deepEqual(response.body, { error: "access_grants_disabled_in_preview" });
  } finally {
    restore();
  }
});
