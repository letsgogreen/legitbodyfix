"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var crypto = require("node:crypto");
var stripe = require("../lib/stripe-payments");

function environment(extra) {
  return Object.assign({
    STRIPE_SECRET_KEY: ["sk", "test", "fixture_key_not_a_credential_123456789"].join("_"),
    STRIPE_WEBHOOK_SECRET: "whsec_exampleWebhookSecret123456789"
  }, extra || {});
}

function paidSession(overrides) {
  return Object.assign({
    id: "cs_test_exampleCheckoutSession123456789",
    status: "complete",
    payment_status: "paid",
    amount_total: 17000,
    currency: "usd",
    payment_intent: "pi_examplePaymentIntent123456",
    customer_details: { email: "Buyer@Example.com" },
    metadata: { product_id: "neck-shoulder-reset" },
    created: 1785196800
  }, overrides || {});
}

test("returns a browser-safe Stripe configuration and server-owned catalog", function () {
  var config = stripe.getPublicConfig(environment());
  assert.equal(config.environment, "test");
  assert.equal(JSON.stringify(config).includes("SecretKey"), false);
  assert.equal(config.catalog.find(function (item) { return item.id === "neck-shoulder-reset"; }).amount, "170.00");
  assert.deepEqual(stripe.getConfigIssues(environment({
    VERCEL_ENV: "preview",
    STRIPE_SECRET_KEY: ["sk", "live", "fixture_key_not_a_credential_123456789"].join("_")
  })), ["STRIPE_SECRET_KEY_LIVE_IN_PREVIEW"]);
});

test("creates a hosted card checkout using the catalog price", async function () {
  var call;
  var fetcher = async function (url, options) {
    call = { url: url, options: options };
    return {
      ok: true,
      status: 200,
      json: async function () {
        return { id: "cs_test_exampleCheckoutSession123456789", url: "https://checkout.stripe.com/c/pay/example" };
      }
    };
  };
  var result = await stripe.createCheckoutSession(stripe.getConfig(environment()), "neck-shoulder-reset", "https://preview.example.com", fetcher);
  assert.equal(result.id, "cs_test_exampleCheckoutSession123456789");
  assert.equal(call.url, "https://api.stripe.com/v1/checkout/sessions");
  var body = new URLSearchParams(call.options.body);
  assert.equal(body.get("line_items[0][price_data][unit_amount]"), "17000");
  assert.equal(body.get("metadata[product_id]"), "neck-shoulder-reset");
  assert.match(body.get("success_url"), /session_id=\{CHECKOUT_SESSION_ID\}/);
  assert.equal(body.get("payment_method_types[0]"), "card");
});

test("validates a paid Stripe session before creating access", function () {
  var payment = stripe.validatePaidSession(paidSession());
  assert.equal(payment.provider, "stripe");
  assert.equal(payment.providerCaptureId, "pi_examplePaymentIntent123456");
  assert.equal(payment.buyerEmail, "buyer@example.com");
  assert.equal(payment.programId, "neck-shoulder-reset");
  assert.equal(payment.amount, 170);
});

test("rejects client-independent price, product, and status mismatches", function () {
  assert.throws(function () { stripe.validatePaidSession(paidSession({ amount_total: 1200 })); }, /could not be verified/);
  assert.throws(function () { stripe.validatePaidSession(paidSession({ payment_status: "unpaid" })); }, /could not be verified/);
  assert.throws(function () { stripe.validatePaidSession(paidSession({ metadata: { product_id: "not-real" } })); }, /could not be verified/);
});

test("verifies Stripe webhook signatures and rejects stale signatures", function () {
  var config = stripe.getConfig(environment());
  var timestamp = 1785196800;
  var body = JSON.stringify({ id: "evt_example123", type: "checkout.session.completed", data: { object: paidSession() } });
  var digest = crypto.createHmac("sha256", config.webhookSecret).update(String(timestamp) + "." + body).digest("hex");
  var event = stripe.verifyWebhook(config, body, "t=" + timestamp + ",v1=" + digest, timestamp + 10);
  assert.equal(event.id, "evt_example123");
  assert.throws(function () { stripe.verifyWebhook(config, body, "t=" + timestamp + ",v1=" + digest, timestamp + 301); }, /signature is invalid/);
  assert.throws(function () { stripe.verifyWebhook(config, body + " ", "t=" + timestamp + ",v1=" + digest, timestamp); }, /signature is invalid/);
});

test("turns only successful Checkout events into verified payments", function () {
  var event = { type: "checkout.session.completed", data: { object: paidSession() } };
  assert.equal(stripe.getCompletedWebhookPayment(event).provider, "stripe");
  assert.equal(stripe.getCompletedWebhookPayment({ type: "customer.created", data: {} }), null);
});
