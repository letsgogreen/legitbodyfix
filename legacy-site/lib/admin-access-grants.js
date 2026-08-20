"use strict";

function AccessGrantError(code, statusCode, details) {
  this.name = "AccessGrantError";
  this.code = code;
  this.statusCode = statusCode || 502;
  this.details = details || null;
  if (Error.captureStackTrace) Error.captureStackTrace(this, AccessGrantError);
}

AccessGrantError.prototype = Object.create(Error.prototype);
AccessGrantError.prototype.constructor = AccessGrantError;

function normalizeEmail(value) {
  var email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

function endpoint(config, table, query) {
  var url = new URL(config.url + "/rest/v1/" + table);
  Object.keys(query || {}).forEach(function (key) { url.searchParams.set(key, query[key]); });
  return url.toString();
}

function headers(config, extra) {
  return Object.assign({
    "apikey": config.secretKey,
    "Authorization": "Bearer " + config.secretKey,
    "Content-Type": "application/json",
    "Accept": "application/json"
  }, extra || {});
}

async function failureDetails(response) {
  var details = { status: response.status };
  try {
    var body = await response.json();
    if (body && typeof body === "object") {
      ["code", "message", "hint"].forEach(function (name) {
        if (typeof body[name] === "string" && body[name]) details[name] = body[name].slice(0, 300);
      });
    }
  } catch (error) {
    // The HTTP status is still sufficient for a safe operator-facing error.
  }
  return details;
}

async function request(config, url, options, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new AccessGrantError("access_service_unavailable", 503);

  var response;
  try {
    response = await fetcher(url, options);
  } catch (error) {
    throw new AccessGrantError("access_service_unavailable", 503);
  }
  if (!response.ok) {
    throw new AccessGrantError("access_grant_write_failed", 502, await failureDetails(response));
  }
  return response.json().catch(function () { return null; });
}

async function grantAccess(config, grant, fetchImplementation) {
  var email = normalizeEmail(grant && grant.email);
  var programId = typeof (grant && grant.programId) === "string" ? grant.programId.trim() : "";
  if (!email || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(programId)) {
    throw new AccessGrantError("invalid_access_grant", 422);
  }

  // One row per email and program is kept by the existing unique constraint.
  // This only changes library eligibility; it never creates a payment record.
  var rows = await request(config, endpoint(config, "entitlements", {
    on_conflict: "buyer_email,program_id"
  }), {
    method: "POST",
    headers: headers(config, { "Prefer": "resolution=merge-duplicates,return=representation" }),
    body: JSON.stringify({
      buyer_email: email,
      program_id: programId,
      status: "active"
    })
  }, fetchImplementation);

  return {
    email: email,
    programId: programId,
    created: Array.isArray(rows) && rows.length > 0
  };
}

module.exports = {
  AccessGrantError: AccessGrantError,
  grantAccess: grantAccess,
  normalizeEmail: normalizeEmail
};
