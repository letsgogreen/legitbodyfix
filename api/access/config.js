"use strict";

var access = require("../../lib/supabase-access");
var paypal = require("../../lib/paypal-payments");

function setHeaders(response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

module.exports = function handler(request, response) {
  setHeaders(response);
  response.setHeader("Allow", "GET");

  if (request.method !== "GET") {
    return response.status(405).json({ error: "method_not_allowed" });
  }

  var service = request.query && request.query.service;
  if (Array.isArray(service)) service = service[0];

  if (service === "paypal") {
    var paymentConfig = paypal.getPublicConfig();
    if (!paymentConfig) {
      return response.status(503).json({
        error: "payment_service_not_configured",
        details: paypal.getConfigIssues()
      });
    }
    return response.status(200).json(paymentConfig);
  }

  var config = access.getPublicConfig();
  if (!config) {
    return response.status(503).json({
      error: "access_login_not_configured",
      details: access.getPublicConfigIssues()
    });
  }

  return response.status(200).json(config);
};
