"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var sales = require("../lib/admin-sales");

var config = { url: "https://example-project.supabase.co", secretKey: "sb_secret_abcdefghijklmnopqrstuvwx" };

function response(body) {
  return { ok: true, status: 200, json: async function () { return body; } };
}

test("lists normalized sales without exposing storage credentials", async function () {
  var calls = [];
  var rows = [{
    id: "payment-1",
    provider: "paypal",
    provider_order_id: "5O190127TN364715T",
    provider_capture_id: "3GG79435FJ124315M",
    program_id: "neck-shoulder-reset",
    buyer_email: "buyer@example.com",
    amount: 170,
    currency: "USD",
    status: "completed",
    paid_at: "2026-07-28T00:00:00Z"
  }];
  var result = await sales.listSales(config, function () { return { title: "Full Body Restoration Package" }; }, async function (url, options) {
    calls.push({ url: url, options: options });
    return response(rows);
  });

  assert.equal(result[0].buyerEmail, "buyer@example.com");
  assert.equal(result[0].productTitle, "Full Body Restoration Package");
  assert.equal(result[0].amount, 170);
  assert.equal(result[0].orderReference, "64715T");
  assert.equal(Object.hasOwn(result[0], "providerCaptureId"), false);
  assert.match(calls[0].url, /payment_orders/);
  assert.equal(JSON.stringify(result).includes(config.secretKey), false);
});
