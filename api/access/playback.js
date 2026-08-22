"use strict";

var access = require("../../lib/supabase-access");
var stream = require("../../lib/cloudflare-stream");
var videoLibrary = require("../../lib/video-library");

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

function getVideoId(request) {
  var value = request.query && request.query.videoId;
  if (Array.isArray(value)) value = value[0];
  return typeof value === "string" ? value.trim() : "";
}

module.exports = async function handler(request, response) {
  setHeaders(response);
  response.setHeader("Allow", "GET");

  if (request.method !== "GET") {
    return response.status(405).json({ error: "method_not_allowed" });
  }

  var accessConfig = access.getServerConfig();
  if (!accessConfig) return response.status(503).json({ error: "access_service_not_configured" });

  var token = getBearerToken(request);
  if (!token) return response.status(401).json({ error: "authentication_required" });

  try {
    var user = await access.getUser(accessConfig, token);
    var programs = await access.listEntitlements(accessConfig, user.email);
    var video = videoLibrary.getAccessibleVideo(programs, getVideoId(request));
    if (!video) return response.status(403).json({ error: "video_not_in_library" });
    if (!video.streamVideoId || !video.streamReady) return response.status(409).json({ error: "video_not_ready" });

    var streamConfig = stream.getStreamConfig();
    if (!streamConfig) {
      console.error("[access/playback] Cloudflare Stream configuration is incomplete", {
        issues: stream.getStreamConfigIssues()
      });
      return response.status(503).json({ error: "playback_not_configured" });
    }

    var playback = await stream.getSignedPlayback(streamConfig, video.streamVideoId, {
      ttlSeconds: stream.getTokenLifetimeSeconds()
    });
    return response.status(200).json(playback);
  } catch (error) {
    if (error instanceof access.AccessError) return response.status(error.statusCode).json({ error: error.code });
    if (error instanceof stream.StreamError) {
      console.error("[access/playback] Cloudflare Stream token request failed", {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      });
      return response.status(error.statusCode).json({ error: error.code });
    }
    console.error("[access/playback] unexpected failure", {
      message: error && error.message ? error.message : String(error)
    });
    return response.status(500).json({ error: "playback_unavailable" });
  }
};
