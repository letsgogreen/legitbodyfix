"use strict";

function StreamError(code, statusCode, details) {
  this.name = "StreamError";
  this.code = code;
  this.statusCode = statusCode || 502;
  this.details = details || null;
  if (Error.captureStackTrace) Error.captureStackTrace(this, StreamError);
}

StreamError.prototype = Object.create(Error.prototype);
StreamError.prototype.constructor = StreamError;

function readValue(environment, name) {
  return String((environment || process.env)[name] || "").trim();
}

function isCloudflareAccountId(value) {
  return /^[a-f0-9]{32}$/i.test(value);
}

function isApiToken(value) {
  return value.length >= 20 && value.length <= 512 && !/\s/.test(value);
}

function normalizeCustomerCode(value) {
  var code = String(value || "").trim().replace(/^customer-/i, "");
  return /^[a-z0-9-]{3,200}$/i.test(code) ? code : "";
}

function getStreamConfigIssues(environment) {
  var issues = [];
  if (!isCloudflareAccountId(readValue(environment, "CLOUDFLARE_STREAM_ACCOUNT_ID"))) {
    issues.push("CLOUDFLARE_STREAM_ACCOUNT_ID");
  }
  if (!isApiToken(readValue(environment, "CLOUDFLARE_STREAM_API_TOKEN"))) {
    issues.push("CLOUDFLARE_STREAM_API_TOKEN");
  }
  if (!normalizeCustomerCode(readValue(environment, "CLOUDFLARE_STREAM_CUSTOMER_CODE"))) {
    issues.push("CLOUDFLARE_STREAM_CUSTOMER_CODE");
  }
  return issues;
}

function getStreamConfig(environment) {
  if (getStreamConfigIssues(environment).length) return null;
  return {
    accountId: readValue(environment, "CLOUDFLARE_STREAM_ACCOUNT_ID"),
    apiToken: readValue(environment, "CLOUDFLARE_STREAM_API_TOKEN"),
    customerCode: normalizeCustomerCode(readValue(environment, "CLOUDFLARE_STREAM_CUSTOMER_CODE"))
  };
}

function getTokenLifetimeSeconds(environment) {
  var configured = Number(readValue(environment, "CLOUDFLARE_STREAM_TOKEN_TTL_SECONDS"));
  if (Number.isInteger(configured) && configured >= 60 && configured <= 3600) return configured;
  return 900;
}

function getPlayerUrl(customerCode, token) {
  return "https://customer-" + encodeURIComponent(customerCode) +
    ".cloudflarestream.com/" + encodeURIComponent(token) + "/iframe";
}

async function getSignedPlayback(config, videoId, options) {
  if (!config || !isCloudflareAccountId(config.accountId) || !isApiToken(config.apiToken)) {
    throw new StreamError("stream_not_configured", 503);
  }
  if (!/^[a-f0-9]{32}$/i.test(String(videoId || ""))) {
    throw new StreamError("invalid_stream_video", 400);
  }

  options = options || {};
  var fetcher = options.fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new StreamError("stream_unavailable", 503);

  var now = options.now instanceof Date ? options.now : new Date();
  var expiresAt = Math.floor(now.getTime() / 1000) + (options.ttlSeconds || 900);
  var endpoint = "https://api.cloudflare.com/client/v4/accounts/" + encodeURIComponent(config.accountId) +
    "/stream/" + encodeURIComponent(videoId) + "/token";

  var response;
  try {
    response = await fetcher(endpoint, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + config.apiToken,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ exp: expiresAt, downloadable: false })
    });
  } catch (error) {
    throw new StreamError("stream_unavailable", 503);
  }

  var data = await response.json().catch(function () { return {}; });
  var token = data && data.result && typeof data.result.token === "string" ? data.result.token : "";
  if (!response.ok || !data.success || !token) {
    throw new StreamError("stream_token_failed", 502, { status: response.status });
  }

  var customerCode = normalizeCustomerCode(config.customerCode);
  if (!customerCode) throw new StreamError("stream_not_configured", 503);

  return {
    playerUrl: getPlayerUrl(customerCode, token),
    expiresAt: new Date(expiresAt * 1000).toISOString()
  };
}

module.exports = {
  StreamError: StreamError,
  getPlayerUrl: getPlayerUrl,
  getSignedPlayback: getSignedPlayback,
  getStreamConfig: getStreamConfig,
  getStreamConfigIssues: getStreamConfigIssues,
  getTokenLifetimeSeconds: getTokenLifetimeSeconds,
  normalizeCustomerCode: normalizeCustomerCode
};
