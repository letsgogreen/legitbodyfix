"use strict";

var auth = require("../../lib/admin-auth");
var r2Upload = require("../../lib/r2-upload");
var stream = require("../../lib/cloudflare-stream");

function readBody(request) {
  if (typeof request.body === "string") return JSON.parse(request.body);
  return request.body || {};
}

function getQueryValue(request, name) {
  var value = request.query && request.query[name];
  if (Array.isArray(value)) value = value[0];
  return typeof value === "string" ? value.trim() : "";
}

function reportStreamError(response, error, operation) {
  console.error("[admin/uploads] Cloudflare Stream " + operation + " failed", {
    code: error.code,
    statusCode: error.statusCode,
    details: error.details
  });
  return response.status(error.statusCode).json({ error: error.code });
}

module.exports = async function handler(request, response) {
  auth.setApiHeaders(response);

  if (request.method !== "POST" && request.method !== "GET") {
    response.setHeader("Allow", "GET, POST");
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

  var mode = getQueryValue(request, "kind");
  if (mode === "stream" || mode === "stream-status") {
    if ((mode === "stream" && request.method !== "POST") ||
        (mode === "stream-status" && request.method !== "GET")) {
      response.setHeader("Allow", mode === "stream" ? "POST" : "GET");
      return response.status(405).json({ error: "method_not_allowed" });
    }

    var streamConfig = stream.getStreamApiConfig();
    if (!streamConfig) {
      return response.status(503).json({
        error: "stream_upload_not_configured",
        details: stream.getStreamApiConfigIssues()
      });
    }

    try {
      if (mode === "stream-status") {
        return response.status(200).json(await stream.getVideoStatus(
          streamConfig,
          getQueryValue(request, "streamVideoId")
        ));
      }

      var streamBody;
      try {
        streamBody = readBody(request);
      } catch (error) {
        return response.status(400).json({ error: "invalid_json" });
      }
      return response.status(200).json(await stream.createDirectUpload(streamConfig, streamBody));
    } catch (error) {
      if (error instanceof stream.StreamError) return reportStreamError(response, error, mode);
      console.error("[admin/uploads] unexpected Cloudflare Stream failure", {
        message: error && error.message ? error.message : String(error)
      });
      return response.status(500).json({ error: "stream_upload_unavailable" });
    }
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  var uploadConfig = r2Upload.getUploadConfig();
  if (!uploadConfig) {
    return response.status(503).json({
      error: "r2_upload_not_configured",
      details: r2Upload.getUploadConfigIssues()
    });
  }

  var body;
  try {
    body = readBody(request);
  } catch (error) {
    return response.status(400).json({ error: "invalid_json" });
  }

  try {
    return response.status(200).json(r2Upload.createPresignedUpload(uploadConfig, body));
  } catch (error) {
    if (error instanceof r2Upload.R2UploadError) {
      return response.status(error.statusCode).json({ error: error.code });
    }
    return response.status(500).json({ error: "upload_url_generation_failed" });
  }
};
