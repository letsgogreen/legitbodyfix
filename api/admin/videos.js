"use strict";

var auth = require("../../lib/admin-auth");
var publishing = require("../../lib/video-publishing");

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
    return response.status(409).json({ error: "publishing_disabled_in_preview" });
  }

  var publishingConfig = publishing.getPublishingConfig();
  if (!publishingConfig) {
    return response.status(503).json({ error: "github_publishing_not_configured" });
  }

  var body;
  try {
    body = readBody(request);
  } catch (error) {
    return response.status(400).json({ error: "invalid_json" });
  }

  try {
    var result = await publishing.publishVideos(publishingConfig, body.videos);
    return response.status(200).json({
      published: !result.unchanged,
      unchanged: result.unchanged,
      commitSha: result.commitSha,
      commitUrl: result.commitUrl
    });
  } catch (error) {
    if (error instanceof publishing.PublishingError) {
      var payload = { error: error.code };
      if (error.details && error.details.length) payload.details = error.details;
      return response.status(error.statusCode).json(payload);
    }
    return response.status(502).json({ error: "github_publish_failed" });
  }
};
