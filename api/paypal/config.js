"use strict";

var paypal = require("../../lib/paypal-payments");

module.exports = function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Allow", "GET");

  if (request.method !== "GET") return response.status(405).json({ error: "method_not_allowed" });

  var config = paypal.getPublicConfig();
  if (!config) {
    return response.status(503).json({
      error: "payment_service_not_configured",
      details: paypal.getConfigIssues()
    });
  }
  return response.status(200).json(config);
};
