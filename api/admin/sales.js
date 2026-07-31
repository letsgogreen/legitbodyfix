"use strict";

var auth = require("../../lib/admin-auth");
var access = require("../../lib/supabase-access");
var paypal = require("../../lib/paypal-payments");
var sales = require("../../lib/admin-sales");

function readBody(request) {
  if (typeof request.body === "string") return JSON.parse(request.body);
  return request.body || {};
}

function handleError(response, error) {
  if (error instanceof sales.SalesError || error instanceof paypal.PaypalError) {
    console.error("[admin/sales] request failed", {
      code: error.code,
      statusCode: error.statusCode,
      provider: error.details || null
    });
    return response.status(error.statusCode).json({ error: error.code });
  }
  console.error("[admin/sales] unexpected failure", {
    message: error && error.message ? error.message : String(error)
  });
  return response.status(500).json({ error: "sales_service_unavailable" });
}

module.exports = async function handler(request, response) {
  auth.setApiHeaders(response);

  if (["GET", "POST"].indexOf(request.method) === -1) {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  var authConfig = auth.getConfig();
  if (!authConfig) return response.status(503).json({ error: "admin_auth_not_configured" });
  if (!auth.isAuthenticated(request, authConfig)) {
    return response.status(401).json({ error: "authentication_required" });
  }

  var storeConfig = access.getServerConfig();
  if (!storeConfig) {
    return response.status(503).json({
      error: "sales_service_not_configured",
      details: access.getServerConfigIssues()
    });
  }

  try {
    if (request.method === "GET") {
      return response.status(200).json({
        sales: await sales.listSales(storeConfig, paypal.getProduct)
      });
    }

    if (process.env.VERCEL_ENV !== "production") {
      return response.status(409).json({ error: "refunds_disabled_in_preview" });
    }

    var body;
    try {
      body = readBody(request);
    } catch (error) {
      return response.status(400).json({ error: "invalid_json" });
    }
    if (body.action !== "refund" || body.confirmation !== "REFUND") {
      return response.status(422).json({ error: "refund_confirmation_required" });
    }

    var payment = await sales.findSale(storeConfig, body.paymentId, paypal.getProduct);
    if (payment.provider !== "paypal" || payment.status !== "completed" || !payment.providerCaptureId) {
      return response.status(409).json({ error: "payment_not_refundable" });
    }

    var paypalConfig = paypal.getConfig();
    if (!paypalConfig) return response.status(503).json({ error: "paypal_not_configured" });

    var refund = await paypal.refundCapture(
      paypalConfig,
      payment.providerCaptureId,
      "lbf-refund-" + payment.providerCaptureId
    );
    var status = await sales.markRefunded(storeConfig, payment, refund);

    console.info("[admin/sales] refund accepted", {
      paymentId: payment.id,
      programId: payment.programId,
      refundStatus: refund.status
    });
    return response.status(200).json({
      refunded: true,
      status: status,
      refundId: refund.id
    });
  } catch (error) {
    return handleError(response, error);
  }
};
