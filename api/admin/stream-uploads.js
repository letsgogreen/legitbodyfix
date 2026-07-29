"use strict";

var auth = require("../../lib/admin-auth");
var stream = require("../../lib/cloudflare-stream");

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
    return response.status(409).json({ error: "uploads_disabled_in_preview" });
  }

  var config = stream.getStreamApiConfig();
  if (!config) {
    return response.status(503).json({
      error: "stream_upload_not_configured",
      details: stream.getStreamApiConfigIssues()
    });
  }

  var body;
  try {
    body = readBody(request);
  } catch (error) {
    return response.status(400).json({ error: "invalid_json" });
  }

  try {
    return response.status(200).json(await stream.createDirectUpload(config, body));
  } catch (error) {
    if (error instanceof stream.StreamError) {
      console.error("[admin/stream-uploads] Cloudflare Stream upload URL failed", {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[admin/stream-uploads] unexpected failure", {
      message: error && error.message ? error.message : String(error)
    });
    return response.status(500).json({ error: "stream_upload_url_generation_failed" });
  }
};
