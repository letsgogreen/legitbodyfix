"use strict";

var auth = require("../../lib/admin-auth");
var access = require("../../lib/supabase-access");

function getBearerToken(request) {
  var header = request.headers && request.headers.authorization;
  if (typeof header !== "string") return "";
  var match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

module.exports = async function handler(request, response) {
  auth.setApiHeaders(response);
  response.setHeader("Allow", "POST");

  if (request.method !== "POST") {
    return response.status(405).json({ error: "method_not_allowed" });
  }

  var config = auth.getConfig();
  var supabaseConfig = access.getPublicConfig();
  if (!config || !config.email || !supabaseConfig) {
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

  var passwordMatches = auth.safeEqual(body.password || "", config.password);
  var bearerToken = getBearerToken(request);
  if (!bearerToken) {
    return response.status(401).json({ error: "invalid_credentials" });
  }

  var user;
  try {
    user = await access.getUser(supabaseConfig, bearerToken);
  } catch (error) {
    if (error instanceof access.AccessError && error.statusCode === 401) {
      return response.status(401).json({ error: "invalid_credentials" });
    }
    console.error("[admin/login] email verification service failed", {
      code: error && error.code ? error.code : "unexpected_error",
      statusCode: error && error.statusCode ? error.statusCode : 500
    });
    return response.status(503).json({ error: "admin_auth_unavailable" });
  }

  var emailMatches = auth.safeEqual(auth.normalizeEmail(user.email), config.email);
  if (!user.emailConfirmed || !emailMatches || !passwordMatches) {
    console.warn("[admin/login] rejected an unverified or unauthorized sign-in", {
      emailConfirmed: Boolean(user.emailConfirmed),
      emailAllowed: emailMatches
    });
    return response.status(401).json({ error: "invalid_credentials" });
  }

  var token = auth.createSessionToken(config.secret);
  response.setHeader("Set-Cookie", auth.createSessionCookie(token));
  return response.status(200).json({ authenticated: true });
};
