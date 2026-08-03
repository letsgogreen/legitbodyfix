"use strict";

var stripe = require("../../lib/stripe-payments");

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  var config = stripe.getPublicConfig();
  if (!config) {
    return response.status(503).json({ error: "stripe_not_configured", details: stripe.getConfigIssues() });
  }
  response.setHeader("Cache-Control", "no-store");
  return response.status(200).json(config);
};
