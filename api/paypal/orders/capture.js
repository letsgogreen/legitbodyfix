"use strict";

var access = require("../../../lib/supabase-access");
var paypal = require("../../../lib/paypal-payments");
var entitlements = require("../../../lib/payment-entitlements");

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
  if (!paypalConfig || !storeConfig) return response.status(503).json({ error: "payment_service_not_configured" });

  var body;
  try {
    body = readBody(request);
  } catch (error) {
    return response.status(400).json({ error: "invalid_json" });
  }

  try {
    var payment = await paypal.captureOrder(paypalConfig, body.orderId);
    var result = await entitlements.recordPurchase(storeConfig, payment);
    console.info("[paypal/orders/capture] verified payment", {
      programId: payment.programId,
      amount: payment.amount,
      currency: payment.currency,
      duplicate: result.duplicate
    });
    return response.status(200).json({
      completed: true,
      duplicate: result.duplicate,
      libraryUrl: "/library.html"
    });
  } catch (error) {
    if (error instanceof paypal.PaypalError || error instanceof entitlements.PaymentStoreError) {
      console.error("[paypal/orders/capture] request failed", { code: error.code, provider: error.details });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[paypal/orders/capture] unexpected failure", { message: error && error.message ? error.message : String(error) });
    return response.status(502).json({ error: "payment_capture_failed" });
  }
};
