"use strict";

var crypto = require("node:crypto");
var catalog = require("./product-catalog");

function StripePaymentError(code, message, statusCode, details) {
  this.name = "StripePaymentError";
  this.code = code;
  this.message = message;
  this.statusCode = statusCode || 502;
  this.details = details || null;
  if (Error.captureStackTrace) Error.captureStackTrace(this, StripePaymentError);
}

StripePaymentError.prototype = Object.create(Error.prototype);
StripePaymentError.prototype.constructor = StripePaymentError;

function readValue(environment, name) {
  return String((environment || process.env)[name] || "").trim();
}

function getConfigIssues(environment) {
  var issues = [];
  var secretKey = readValue(environment, "STRIPE_SECRET_KEY");
  if (!/^sk_(test|live)_[A-Za-z0-9_]{16,}$/.test(secretKey)) issues.push("STRIPE_SECRET_KEY");
  if (readValue(environment, "VERCEL_ENV") === "preview" && secretKey.indexOf("sk_live_") === 0) {
    issues.push("STRIPE_SECRET_KEY_LIVE_IN_PREVIEW");
  }
  return issues;
}

function getConfig(environment) {
  if (getConfigIssues(environment).length) return null;
  return {
    secretKey: readValue(environment, "STRIPE_SECRET_KEY"),
    webhookSecret: readValue(environment, "STRIPE_WEBHOOK_SECRET")
  };
}

function getPublicConfig(environment) {
  var config = getConfig(environment);
  if (!config) return null;
  return {
    environment: config.secretKey.indexOf("sk_live_") === 0 ? "live" : "test",
    catalog: catalog.getCatalog()
  };
}

async function readResponseDetails(response) {
  var details = { status: response.status };
  try {
    var body = await response.json();
    var error = body && body.error;
    if (error && typeof error === "object") {
      ["type", "code", "decline_code", "message"].forEach(function (key) {
        if (typeof error[key] === "string" && error[key]) details[key] = error[key].slice(0, 300);
      });
    }
  } catch (error) {
    // The HTTP status remains useful if Stripe returned no JSON body.
  }
  return details;
}

async function stripeRequest(config, path, options, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") {
    throw new StripePaymentError("payment_service_unavailable", "The payment service is unavailable.", 503);
  }
  var response;
  try {
    response = await fetcher("https://api.stripe.com" + path, {
      method: options && options.method ? options.method : "GET",
      headers: Object.assign({
        "Accept": "application/json",
        "Authorization": "Bearer " + config.secretKey
      }, options && options.headers ? options.headers : {}),
      body: options && options.body
    });
  } catch (error) {
    throw new StripePaymentError("payment_service_unavailable", "The payment service is unavailable.", 503);
  }
  if (!response.ok) {
    throw new StripePaymentError("stripe_request_failed", "Stripe rejected the payment request.", 502, await readResponseDetails(response));
  }
  try {
    return await response.json();
  } catch (error) {
    throw new StripePaymentError("stripe_response_invalid", "Stripe returned an invalid response.", 502);
  }
}

function isSessionId(value) {
  return typeof value === "string" && /^cs_(test|live)_[A-Za-z0-9_]{10,}$/.test(value);
}

function normalizeOrigin(value) {
  try {
    var url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return "";
    return url.origin;
  } catch (error) {
    return "";
  }
}

function sessionPayload(product, origin) {
  var body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("payment_method_types[0]", "card");
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", product.currency.toLowerCase());
  body.set("line_items[0][price_data][unit_amount]", String(Math.round(Number(product.amount) * 100)));
  body.set("line_items[0][price_data][product_data][name]", product.title);
  body.set("client_reference_id", product.id);
  body.set("metadata[product_id]", product.id);
  body.set("payment_intent_data[metadata][product_id]", product.id);
  body.set("success_url", origin + "/checkout.html?stripe=success&session_id={CHECKOUT_SESSION_ID}&product=" + encodeURIComponent(product.id));
  body.set("cancel_url", origin + "/checkout.html?stripe=cancelled&product=" + encodeURIComponent(product.id));
  return body.toString();
}

async function createCheckoutSession(config, productId, origin, fetchImplementation) {
  var product = catalog.getProduct(productId);
  var safeOrigin = normalizeOrigin(origin);
  if (!product) throw new StripePaymentError("invalid_product", "The selected item is not available for purchase.", 400);
  if (!safeOrigin) throw new StripePaymentError("invalid_checkout_origin", "The checkout address is invalid.", 400);
  var session = await stripeRequest(config, "/v1/checkout/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: sessionPayload(product, safeOrigin)
  }, fetchImplementation);
  if (!session || !isSessionId(session.id) || typeof session.url !== "string" || !/^https:\/\/checkout\.stripe\.com\//.test(session.url)) {
    throw new StripePaymentError("stripe_session_invalid", "Stripe returned an invalid checkout session.", 502);
  }
  return { id: session.id, url: session.url };
}

