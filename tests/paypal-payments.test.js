"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var paypal = require("../lib/paypal-payments");

function environment() {
  return {
    PAYPAL_ENV: "sandbox",
    PAYPAL_CLIENT_ID: "Aa1234567890_paypal-client-id-value",
    PAYPAL_CLIENT_SECRET: "Ee1234567890_paypal-client-secret-value",
    PAYPAL_WEBHOOK_ID: "7AB12345CD678901E"
  };
}

test("returns only browser-safe checkout configuration", function () {
  var config = paypal.getPublicConfig(environment());
  assert.deepEqual(config, {
    clientId: "Aa1234567890_paypal-client-id-value",
    currency: "USD",
    environment: "sandbox"
  });
  assert.equal(JSON.stringify(config).includes("secret"), false);
});

test("creates a fixed-price order with a server-owned program identifier", async function () {
  var calls = [];
  var fetcher = async function (url, options) {
    calls.push({ url: url, options: options });
    if (url.endsWith("/v1/oauth2/token")) {
      return { ok: true, status: 200, json: async function () { return { access_token: "test-token" }; } };
    }
    return { ok: true, status: 201, json: async function () { return { id: "5O190127TN364715T" }; } };
  };

  var order = await paypal.createOrder(paypal.getConfig(environment()), fetcher);
  assert.equal(order.id, "5O190127TN364715T");
  var body = JSON.parse(calls[1].options.body);
  assert.equal(body.purchase_units[0].custom_id, "neck-shoulder-reset");
  assert.deepEqual(body.purchase_units[0].amount, { currency_code: "USD", value: "49.00" });
});

test("accepts only a completed matching order for entitlement creation", function () {
  var payment = paypal.validateCompletedOrder({
    id: "5O190127TN364715T",
    status: "COMPLETED",
    payer: { email_address: "Buyer@Example.com" },
    purchase_units: [{
      custom_id: "neck-shoulder-reset",
      amount: { currency_code: "USD", value: "49.00" },
      payments: { captures: [{ id: "3GG79435FJ124315M", status: "COMPLETED", create_time: "2026-07-28T00:00:00Z" }] }
    }]
  });

  assert.equal(payment.buyerEmail, "buyer@example.com");
  assert.equal(payment.providerCaptureId, "3GG79435FJ124315M");
  assert.throws(function () {
    paypal.validateCompletedOrder({ status: "COMPLETED", purchase_units: [] });
  }, /could not be verified/);
});

test("captures first, then validates the complete order representation", async function () {
  var calls = [];
  var fetcher = async function (url, options) {
    calls.push({ url: url, options: options });
    if (url.endsWith("/v1/oauth2/token")) {
      return { ok: true, status: 200, json: async function () { return { access_token: "test-token" }; } };
    }
    if (url.endsWith("/capture")) {
      return {
        ok: true,
        status: 201,
        json: async function () {
          return { id: "5O190127TN364715T", status: "COMPLETED" };
        }
      };
    }
    return {
      ok: true,
      status: 200,
      json: async function () {
        return {
          id: "5O190127TN364715T",
          status: "COMPLETED",
          payer: { email_address: "Buyer@Example.com" },
          purchase_units: [{
            custom_id: "neck-shoulder-reset",
            amount: { currency_code: "USD", value: "49.00" },
            payments: { captures: [{ id: "3GG79435FJ124315M", status: "COMPLETED", create_time: "2026-07-28T00:00:00Z" }] }
          }]
        };
      }
    };
  };

  var payment = await paypal.captureOrder(paypal.getConfig(environment()), "5O190127TN364715T", fetcher);
  assert.equal(payment.providerCaptureId, "3GG79435FJ124315M");
  assert.equal(calls.some(function (call) { return call.url.endsWith("/capture"); }), true);
  assert.equal(calls.some(function (call) { return call.url.endsWith("/v2/checkout/orders/5O190127TN364715T"); }), true);
});
