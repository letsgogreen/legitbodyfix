"use strict";

var crypto = require("crypto");

var MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;
var URL_TTL_SECONDS = 15 * 60;
var ALLOWED_CONTENT_TYPES = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov"
};

function R2UploadError(code, message, statusCode) {
  this.name = "R2UploadError";
  this.code = code;
  this.message = message;
  this.statusCode = statusCode || 500;
  if (Error.captureStackTrace) Error.captureStackTrace(this, R2UploadError);
}

R2UploadError.prototype = Object.create(Error.prototype);
R2UploadError.prototype.constructor = R2UploadError;

function asText(value) {
  return String(value || "").trim();
}

function normalizePublicBaseUrl(value) {
  var text = asText(value);
  if (!text) return "";

  try {
    var parsed = new URL(text);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash) return "";
    return parsed.toString().replace(/\/+$/, "");
  } catch (error) {
    return "";
  }
}

function getUploadConfig(environment) {
  var env = environment || process.env;
  var accountId = asText(env.R2_ACCOUNT_ID);
  var accessKeyId = asText(env.R2_ACCESS_KEY_ID);
  var secretAccessKey = asText(env.R2_SECRET_ACCESS_KEY);
  var bucket = asText(env.R2_BUCKET);
  var publicBaseUrl = normalizePublicBaseUrl(env.R2_PUBLIC_BASE_URL);

  if (!/^[a-f0-9]{32}$/i.test(accountId) || !accessKeyId || !secretAccessKey ||
      !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket) || !publicBaseUrl) {
    return null;
  }

  return {
    accountId: accountId,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    bucket: bucket,
    publicBaseUrl: publicBaseUrl
  };
}

function awsEncode(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, function (character) {
    return "%" + character.charCodeAt(0).toString(16).toUpperCase();
  });
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key, value) {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function formatAmzDate(now) {
  function pad(value) { return String(value).padStart(2, "0"); }
  return String(now.getUTCFullYear()) + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) +
    "T" + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + "Z";
}

function extensionFor(contentType) {
  return ALLOWED_CONTENT_TYPES[String(contentType || "").toLowerCase()] || "";
}

function validateRequest(input) {
  var request = input && typeof input === "object" ? input : {};
  var contentType = asText(request.contentType).toLowerCase();
  var fileName = asText(request.fileName);
  var size = Number(request.size);

  if (!extensionFor(contentType)) {
    throw new R2UploadError("unsupported_video_type", "Only MP4, WebM, and MOV videos can be uploaded.", 400);
  }
  if (!fileName || fileName.length > 180) {
    throw new R2UploadError("invalid_file_name", "The video file name is invalid.", 400);
  }
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_UPLOAD_BYTES) {
    throw new R2UploadError("invalid_file_size", "Videos must be between 1 byte and 2 GB.", 400);
  }

  return { contentType: contentType, fileName: fileName, size: size };
}

function makeObjectKey(request, now, nonce) {
  var date = now || new Date();
  var stem = request.fileName.replace(/\.[^.]*$/, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "video";
  var random = String(nonce || crypto.randomBytes(12).toString("hex")).replace(/[^a-z0-9]/gi, "").slice(0, 32);
  if (!random) random = crypto.randomBytes(12).toString("hex");
  var month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return "videos/" + date.getUTCFullYear() + "-" + month + "/" +
    date.getTime() + "-" + random + "-" + stem + extensionFor(request.contentType);
}

function makePublicUrl(baseUrl, objectKey) {
  var encodedPath = objectKey.split("/").map(awsEncode).join("/");
  return baseUrl + "/" + encodedPath;
}

function createPresignedUpload(config, input, options) {
  var request = validateRequest(input);
  var settings = options || {};
  var now = settings.now || new Date();
  var expiresIn = settings.expiresIn || URL_TTL_SECONDS;
  if (!Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > 604800) {
    throw new R2UploadError("invalid_upload_expiry", "The upload expiry is invalid.", 500);
  }

  var objectKey = makeObjectKey(request, now, settings.nonce);
  var amzDate = formatAmzDate(now);
  var dateStamp = amzDate.slice(0, 8);
  var credentialScope = dateStamp + "/auto/s3/aws4_request";
  var host = config.bucket + "." + config.accountId + ".r2.cloudflarestorage.com";
  var canonicalUri = "/" + objectKey.split("/").map(awsEncode).join("/");
  var query = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD",
    "X-Amz-Credential": config.accessKeyId + "/" + credentialScope,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "content-type;host"
  };
  var canonicalQuery = Object.keys(query).sort().map(function (key) {
    return awsEncode(key) + "=" + awsEncode(query[key]);
  }).join("&");
  var canonicalHeaders = "content-type:" + request.contentType + "\n" + "host:" + host + "\n";
  var canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    "content-type;host",
    "UNSIGNED-PAYLOAD"
  ].join("\n");
  var stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hash(canonicalRequest)
  ].join("\n");
  var dateKey = hmac("AWS4" + config.secretAccessKey, dateStamp);
  var regionKey = hmac(dateKey, "auto");
  var serviceKey = hmac(regionKey, "s3");
  var signingKey = hmac(serviceKey, "aws4_request");
  var signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  return {
    uploadUrl: "https://" + host + canonicalUri + "?" + canonicalQuery + "&X-Amz-Signature=" + signature,
    videoUrl: makePublicUrl(config.publicBaseUrl, objectKey),
    objectKey: objectKey,
    contentType: request.contentType,
    expiresAt: new Date(now.getTime() + expiresIn * 1000).toISOString()
  };
}

module.exports = {
  ALLOWED_CONTENT_TYPES: ALLOWED_CONTENT_TYPES,
  MAX_UPLOAD_BYTES: MAX_UPLOAD_BYTES,
  R2UploadError: R2UploadError,
  URL_TTL_SECONDS: URL_TTL_SECONDS,
  createPresignedUpload: createPresignedUpload,
  getUploadConfig: getUploadConfig,
  validateRequest: validateRequest
};
