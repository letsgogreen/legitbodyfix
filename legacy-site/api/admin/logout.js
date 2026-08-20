"use strict";

var auth = require("../../lib/admin-auth");

module.exports = function handler(request, response) {
  auth.setApiHeaders(response);
  response.setHeader("Allow", "POST");

  if (request.method !== "POST") {
    return response.status(405).json({ error: "method_not_allowed" });
  }

  response.setHeader("Set-Cookie", auth.clearSessionCookie());
  return response.status(200).json({ authenticated: false });
};
