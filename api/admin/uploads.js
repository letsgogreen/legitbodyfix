"use strict";

var auth = require("../../lib/admin-auth");
var r2Upload = require("../../lib/r2-upload");

function readBody(request) {
  if (typeof request.body === "string") return JSON.parse(request.body);
  return request.body || {};
}

module.exports = async function handler(request, response) {
  auth.setApiHeaders(response);

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
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

  var uploadConfig = r2Upload.getUploadConfig();
  if (!uploadConfig) return response.status(503).json({ error: "r2_upload_not_configured" });

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
