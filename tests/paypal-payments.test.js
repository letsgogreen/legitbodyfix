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

test("returns only browser-safe checkout configuration, including the catalog", function () {
  var config = paypal.getPublicConfig(environment());
  assert.equal(config.clientId, "Aa1234567890_paypal-client-id-value");
  assert.equal(config.currency, "USD");
  assert.equal(config.environment, "sandbox");
  assert.equal(JSON.stringify(config).includes("secret"), false);

  assert.ok(Array.isArray(config.catalog) && config.catalog.length > 1);
  var bundle = config.catalog.find(function (product) { return product.id === "neck-shoulder-reset"; });
  assert.deepEqual(bundle, {
    id: "neck-shoulder-reset",
    title: "Full Body Restoration Package",
    amount: "170.00",
    currency: "USD"
  });
  var singleVideo = config.catalog.find(function (product) { return product.id === "neck-alignment"; });
  assert.equal(singleVideo.amount, "12.00");
  assert.equal(singleVideo.currency, "USD");
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

  var order = await paypal.createOrder(paypal.getConfig(environment()), "neck-shoulder-reset", fetcher);
  assert.equal(order.id, "5O190127TN364715T");
  var body = JSON.parse(calls[1].options.body);
  assert.equal(body.purchase_units[0].custom_id, "neck-shoulder-reset");
  assert.deepEqual(body.purchase_units[0].amount, { currency_code: "USD", value: "170.00" });
});

test("creates a fixed-price order for a single purchasable video", async function () {
  var calls = [];
  var fetcher = async function (url, options) {
    calls.push({ url: url, options: options });
    if (url.endsWith("/v1/oauth2/token")) {
      return { ok: true, status: 200, json: async function () { return { access_token: "test-token" }; } };
    }
    return { ok: true, status: 201, json: async function () { return { id: "5O190127TN364715U" }; } };
  };

  var order = await paypal.createOrder(paypal.getConfig(environment()), "neck-alignment", fetcher);
  assert.equal(order.id, "5O190127TN364715U");
  var body = JSON.parse(calls[1].options.body);
  assert.equal(body.purchase_units[0].custom_id, "neck-alignment");
  assert.deepEqual(body.purchase_units[0].amount, { currency_code: "USD", value: "12.00" });
});

test("rejects order creation for a product that is not in the catalog", async function () {
  await assert.rejects(function () {
    return paypal.createOrder(paypal.getConfig(environment()), "not-a-real-product", async function () {
      return { ok: true, status: 200, json: async function () { return { access_token: "test-token" }; } };
    });
  }, /not available for purchase/);
});

test("accepts only a completed matching order for entitlement creation", function () {
  var payment = paypal.validateCompletedOrder({
    id: "5O190127TN364715T",
    status: "COMPLETED",
    payer: { email_address: "Buyer@Example.com" },
    purchase_units: [{
      custom_id: "neck-shoulder-reset",
      amount: { currency_code: "USD", value: "170.00" },
      payments: { captures: [{ id: "3GG79435FJ124315M", status: "COMPLETED", create_time: "2026-07-28T00:00:00Z" }] }
    }]
  });

  assert.equal(payment.buyerEmail, "buyer@example.com");
  assert.equal(payment.providerCaptureId, "3GG79435FJ124315M");
  assert.equal(payment.programId, "neck-shoulder-reset");
  assert.throws(function () {
    paypal.validateCompletedOrder({ status: "COMPLETED", purchase_units: [] });
  }, /could not be verified/);
});

test("validates a completed order for an individually purchased video at its own price", function () {
  var payment = paypal.validateCompletedOrder({
    id: "5O190127TN364715U",
    status: "COMPLETED",
    payer: { email_address: "Buyer@Example.com" },
    purchase_units: [{
      custom_id: "neck-alignment",
      amount: { currency_code: "USD", value: "12.00" },
      payments: { captures: [{ id: "3GG79435FJ124315N", status: "COMPLETED", create_time: "2026-07-30T00:00:00Z" }] }
    }]
  });

  assert.equal(payment.programId, "neck-alignment");
  assert.equal(payment.amount, 12);

  // Paying the single-video price should not be accepted as payment for the
  // full bundle (custom_id mismatch against the claimed amount).
  assert.throws(function () {
    paypal.validateCompletedOrder({
      id: "5O190127TN364715V",
      status: "COMPLETED",
      payer: { email_address: "buyer@example.com" },
      purchase_units: [{
        custom_id: "neck-shoulder-reset",
        amount: { currency_code: "USD", value: "12.00" },
        payments: { captures: [{ id: "3GG79435FJ124315P", status: "COMPLETED" }] }
      }]
    });
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
            amount: { currency_code: "USD", value: "170.00" },
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
