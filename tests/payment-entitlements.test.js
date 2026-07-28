"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var store = require("../lib/payment-entitlements");

var config = { url: "https://example-project.supabase.co", secretKey: "sb_secret_abcdefghijklmnopqrstuvwx" };
var payment = {
  provider: "paypal",
  providerOrderId: "5O190127TN364715T",
  providerCaptureId: "3GG79435FJ124315M",
  programId: "neck-shoulder-reset",
  buyerEmail: "buyer@example.com",
  amount: 49,
  currency: "USD",
  paidAt: "2026-07-28T00:00:00Z"
};

function response(body) {
  return { ok: true, status: 200, json: async function () { return body; } };
}

test("records a verified payment before granting its entitlement", async function () {
  var calls = [];
  var fetcher = async function (url, options) {
    calls.push({ url: url, options: options || {} });
    if (calls.length === 1) return response([]);
    if (calls.length === 2) return response([{ id: "payment-order-1" }]);
    return response([]);
  };

  var result = await store.recordPurchase(config, payment, fetcher);
  assert.deepEqual(result, { paymentOrderId: "payment-order-1", duplicate: false });
  assert.match(calls[0].url, /payment_orders/);
  assert.equal(calls[1].options.method, "POST");
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    provider: "paypal",
    provider_order_id: payment.providerOrderId,
    provider_capture_id: payment.providerCaptureId,
    program_id: payment.programId,
    buyer_email: payment.buyerEmail,
    amount: 49,
    currency: "USD",
    status: "completed",
    paid_at: payment.paidAt
  });
  assert.deepEqual(JSON.parse(calls[2].options.body), {
    buyer_email: payment.buyerEmail,
    program_id: payment.programId,
    payment_order_id: "payment-order-1",
    status: "active"
  });
});

test("does not create a second payment order for the same PayPal capture", async function () {
  var calls = [];
  var fetcher = async function (url, options) {
    calls.push({ url: url, options: options || {} });
    if (calls.length === 1) return response([{ id: "existing-payment-order" }]);
    return response([]);
  };

  var result = await store.recordPurchase(config, payment, fetcher);
  assert.deepEqual(result, { paymentOrderId: "existing-payment-order", duplicate: true });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].options.method, "POST");
});
