"use strict";

var access = require("../../../lib/supabase-access");
var entitlements = require("../../../lib/payment-entitlements");
var stripe = require("../../../lib/stripe-payments");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  var stripeConfig = stripe.getConfig();
  var storeConfig = entitlements.getConfig(access.getServerConfig());
  if (!stripeConfig || !storeConfig) return response.status(503).json({ error: "payment_service_not_configured" });
  var body = request.body && typeof request.body === "object" ? request.body : {};
  try {
    var session = await stripe.getCheckoutSession(stripeConfig, body.sessionId);
    var payment = stripe.validatePaidSession(session);
    var result = await entitlements.recordPurchase(storeConfig, payment);
    console.info("[stripe/checkout/confirm] verified payment", {
      sessionId: payment.providerOrderId,
      programId: payment.programId,
      duplicate: result.duplicate
    });
    return response.status(200).json({ completed: true, libraryUrl: "/library.html" });
  } catch (error) {
    if (error instanceof stripe.StripePaymentError || error instanceof entitlements.PaymentStoreError) {
      console.error("[stripe/checkout/confirm] request failed", { code: error.code, provider: error.details });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[stripe/checkout/confirm] unexpected failure", { message: error && error.message ? error.message : String(error) });
    return response.status(500).json({ error: "payment_request_failed" });
  }
};
