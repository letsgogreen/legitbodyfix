"use strict";

var stripe = require("../../../lib/stripe-payments");

function requestOrigin(request) {
  var forwardedHost = request.headers && request.headers["x-forwarded-host"];
  var host = String(forwardedHost || request.headers && request.headers.host || "").split(",")[0].trim();
  var forwardedProto = String(request.headers && request.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  if (!/^[A-Za-z0-9.-]+(?::\d{1,5})?$/.test(host)) return "";
  if (forwardedProto !== "https" && forwardedProto !== "http") return "";
  return forwardedProto + "://" + host;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  var config = stripe.getConfig();
  if (!config) return response.status(503).json({ error: "stripe_not_configured", details: stripe.getConfigIssues() });
  var body = request.body && typeof request.body === "object" ? request.body : {};
  try {
    var session = await stripe.createCheckoutSession(config, body.productId, requestOrigin(request));
    return response.status(200).json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    if (error instanceof stripe.StripePaymentError) {
      console.error("[stripe/checkout/create] request failed", { code: error.code, provider: error.details });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[stripe/checkout/create] unexpected failure", { message: error && error.message ? error.message : String(error) });
    return response.status(500).json({ error: "payment_request_failed" });
  }
};
