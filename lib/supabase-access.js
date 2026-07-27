"use strict";

function AccessError(code, statusCode) {
  this.name = "AccessError";
  this.code = code;
  this.statusCode = statusCode || 500;
  if (Error.captureStackTrace) Error.captureStackTrace(this, AccessError);
}

AccessError.prototype = Object.create(Error.prototype);
AccessError.prototype.constructor = AccessError;

function readValue(environment, name) {
  return String((environment || process.env)[name] || "").trim();
}

function normalizeProjectUrl(value) {
  if (!value) return "";

  try {
    var parsed = new URL(value);
    if (parsed.protocol !== "https:" || !parsed.hostname || parsed.search || parsed.hash) return "";
    return parsed.origin + parsed.pathname.replace(/\/$/, "");
  } catch (error) {
    return "";
  }
}

function isPublishableKey(value) {
  return /^sb_publishable_[A-Za-z0-9._-]{20,}$/.test(value);
}

function isSecretKey(value) {
  return /^sb_secret_[A-Za-z0-9._-]{20,}$/.test(value);
}

function getPublicConfigIssues(environment) {
  var issues = [];
  if (!normalizeProjectUrl(readValue(environment, "SUPABASE_URL"))) issues.push("SUPABASE_URL");
  if (!isPublishableKey(readValue(environment, "SUPABASE_PUBLISHABLE_KEY"))) {
    issues.push("SUPABASE_PUBLISHABLE_KEY");
  }
  return issues;
}

function getPublicConfig(environment) {
  if (getPublicConfigIssues(environment).length) return null;
  return {
    url: normalizeProjectUrl(readValue(environment, "SUPABASE_URL")),
    publishableKey: readValue(environment, "SUPABASE_PUBLISHABLE_KEY")
  };
}

function getServerConfigIssues(environment) {
  var issues = getPublicConfigIssues(environment);
  if (!isSecretKey(readValue(environment, "SUPABASE_SECRET_KEY"))) issues.push("SUPABASE_SECRET_KEY");
  return issues;
}

function getServerConfig(environment) {
  if (getServerConfigIssues(environment).length) return null;
  var publicConfig = getPublicConfig(environment);
  return {
    url: publicConfig.url,
    publishableKey: publicConfig.publishableKey,
    secretKey: readValue(environment, "SUPABASE_SECRET_KEY")
  };
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch (error) {
    throw new AccessError("supabase_response_invalid", 502);
  }
}

async function getUser(config, accessToken, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new AccessError("access_service_unavailable", 503);

  var response;
  try {
    response = await fetcher(config.url + "/auth/v1/user", {
      headers: {
        "apikey": config.publishableKey,
        "Authorization": "Bearer " + accessToken,
        "Accept": "application/json"
      }
    });
  } catch (error) {
    throw new AccessError("access_service_unavailable", 503);
  }

  if (response.status === 401 || response.status === 403) throw new AccessError("invalid_session", 401);
  if (!response.ok) throw new AccessError("supabase_user_lookup_failed", 502);

  var user = await parseJson(response);
  var email = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
  if (!email) throw new AccessError("invalid_session", 401);
  return { id: user.id, email: email };
}

function entitlementEndpoint(config, email) {
  var endpoint = new URL(config.url + "/rest/v1/entitlements");
  endpoint.searchParams.set("select", "program_id,status,created_at,programs(id,title,price,currency,active)");
  endpoint.searchParams.set("buyer_email", "eq." + email);
  endpoint.searchParams.set("status", "eq.active");
  endpoint.searchParams.set("order", "created_at.asc");
  return endpoint.toString();
}

async function listEntitlements(config, email, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new AccessError("access_service_unavailable", 503);

  var response;
  try {
    response = await fetcher(entitlementEndpoint(config, email), {
      headers: {
        "apikey": config.secretKey,
        "Accept": "application/json"
      }
    });
  } catch (error) {
    throw new AccessError("access_service_unavailable", 503);
  }

  if (!response.ok) throw new AccessError("supabase_entitlement_lookup_failed", 502);
  var rows = await parseJson(response);
  if (!Array.isArray(rows)) throw new AccessError("supabase_response_invalid", 502);

  return rows.reduce(function (programs, row) {
    var program = Array.isArray(row.programs) ? row.programs[0] : row.programs;
    if (!row || !program || program.active === false || typeof program.id !== "string") return programs;
    programs.push({
      id: program.id,
      title: typeof program.title === "string" ? program.title : "Program",
      price: Number(program.price) || null,
      currency: typeof program.currency === "string" ? program.currency : "USD",
      purchasedAt: typeof row.created_at === "string" ? row.created_at : null
    });
    return programs;
  }, []);
}

module.exports = {
  AccessError: AccessError,
  entitlementEndpoint: entitlementEndpoint,
  getPublicConfig: getPublicConfig,
  getPublicConfigIssues: getPublicConfigIssues,
  getServerConfig: getServerConfig,
  getServerConfigIssues: getServerConfigIssues,
  getUser: getUser,
  isPublishableKey: isPublishableKey,
  isSecretKey: isSecretKey,
  listEntitlements: listEntitlements,
  normalizeProjectUrl: normalizeProjectUrl
};
