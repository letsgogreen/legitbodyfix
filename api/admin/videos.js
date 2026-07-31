"use strict";

var auth = require("../../lib/admin-auth");
var publishing = require("../../lib/video-publishing");
var siteContentPublishing = require("../../lib/site-content-publishing");
var pageSectionsPublishing = require("../../lib/page-sections-publishing");
var grants = require("../../lib/admin-access-grants");
var paypal = require("../../lib/paypal-payments");
var access = require("../../lib/supabase-access");

function readBody(request) {
  if (typeof request.body === "string") return JSON.parse(request.body);
  return request.body || {};
}

async function grantLibraryAccess(response, body) {
  // Access can only be granted for something in the real catalog (the full
  // program bundle or one specific priced video) so an administrator cannot
  // accidentally grant access to an arbitrary identifier.
  if (!paypal.getProduct(body.programId)) {
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

    console.info("[admin/videos] granted library access", {
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
      console.error("[admin/videos] access grant failed", {
        code: error.code,
        statusCode: error.statusCode,
        provider: error.details
      });
      return response.status(error.statusCode).json({ error: error.code });
    }

    console.error("[admin/videos] access grant unexpected failure", {
      message: error && error.message ? error.message : String(error)
    });
    return response.status(500).json({ error: "access_grant_unavailable" });
  }
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

  var body;
  try {
    body = readBody(request);
  } catch (error) {
    return response.status(400).json({ error: "invalid_json" });
  }

  if (body.action === "grant-access") {
    if (process.env.VERCEL_ENV !== "production") {
      return response.status(409).json({ error: "access_grants_disabled_in_preview" });
    }
    return grantLibraryAccess(response, body);
  }

  if (process.env.VERCEL_ENV !== "production") {
    return response.status(409).json({ error: "publishing_disabled_in_preview" });
  }

  var publishingConfig = publishing.getPublishingConfig();
  if (!publishingConfig) {
    return response.status(503).json({ error: "github_publishing_not_configured" });
  }

  try {
    var result;
    if (body.action === "publish-site-content") {
      result = await siteContentPublishing.publishSiteContent(publishingConfig, body.content);
    } else if (body.action === "publish-page-sections") {
      result = await pageSectionsPublishing.publishPageSections(publishingConfig, body.content);
    } else {
      result = await publishing.publishVideos(publishingConfig, body.videos);
    }
    return response.status(200).json({
      published: !result.unchanged,
      unchanged: result.unchanged,
      commitSha: result.commitSha,
      commitUrl: result.commitUrl
    });
  } catch (error) {
    if (error instanceof siteContentPublishing.SiteContentError) {
      var sitePayload = { error: error.code };
      if (error.details && error.details.length) sitePayload.details = error.details;
      return response.status(error.statusCode).json(sitePayload);
    }
    if (error instanceof pageSectionsPublishing.PageSectionsError) {
      var pageSectionsPayload = { error: error.code };
      if (error.details && error.details.length) pageSectionsPayload.details = error.details;
      return response.status(error.statusCode).json(pageSectionsPayload);
    }
    if (error instanceof publishing.PublishingError) {
      var payload = { error: error.code };
      if (error.details && error.details.length) payload.details = error.details;
      return response.status(error.statusCode).json(payload);
    }
    return response.status(502).json({ error: "github_publish_failed" });
  }
};
