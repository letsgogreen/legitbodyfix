"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var auth = require("../lib/admin-auth");
var handler = require("../api/admin/videos");

function createResponse() {
  return {
    headers: {}, statusCode: 200, body: null,
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
}

function saveEnvironment() {
  var names = ["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY"];
  var previous = {};
  names.forEach(function (name) { previous[name] = process.env[name]; });
  return function () { names.forEach(function (name) { if (previous[name] === undefined) delete process.env[name]; else process.env[name] = previous[name]; }); };
}

function cookie() {
  return auth.createSessionCookie(auth.createSessionToken(process.env.ADMIN_SESSION_SECRET)).split(";")[0];
}

test("sales ledger requires admin authentication", async function () {
  var restore = saveEnvironment();
  try {
    setEnvironment();
    var response = createResponse();
    await handler({ method: "GET", query: { action: "sales" }, headers: {} }, response);
    assert.equal(response.statusCode, 401);
  } finally { restore(); }
});

test("authenticated admins can read the sales ledger", async function () {
  var restore = saveEnvironment();
  var originalFetch = globalThis.fetch;
  try {
    setEnvironment();
    globalThis.fetch = async function () {
      return {
        ok: true,
        status: 200,
        json: async function () {
          return [{ id: "payment-1", provider: "paypal", provider_order_id: "5O190127TN364715T", provider_capture_id: "3GG79435FJ124315M", program_id: "neck-shoulder-reset", buyer_email: "buyer@example.com", amount: 170, currency: "USD", status: "completed", paid_at: "2026-07-28T00:00:00Z" }];
        }
      };
    };

    var response = createResponse();
    await handler({ method: "GET", query: { action: "sales" }, headers: { cookie: cookie() } }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.sales[0].buyerEmail, "buyer@example.com");
    assert.equal(Object.hasOwn(response.body.sales[0], "providerCaptureId"), false);
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});

test("sales endpoint rejects all write requests", async function () {
  var restore = saveEnvironment();
  try {
    setEnvironment();
    var response = createResponse();
    await handler({ method: "POST", query: { action: "sales" }, headers: { cookie: cookie() }, body: {} }, response);
    assert.equal(response.statusCode, 405);
    assert.deepEqual(response.body, { error: "method_not_allowed" });
    assert.equal(response.headers.Allow, "GET");
  } finally { restore(); }
});
