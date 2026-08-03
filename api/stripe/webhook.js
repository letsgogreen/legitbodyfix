"use strict";

var access = require("../../lib/supabase-access");
var entitlements = require("../../lib/payment-entitlements");
var stripe = require("../../lib/stripe-payments");

function readRawBody(request) {
  if (Buffer.isBuffer(request.body)) return Promise.resolve(request.body.toString("utf8"));
  if (typeof request.body === "string") return Promise.resolve(request.body);
  return new Promise(function (resolve, reject) {
    var chunks = [];
    request.on("data", function (chunk) { chunks.push(Buffer.from(chunk)); });
    request.on("end", function () { resolve(Buffer.concat(chunks).toString("utf8")); });
    request.on("error", reject);
  });
}

async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  var stripeConfig = stripe.getConfig();
  var storeConfig = entitlements.getConfig(access.getServerConfig());
  if (!stripeConfig || !stripeConfig.webhookSecret || !storeConfig) {
    return response.status(503).json({ error: "payment_service_not_configured" });
  }
  try {
    var rawBody = await readRawBody(request);
    var event = stripe.verifyWebhook(stripeConfig, rawBody, request.headers && request.headers["stripe-signature"]);
    if (!event || typeof event.id !== "string" || !/^evt_[A-Za-z0-9_]+$/.test(event.id)) {
      return response.status(400).json({ error: "invalid_webhook_event" });
    }
    var recorded = await entitlements.findWebhookEvent(storeConfig, event.id);
    if (recorded && recorded.processed_at) return response.status(200).json({ received: true, duplicate: true });
    if (!recorded) await entitlements.recordWebhookEvent(storeConfig, event);
    var payment = stripe.getCompletedWebhookPayment(event);
    if (payment) await entitlements.recordPurchase(storeConfig, payment);
    await entitlements.markWebhookProcessed(storeConfig, event.id);
    return response.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof stripe.StripePaymentError || error instanceof entitlements.PaymentStoreError) {
      console.error("[stripe/webhook] request failed", { code: error.code, provider: error.details });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[stripe/webhook] unexpected failure", { message: error && error.message ? error.message : String(error) });
    return response.status(500).json({ error: "webhook_processing_failed" });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
