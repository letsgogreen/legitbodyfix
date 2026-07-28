"use strict";

var access = require("../../lib/supabase-access");

function setHeaders(response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

function getBearerToken(request) {
  var header = request.headers && request.headers.authorization;
  if (typeof header !== "string") return "";
  var match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

module.exports = async function handler(request, response) {
  setHeaders(response);
  response.setHeader("Allow", "GET");

  if (request.method !== "GET") {
    return response.status(405).json({ error: "method_not_allowed" });
  }

  var config = access.getServerConfig();
  if (!config) {
    var configurationIssues = access.getServerConfigIssues();
    console.error("[access/library] server configuration is invalid", {
      issues: configurationIssues
    });
    return response.status(503).json({
      error: "access_service_not_configured",
      details: configurationIssues
    });
  }

  var token = getBearerToken(request);
  if (!token) return response.status(401).json({ error: "authentication_required" });

  try {
    var user = await access.getUser(config, token);
    var programs = await access.listEntitlements(config, user.email);
    return response.status(200).json({ email: user.email, programs: programs });
  } catch (error) {
    if (error instanceof access.AccessError) {
      console.error("[access/library] request failed", {
        code: error.code,
        statusCode: error.statusCode
      });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[access/library] unexpected failure", {
      message: error && error.message ? error.message : String(error)
    });
    return response.status(500).json({ error: "access_library_unavailable" });
  }
};
