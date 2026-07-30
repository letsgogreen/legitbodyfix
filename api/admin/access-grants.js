"use strict";

var auth = require("../../lib/admin-auth");
var grants = require("../../lib/admin-access-grants");
var paypal = require("../../lib/paypal-payments");
var access = require("../../lib/supabase-access");

function readBody(request) {
  if (typeof request.body === "string") return JSON.parse(request.body);
  return request.body || {};
}

module.exports = async function handler(request, response) {
  auth.setApiHeaders(response);
  response.setHeader("Allow", "POST");

  if (request.method !== "POST") {
    return response.status(405).json({ error: "method_not_allowed" });
  }

  var authConfig = auth.getConfig();
  if (!authConfig) return response.status(503).json({ error: "admin_auth_not_configured" });
  if (!auth.isAuthenticated(request, authConfig)) {
    return response.status(401).json({ error: "authentication_required" });
  }
  if (process.env.VERCEL_ENV !== "production") {
    return response.status(409).json({ error: "access_grants_disabled_in_preview" });
  }

  var body;
  try {
    body = readBody(request);
  } catch (error) {
    return response.status(400).json({ error: "invalid_json" });
  }

  // There is one paid program today. Keep this allowlist server-side so an
  // administrator cannot accidentally grant access to an arbitrary identifier.
  if (body.programId !== paypal.PROGRAM.id) {
    return response.status(422).json({ error: "unknown_program" });
  }

  var accessConfig = access.getServerConfig();
  if (!accessConfig) {
    return response.status(503).json({
      error: "access_service_not_configured",
      details: access.getServerConfigIssues()
    });
  }

  try {
    var grant = await grants.grantAccess(accessConfig, {
      email: body.email,
      programId: body.programId
    });
    console.info("[admin/access-grants] granted library access", {
      programId: grant.programId,
      emailDomain: grant.email.split("@")[1] || ""
    });
    return response.status(200).json({
      granted: true,
      email: grant.email,
      programId: grant.programId
    });
  } catch (error) {
    if (error instanceof grants.AccessGrantError) {
      console.error("[admin/access-grants] request failed", {
        code: error.code,
        statusCode: error.statusCode,
        provider: error.details
      });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[admin/access-grants] unexpected failure", {
      message: error && error.message ? error.message : String(error)
    });
    return response.status(500).json({ error: "access_grant_unavailable" });
  }
};

