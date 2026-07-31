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
  process.env.PAYPAL_ENV = "sandbox";
  process.env.PAYPAL_CLIENT_ID = "Aa1234567890_paypal-client-id-value";
  process.env.PAYPAL_CLIENT_SECRET = "Ee1234567890_paypal-client-secret-value";
  process.env.VERCEL_ENV = "production";
}

function saveEnvironment() {
  var names = ["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY", "PAYPAL_ENV", "PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "VERCEL_ENV"];
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

test("refunds are blocked on preview deployments", async function () {
  var restore = saveEnvironment();
  try {
    setEnvironment();
    process.env.VERCEL_ENV = "preview";
    var response = createResponse();
    await handler({ method: "POST", query: { action: "sales" }, headers: { cookie: cookie() }, body: { action: "refund", paymentId: "payment-1", confirmation: "REFUND" } }, response);
    assert.equal(response.statusCode, 409);
    assert.deepEqual(response.body, { error: "refunds_disabled_in_preview" });
  } finally { restore(); }
});

test("refunds use the server-owned capture and revoke access", async function () {
  var restore = saveEnvironment();
  var originalFetch = globalThis.fetch;
  try {
    setEnvironment();
    var calls = [];
    globalThis.fetch = async function (url, options) {
      calls.push({ url: url, options: options || {} });
      if (url.indexOf("payment_orders") !== -1 && (!options || !options.method)) {
        return { ok: true, status: 200, json: async function () { return [{ id: "payment-1", provider: "paypal", provider_order_id: "5O190127TN364715T", provider_capture_id: "3GG79435FJ124315M", program_id: "neck-shoulder-reset", buyer_email: "buyer@example.com", amount: 170, currency: "USD", status: "completed", paid_at: "2026-07-28T00:00:00Z" }]; } };
      }
      if (url.endsWith("/v1/oauth2/token")) return { ok: true, status: 200, json: async function () { return { access_token: "test-token" }; } };
      if (url.endsWith("/refund")) return { ok: true, status: 201, json: async function () { return { id: "9AB12345CD678901E", status: "COMPLETED", amount: { value: "170.00", currency_code: "USD" } }; } };
      return { ok: true, status: 204, json: async function () { return null; } };
    };

    var response = createResponse();
    await handler({ method: "POST", query: { action: "sales" }, headers: { cookie: cookie() }, body: { action: "refund", paymentId: "payment-1", confirmation: "REFUND" } }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.refunded, true);
    assert.equal(calls.some(function (call) { return call.url.endsWith("/v2/payments/captures/3GG79435FJ124315M/refund"); }), true);
    assert.equal(calls.some(function (call) { return call.url.indexOf("entitlements") !== -1 && call.options.method === "PATCH"; }), true);
  } finally {
    globalThis.fetch = originalFetch;
    restore();
  }
});
