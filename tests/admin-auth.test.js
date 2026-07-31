"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var auth = require("../lib/admin-auth");
var login = require("../api/admin/login");
var session = require("../api/admin/session");
var logout = require("../api/admin/logout");

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

test("session tokens reject tampering and expiration", function () {
  var secret = "a-secure-test-secret-that-is-long-enough";
  var issuedAt = Date.UTC(2026, 0, 1);
  var token = auth.createSessionToken(secret, issuedAt);
  var payload = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString("utf8"));

  assert.equal(payload.version, 2);
  assert.equal(auth.verifySessionToken(token, secret, issuedAt + 1000), true);
  assert.equal(auth.verifySessionToken(token + "x", secret, issuedAt + 1000), false);
  assert.equal(auth.verifySessionToken(token, "a-different-secure-test-secret-value", issuedAt + (9 * 60 * 60 * 1000)), false);
  assert.equal(auth.verifySessionToken(token, secret, issuedAt + (9 * 60 * 60 * 1000)), false);
});

test("login requires a confirmed approved email session and password", async function () {
  var previousPassword = process.env.ADMIN_PASSWORD;
  var previousSecret = process.env.ADMIN_SESSION_SECRET;
  var previousEmail = process.env.ADMIN_EMAIL;
  var previousSupabaseUrl = process.env.SUPABASE_URL;
  var previousSupabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  var previousFetch = globalThis.fetch;
  process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
  process.env.ADMIN_SESSION_SECRET = "a-very-long-test-session-secret-value-123456";
  process.env.ADMIN_EMAIL = "owner@example.com";
  process.env.SUPABASE_URL = "https://example-project.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_abcdefghijklmnopqrstuvwx";
  globalThis.fetch = async function (url, options) {
    assert.equal(url, "https://example-project.supabase.co/auth/v1/user");
    assert.equal(options.headers.apikey, process.env.SUPABASE_PUBLISHABLE_KEY);
    var token = options.headers.Authorization.replace("Bearer ", "");
    var email = token === "other-token" ? "someone@example.com" : "OWNER@EXAMPLE.COM";
    return {
      ok: true,
      status: 200,
      json: async function () {
        return {
          id: "admin-1",
          email: email,
          email_confirmed_at: token === "unconfirmed-token" ? null : "2026-08-01T00:00:00Z"
        };
      }
    };
  };

  try {
    var failedLoginResponse = createResponse();
    await login({ method: "POST", body: { password: "wrong-password" }, headers: { authorization: "Bearer owner-token" } }, failedLoginResponse);
    assert.equal(failedLoginResponse.statusCode, 401);

    var wrongEmailResponse = createResponse();
    await login({ method: "POST", body: { password: process.env.ADMIN_PASSWORD }, headers: { authorization: "Bearer other-token" } }, wrongEmailResponse);
    assert.equal(wrongEmailResponse.statusCode, 401);

    var unconfirmedEmailResponse = createResponse();
    await login({ method: "POST", body: { password: process.env.ADMIN_PASSWORD }, headers: { authorization: "Bearer unconfirmed-token" } }, unconfirmedEmailResponse);
    assert.equal(unconfirmedEmailResponse.statusCode, 401);

    var missingVerificationResponse = createResponse();
    await login({ method: "POST", body: { password: process.env.ADMIN_PASSWORD }, headers: {} }, missingVerificationResponse);
    assert.equal(missingVerificationResponse.statusCode, 401);

    var loginResponse = createResponse();
    await login({ method: "POST", body: { password: process.env.ADMIN_PASSWORD }, headers: { authorization: "Bearer owner-token" } }, loginResponse);
    assert.equal(loginResponse.statusCode, 200);
    assert.match(loginResponse.headers["Set-Cookie"], /HttpOnly/);
    assert.match(loginResponse.headers["Set-Cookie"], /SameSite=Strict/);

    var cookie = loginResponse.headers["Set-Cookie"].split(";")[0];
    var sessionResponse = createResponse();
    session({ method: "GET", headers: { cookie: cookie } }, sessionResponse);
    assert.equal(sessionResponse.statusCode, 200);
    assert.deepEqual(sessionResponse.body, { authenticated: true });

    var logoutResponse = createResponse();
    logout({ method: "POST", headers: { cookie: cookie } }, logoutResponse);
    assert.equal(logoutResponse.statusCode, 200);
    assert.match(logoutResponse.headers["Set-Cookie"], /Max-Age=0/);
  } finally {
    if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previousPassword;
    if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = previousSecret;
    if (previousEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = previousEmail;
    if (previousSupabaseUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousSupabaseUrl;
    if (previousSupabaseKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
    else process.env.SUPABASE_PUBLISHABLE_KEY = previousSupabaseKey;
    globalThis.fetch = previousFetch;
  }
});

test("API reports missing production configuration", function () {
  var previousPassword = process.env.ADMIN_PASSWORD;
  var previousSecret = process.env.ADMIN_SESSION_SECRET;
  var previousEmail = process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.ADMIN_EMAIL;

  try {
    var response = createResponse();
    session({ method: "GET", headers: {} }, response);
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { error: "admin_auth_not_configured" });
  } finally {
    if (previousPassword !== undefined) process.env.ADMIN_PASSWORD = previousPassword;
    if (previousSecret !== undefined) process.env.ADMIN_SESSION_SECRET = previousSecret;
    if (previousEmail !== undefined) process.env.ADMIN_EMAIL = previousEmail;
  }
});

test("login requires an approved administrator email configuration", async function () {
  var previousPassword = process.env.ADMIN_PASSWORD;
  var previousSecret = process.env.ADMIN_SESSION_SECRET;
  var previousEmail = process.env.ADMIN_EMAIL;
  process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
  process.env.ADMIN_SESSION_SECRET = "a-very-long-test-session-secret-value-123456";
  delete process.env.ADMIN_EMAIL;

  try {
    var response = createResponse();
    await login({ method: "POST", body: { password: process.env.ADMIN_PASSWORD }, headers: {} }, response);
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { error: "admin_auth_not_configured" });
  } finally {
    if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previousPassword;
    if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = previousSecret;
    if (previousEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = previousEmail;
  }
});
