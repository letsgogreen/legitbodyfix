"use strict";

var auth = require("../../lib/admin-auth");
var stream = require("../../lib/cloudflare-stream");

function getVideoId(request) {
  var value = request.query && request.query.streamVideoId;
  if (Array.isArray(value)) value = value[0];
  return typeof value === "string" ? value.trim() : "";
}

module.exports = async function handler(request, response) {
  auth.setApiHeaders(response);
  response.setHeader("Allow", "GET");

  if (request.method !== "GET") {
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

  try {
    return response.status(200).json(await stream.getVideoStatus(config, getVideoId(request)));
  } catch (error) {
    if (error instanceof stream.StreamError) {
      console.error("[admin/stream-status] Cloudflare Stream status failed", {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      });
      return response.status(error.statusCode).json({ error: error.code });
    }
    return response.status(500).json({ error: "stream_status_unavailable" });
  }
};
