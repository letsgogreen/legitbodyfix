"use strict";

var access = require("../../lib/supabase-access");
var paypal = require("../../lib/paypal-payments");
var entitlements = require("../../lib/payment-entitlements");

function readBody(request) {
  if (typeof request.body === "string") return JSON.parse(request.body);
  if (Buffer.isBuffer(request.body)) return JSON.parse(request.body.toString("utf8"));
  return request.body || {};
}

function setHeaders(response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

module.exports = async function handler(request, response) {
  setHeaders(response);
  response.setHeader("Allow", "POST");
  if (request.method !== "POST") return response.status(405).json({ error: "method_not_allowed" });

  var paypalConfig = paypal.getConfig();
  var storeConfig = entitlements.getConfig(access.getServerConfig());
  if (!paypalConfig || !paypalConfig.webhookId || !storeConfig) {
    return response.status(503).json({ error: "payment_webhook_not_configured" });
  }

  var event;
  try {
    event = readBody(request);
  } catch (error) {
    return response.status(400).json({ error: "invalid_json" });
  }

  try {
    await paypal.verifyWebhook(paypalConfig, request.headers, event);

    var recorded = await entitlements.findWebhookEvent(storeConfig, event.id);
    if (recorded && recorded.processed_at) return response.status(200).json({ received: true, duplicate: true });
    if (!recorded) await entitlements.recordWebhookEvent(storeConfig, event);

    var payment = await paypal.getCompletedWebhookPayment(paypalConfig, event);
    if (payment) await entitlements.recordPurchase(storeConfig, payment);
    await entitlements.markWebhookProcessed(storeConfig, event.id);
    return response.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof paypal.PaypalError || error instanceof entitlements.PaymentStoreError) {
      console.error("[paypal/webhook] request failed", { code: error.code, provider: error.details });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[paypal/webhook] unexpected failure", { message: error && error.message ? error.message : String(error) });
    return response.status(502).json({ error: "payment_webhook_failed" });
  }
};
