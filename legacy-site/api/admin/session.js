"use strict";

var auth = require("../../lib/admin-auth");

module.exports = function handler(request, response) {
  auth.setApiHeaders(response);
  response.setHeader("Allow", "GET");

  if (request.method !== "GET") {
    return response.status(405).json({ error: "method_not_allowed" });
  }

  var config = auth.getConfig();
  if (!config) {
    return response.status(503).json({ error: "admin_auth_not_configured" });
  }

  if (!auth.isAuthenticated(request, config)) {
    response.setHeader("Set-Cookie", auth.clearSessionCookie());
    return response.status(401).json({ authenticated: false });
  }

  return response.status(200).json({ authenticated: true });
};
