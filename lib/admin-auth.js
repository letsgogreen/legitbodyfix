"use strict";

var crypto = require("crypto");

var COOKIE_NAME = "legitbodyfix_admin";
var SESSION_TTL_SECONDS = 8 * 60 * 60;

function getConfig() {
  var password = String(process.env.ADMIN_PASSWORD || "");
  var secret = String(process.env.ADMIN_SESSION_SECRET || "");

  if (password.length < 12 || secret.length < 32) return null;
  return { password: password, secret: secret };
}

function safeEqual(left, right) {
  var leftBuffer = Buffer.from(String(left));
  var rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function createSessionToken(secret, now) {
  var issuedAt = Math.floor((now || Date.now()) / 1000);
  var payload = Buffer.from(JSON.stringify({
    version: 1,
    issuedAt: issuedAt,
    expiresAt: issuedAt + SESSION_TTL_SECONDS
  })).toString("base64url");

  return payload + "." + sign(payload, secret);
}

function verifySessionToken(token, secret, now) {
  if (typeof token !== "string") return false;
  var parts = token.split(".");
  if (parts.length !== 2 || !safeEqual(parts[1], sign(parts[0], secret))) return false;

  try {
    var payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    var currentTime = Math.floor((now || Date.now()) / 1000);
    return payload.version === 1 &&
      Number.isInteger(payload.issuedAt) &&
      Number.isInteger(payload.expiresAt) &&
      payload.issuedAt <= currentTime + 60 &&
      payload.expiresAt > currentTime;
  } catch (error) {
    return false;
  }
}

function parseCookies(header) {
  return String(header || "").split(";").reduce(function (cookies, entry) {
    var separator = entry.indexOf("=");
    if (separator === -1) return cookies;
    var name = entry.slice(0, separator).trim();
    var value = entry.slice(separator + 1).trim();
    if (!name) return cookies;
    try {
      cookies[name] = decodeURIComponent(value);
    } catch (error) {
      cookies[name] = value;
    }
    return cookies;
  }, {});
}

function cookieAttributes(maxAge) {
  var attributes = [
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=" + maxAge
  ];
  if (process.env.VERCEL || process.env.NODE_ENV === "production") attributes.push("Secure");
  return attributes.join("; ");
}

function createSessionCookie(token) {
  return COOKIE_NAME + "=" + encodeURIComponent(token) + "; " + cookieAttributes(SESSION_TTL_SECONDS);
}

function clearSessionCookie() {
  return COOKIE_NAME + "=; " + cookieAttributes(0);
}

function isAuthenticated(request, config) {
  var cookies = parseCookies(request.headers && request.headers.cookie);
  return verifySessionToken(cookies[COOKIE_NAME], config.secret);
}

function setApiHeaders(response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

module.exports = {
  SESSION_TTL_SECONDS: SESSION_TTL_SECONDS,
  clearSessionCookie: clearSessionCookie,
  createSessionCookie: createSessionCookie,
  createSessionToken: createSessionToken,
  getConfig: getConfig,
  isAuthenticated: isAuthenticated,
  safeEqual: safeEqual,
  setApiHeaders: setApiHeaders,
  verifySessionToken: verifySessionToken
};