async function getCheckoutSession(config, sessionId, fetchImplementation) {
  if (!isSessionId(sessionId)) throw new StripePaymentError("invalid_payment_order", "The payment order is invalid.", 400);
  return stripeRequest(config, "/v1/checkout/sessions/" + encodeURIComponent(sessionId), {}, fetchImplementation);
}

function normalizeEmail(value) {
  var email = typeof value === "string" ? value.trim().toLowerCase() : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function validatePaidSession(session) {
  var productId = session && session.metadata && session.metadata.product_id;
  var product = catalog.getProduct(productId);
  var email = normalizeEmail(session && session.customer_details && session.customer_details.email || session && session.customer_email);
  var expectedAmount = product ? Math.round(Number(product.amount) * 100) : -1;
  var paymentIntent = session && session.payment_intent;
  if (!session || !isSessionId(session.id) || session.status !== "complete" || session.payment_status !== "paid" ||
      !product || session.amount_total !== expectedAmount || String(session.currency || "").toUpperCase() !== product.currency ||
      typeof paymentIntent !== "string" || !/^pi_[A-Za-z0-9_]{8,}$/.test(paymentIntent) || !email) {
    throw new StripePaymentError("stripe_session_validation_failed", "The completed payment could not be verified.", 409, {
      hasSession: Boolean(session),
      sessionStatus: session && session.status ? String(session.status) : "",
      paymentStatus: session && session.payment_status ? String(session.payment_status) : "",
      productMatches: Boolean(product),
      amountMatches: Boolean(product && session.amount_total === expectedAmount),
      currencyMatches: Boolean(product && String(session.currency || "").toUpperCase() === product.currency),
      hasPaymentIntent: Boolean(typeof paymentIntent === "string"),
      hasBuyerEmail: Boolean(email)
    });
  }
  return {
    provider: "stripe",
    providerOrderId: session.id,
    providerCaptureId: paymentIntent,
    programId: product.id,
    productTitle: product.title,
    buyerEmail: email,
    amount: Number(product.amount),
    currency: product.currency,
    paidAt: Number.isFinite(session.created) ? new Date(session.created * 1000).toISOString() : new Date().toISOString()
  };
}

function parseSignatureHeader(value) {
  return String(value || "").split(",").reduce(function (result, part) {
    var separator = part.indexOf("=");
    if (separator < 1) return result;
    var key = part.slice(0, separator).trim();
    var item = part.slice(separator + 1).trim();
    if (!result[key]) result[key] = [];
    result[key].push(item);
    return result;
  }, {});
}

function verifyWebhook(config, rawBody, signatureHeader, nowSeconds) {
  if (!config || !/^whsec_[A-Za-z0-9_]{12,}$/.test(config.webhookSecret || "")) {
    throw new StripePaymentError("stripe_webhook_not_configured", "Stripe webhook verification is not configured.", 503);
  }
  var signatures = parseSignatureHeader(signatureHeader);
  var timestamp = Number(signatures.t && signatures.t[0]);
  var currentTime = Number.isFinite(nowSeconds) ? nowSeconds : Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(currentTime - timestamp) > 300 || !signatures.v1 || !signatures.v1.length) {
    throw new StripePaymentError("stripe_webhook_invalid", "The webhook signature is invalid.", 401);
  }
  var expected = crypto.createHmac("sha256", config.webhookSecret).update(String(timestamp) + "." + rawBody, "utf8").digest("hex");
  var valid = signatures.v1.some(function (candidate) {
    if (!/^[a-f0-9]{64}$/i.test(candidate)) return false;
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(candidate, "hex"));
  });
  if (!valid) throw new StripePaymentError("stripe_webhook_invalid", "The webhook signature is invalid.", 401);
  try {
    return JSON.parse(rawBody);
  } catch (error) {
    throw new StripePaymentError("invalid_webhook_event", "The webhook event is invalid.", 400);
  }
}

function getCompletedWebhookPayment(event) {
  if (!event || (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded")) return null;
  return validatePaidSession(event.data && event.data.object);
}

module.exports = {
  StripePaymentError: StripePaymentError,
  createCheckoutSession: createCheckoutSession,
  getCheckoutSession: getCheckoutSession,
  getCompletedWebhookPayment: getCompletedWebhookPayment,
  getConfig: getConfig,
  getConfigIssues: getConfigIssues,
  getPublicConfig: getPublicConfig,
  isSessionId: isSessionId,
  sessionPayload: sessionPayload,
  validatePaidSession: validatePaidSession,
  verifyWebhook: verifyWebhook
};
