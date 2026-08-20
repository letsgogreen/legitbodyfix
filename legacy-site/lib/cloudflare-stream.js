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

function isStreamVideoId(value) {
  return /^[a-f0-9]{32}$/i.test(String(value || ""));
}

function getStreamApiConfigIssues(environment) {
  var issues = [];
  if (!isCloudflareAccountId(readValue(environment, "CLOUDFLARE_STREAM_ACCOUNT_ID"))) {
    issues.push("CLOUDFLARE_STREAM_ACCOUNT_ID");
  }
  if (!isApiToken(readValue(environment, "CLOUDFLARE_STREAM_API_TOKEN"))) {
    issues.push("CLOUDFLARE_STREAM_API_TOKEN");
  }
  return issues;
}

function getStreamApiConfig(environment) {
  if (getStreamApiConfigIssues(environment).length) return null;
  return {
    accountId: readValue(environment, "CLOUDFLARE_STREAM_ACCOUNT_ID"),
    apiToken: readValue(environment, "CLOUDFLARE_STREAM_API_TOKEN")
  };
}

function getStreamConfigIssues(environment) {
  var issues = getStreamApiConfigIssues(environment);
  if (!normalizeCustomerCode(readValue(environment, "CLOUDFLARE_STREAM_CUSTOMER_CODE"))) {
    issues.push("CLOUDFLARE_STREAM_CUSTOMER_CODE");
  }
  return issues;
}

function getStreamConfig(environment) {
  var apiConfig = getStreamApiConfig(environment);
  var customerCode = normalizeCustomerCode(readValue(environment, "CLOUDFLARE_STREAM_CUSTOMER_CODE"));
  if (!apiConfig || !customerCode) return null;
  return {
    accountId: apiConfig.accountId,
    apiToken: apiConfig.apiToken,
    customerCode: customerCode
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

function apiEndpoint(config, path) {
  return "https://api.cloudflare.com/client/v4/accounts/" + encodeURIComponent(config.accountId) + path;
}

function apiHeaders(config) {
  return {
    "Authorization": "Bearer " + config.apiToken,
    "Accept": "application/json"
  };
}

function cleanUploadFileName(value) {
  var fileName = String(value || "").trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!fileName || fileName.length > 180) {
    throw new StreamError("invalid_upload_file", 400);
  }
  return fileName;
}

function normalizeUploadRequest(input) {
  var file = input && typeof input === "object" ? input : {};
  var size = Number(file.size);
  if (!Number.isSafeInteger(size) || size < 1 || size > 30 * 1024 * 1024 * 1024) {
    throw new StreamError("invalid_upload_size", 400);
  }

  return {
    fileName: cleanUploadFileName(file.fileName),
    size: size,
    protocol: size > 200 * 1024 * 1024 ? "tus" : "multipart",
    maxDurationSeconds: 3600
  };
}

function base64(value) {
  return Buffer.from(String(value), "utf8").toString("base64");
}

function getHeader(response, name) {
  return response && response.headers && typeof response.headers.get === "function"
    ? response.headers.get(name)
    : "";
}

async function readJson(response) {
  return response.json().catch(function () { return {}; });
}

async function createDirectUpload(config, input, options) {
  if (!config || !isCloudflareAccountId(config.accountId) || !isApiToken(config.apiToken)) {
    throw new StreamError("stream_upload_not_configured", 503);
  }

  var upload = normalizeUploadRequest(input);
  options = options || {};
  var fetcher = options.fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new StreamError("stream_unavailable", 503);

  var response;
  try {
    if (upload.protocol === "multipart") {
      var multipartHeaders = apiHeaders(config);
      multipartHeaders["Content-Type"] = "application/json";
      response = await fetcher(apiEndpoint(config, "/stream/direct_upload"), {
        method: "POST",
        headers: multipartHeaders,
        body: JSON.stringify({
          maxDurationSeconds: upload.maxDurationSeconds,
          requireSignedURLs: true
        })
      });
      var directData = await readJson(response);
      var result = directData && directData.result || {};
      if (!response.ok || !directData.success || !isStreamVideoId(result.uid) ||
          typeof result.uploadURL !== "string" || !/^https:\/\//.test(result.uploadURL)) {
        throw new StreamError("stream_upload_url_failed", 502, { status: response.status });
      }
      return {
        protocol: "multipart",
        streamVideoId: result.uid,
        uploadUrl: result.uploadURL
      };
    }

    var tusHeaders = apiHeaders(config);
    tusHeaders["Tus-Resumable"] = "1.0.0";
    tusHeaders["Upload-Length"] = String(upload.size);
    tusHeaders["Upload-Metadata"] = "name " + base64(upload.fileName) +
      ",requiresignedurls,maxdurationseconds " + base64(upload.maxDurationSeconds);
    response = await fetcher(apiEndpoint(config, "/stream?direct_user=true"), {
      method: "POST",
      headers: tusHeaders
    });
    var uploadUrl = getHeader(response, "location");
    var streamVideoId = getHeader(response, "stream-media-id");
    if (!response.ok || !isStreamVideoId(streamVideoId) || typeof uploadUrl !== "string" || !/^https:\/\//.test(uploadUrl)) {
      throw new StreamError("stream_upload_url_failed", 502, { status: response.status });
    }
    return {
      protocol: "tus",
      streamVideoId: streamVideoId,
      uploadUrl: uploadUrl
    };
  } catch (error) {
    if (error instanceof StreamError) throw error;
    throw new StreamError("stream_unavailable", 503);
  }
}

async function getVideoStatus(config, videoId, options) {
  if (!config || !isCloudflareAccountId(config.accountId) || !isApiToken(config.apiToken)) {
    throw new StreamError("stream_upload_not_configured", 503);
  }
  if (!isStreamVideoId(videoId)) throw new StreamError("invalid_stream_video", 400);

  options = options || {};
  var fetcher = options.fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new StreamError("stream_unavailable", 503);

  var response;
  try {
    response = await fetcher(apiEndpoint(config, "/stream/" + encodeURIComponent(videoId)), {
      method: "GET",
      headers: apiHeaders(config)
    });
  } catch (error) {
    throw new StreamError("stream_unavailable", 503);
  }

  var data = await readJson(response);
  var result = data && data.result || {};
  if (!response.ok || !data.success) {
    throw new StreamError("stream_status_failed", 502, { status: response.status });
  }

  var state = result.status && typeof result.status.state === "string" ? result.status.state : "unknown";
  return {
    streamVideoId: String(videoId),
    state: state,
    ready: result.readyToStream === true || state === "ready"
  };
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
  var endpoint = apiEndpoint(config, "/stream/" + encodeURIComponent(videoId) + "/token");

  var response;
  try {
    response = await fetcher(endpoint, {
      method: "POST",
      headers: Object.assign(apiHeaders(config), { "Content-Type": "application/json" }),
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
  createDirectUpload: createDirectUpload,
  StreamError: StreamError,
  getStreamApiConfig: getStreamApiConfig,
  getStreamApiConfigIssues: getStreamApiConfigIssues,
  getPlayerUrl: getPlayerUrl,
  getSignedPlayback: getSignedPlayback,
  getStreamConfig: getStreamConfig,
  getStreamConfigIssues: getStreamConfigIssues,
  getTokenLifetimeSeconds: getTokenLifetimeSeconds,
  getVideoStatus: getVideoStatus,
  isStreamVideoId: isStreamVideoId,
  normalizeCustomerCode: normalizeCustomerCode
};
