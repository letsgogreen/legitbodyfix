"use strict";

var paypal = require("../../../lib/paypal-payments");

function setHeaders(response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

function readBody(request) {
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
  if (Buffer.isBuffer(request.body)) return JSON.parse(request.body.toString("utf8") || "{}");
  return request.body || {};
}

module.exports = async function handler(request, response) {
  setHeaders(response);
  response.setHeader("Allow", "POST");
  if (request.method !== "POST") return response.status(405).json({ error: "method_not_allowed" });

  var config = paypal.getConfig();
  if (!config) return response.status(503).json({ error: "payment_service_not_configured" });

  var body;
  try {
    body = readBody(request);
  } catch (error) {
    return response.status(400).json({ error: "invalid_json" });
  }

  var productId = typeof body.productId === "string" ? body.productId.trim() : "";
  if (!productId || !paypal.getProduct(productId)) {
    return response.status(400).json({ error: "invalid_product" });
  }

  try {
    var order = await paypal.createOrder(config, productId);
    return response.status(201).json({ orderId: order.id });
  } catch (error) {
    if (error instanceof paypal.PaypalError) {
      console.error("[paypal/orders/create] request failed", { code: error.code, provider: error.details });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[paypal/orders/create] unexpected failure", { message: error && error.message ? error.message : String(error) });
    return response.status(502).json({ error: "payment_order_creation_failed" });
  }
};
