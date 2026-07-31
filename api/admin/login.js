"use strict";

var auth = require("../../lib/admin-auth");

module.exports = function handler(request, response) {
  auth.setApiHeaders(response);
  response.setHeader("Allow", "POST");

  if (request.method !== "POST") {
    return response.status(405).json({ error: "method_not_allowed" });
  }

  var config = auth.getConfig();
  if (!config || !config.email) {
    return response.status(503).json({ error: "admin_auth_not_configured" });
  }

  var body = request.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return response.status(400).json({ error: "invalid_json" });
    }
  }

  var emailMatches = auth.safeEqual(auth.normalizeEmail(body.email), config.email);
  var passwordMatches = auth.safeEqual(body.password || "", config.password);
  if (!emailMatches || !passwordMatches) {
    return response.status(401).json({ error: "invalid_credentials" });
  }

  var token = auth.createSessionToken(config.secret);
  response.setHeader("Set-Cookie", auth.createSessionCookie(token));
  return response.status(200).json({ authenticated: true });
};
