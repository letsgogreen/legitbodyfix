"use strict";

var videos = require("../assets/data/videos.json");

var BUNDLE = {
      id: "full-body-restoration",
  title: "Full Body Restoration Package",
  amount: "170.00",
  currency: "USD"
};

function canonicalProductId(value) {
  return value === "shoulder-reset" ? "ankle-sprain-rehabilitation" : value;
}

function formatAmount(price) {
  return Number(price).toFixed(2);
}

// Every published video with a positive price becomes its own purchasable
// product, in addition to the full-program bundle above. Prices live in
// assets/data/videos.json (the same file the admin panel edits) so there is
// one place to change them.
function getVideoProducts() {
  return (Array.isArray(videos) ? videos : [])
    .filter(function (video) {
      return video && video.published !== false && typeof video.id === "string" &&
        Number.isFinite(Number(video.price)) && Number(video.price) > 0;
    })
    .map(function (video) {
      return {
        id: video.id,
        title: (video.title || video.id) + " — Single Session",
        amount: formatAmount(video.price),
        currency: "USD"
      };
    });
}

function getCatalog() {
  return [BUNDLE].concat(getVideoProducts());
}

function getProduct(productId) {
  var id = typeof productId === "string" ? canonicalProductId(productId.trim()) : "";
  if (!id) return null;
  return getCatalog().find(function (product) { return product.id === id; }) || null;
}

function PaypalError(code, message, statusCode, details) {
  this.name = "PaypalError";
  this.code = code;
  this.message = message;
  this.statusCode = statusCode || 502;
  this.details = details || null;
  if (Error.captureStackTrace) Error.captureStackTrace(this, PaypalError);
}

PaypalError.prototype = Object.create(Error.prototype);
PaypalError.prototype.constructor = PaypalError;

function readValue(environment, name) {
  return String((environment || process.env)[name] || "").trim();
}

function normalizeEnvironment(value) {
  var environment = String(value || "").trim().toLowerCase();
  return environment === "sandbox" || environment === "live" ? environment : "";
}

function getConfigIssues(environment) {
  var issues = [];
  var clientId = readValue(environment, "PAYPAL_CLIENT_ID");
  var clientSecret = readValue(environment, "PAYPAL_CLIENT_SECRET");

  if (!/^[A-Za-z0-9_-]{10,250}$/.test(clientId)) issues.push("PAYPAL_CLIENT_ID");
  if (!/^[A-Za-z0-9_-]{10,250}$/.test(clientSecret)) issues.push("PAYPAL_CLIENT_SECRET");
  if (!normalizeEnvironment(readValue(environment, "PAYPAL_ENV"))) issues.push("PAYPAL_ENV");
  return issues;
}

function getConfig(environment) {
  if (getConfigIssues(environment).length) return null;

  return {
    clientId: readValue(environment, "PAYPAL_CLIENT_ID"),
    clientSecret: readValue(environment, "PAYPAL_CLIENT_SECRET"),
    environment: normalizeEnvironment(readValue(environment, "PAYPAL_ENV")),
    webhookId: readValue(environment, "PAYPAL_WEBHOOK_ID")
  };
}

function getPublicConfig(environment) {
  var config = getConfig(environment);
  if (!config) return null;
  return {
    clientId: config.clientId,
    currency: BUNDLE.currency,
    environment: config.environment,
    catalog: getCatalog()
  };
}

function apiBase(config) {
  return config.environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function readResponseDetails(response) {
  return response.json().then(function (body) {
    var details = { status: response.status };
    if (body && typeof body === "object") {
      ["name", "message", "debug_id"].forEach(function (key) {
        if (typeof body[key] === "string" && body[key]) details[key] = body[key].slice(0, 300);
      });
    }
    return details;
  }).catch(function () {
    return { status: response.status };
  });
}

function readJson(response) {
  return response.json().catch(function () {
    throw new PaypalError("paypal_response_invalid", "PayPal returned an invalid response.", 502);
  });
}

async function getAccessToken(config, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") {
    throw new PaypalError("payment_service_unavailable", "The payment service is unavailable.", 503);
  }

  var response;
  try {
    response = await fetcher(apiBase(config) + "/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Authorization": "Basic " + Buffer.from(config.clientId + ":" + config.clientSecret, "utf8").toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });
  } catch (error) {
    throw new PaypalError("payment_service_unavailable", "The payment service is unavailable.", 503);
  }

  if (!response.ok) {
    throw new PaypalError("paypal_auth_failed", "PayPal authentication failed.", 502, await readResponseDetails(response));
  }

  var payload = await readJson(response);
  if (!payload || typeof payload.access_token !== "string" || !payload.access_token) {
    throw new PaypalError("paypal_auth_failed", "PayPal did not return an access token.", 502);
  }
  return payload.access_token;
}

async function paypalRequest(config, path, options, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  var token = await getAccessToken(config, fetcher);
  var response;
  try {
    response = await fetcher(apiBase(config) + path, {
      method: options.method || "GET",
      headers: Object.assign({
        "Accept": "application/json",
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }, options.headers || {}),
      body: options.body
    });
  } catch (error) {
    throw new PaypalError("payment_service_unavailable", "The payment service is unavailable.", 503);
  }

  if (!response.ok) {
    throw new PaypalError("paypal_request_failed", "PayPal rejected the payment request.", 502, await readResponseDetails(response));
  }
  return readJson(response);
}

function isOrderId(value) {
  return typeof value === "string" && /^[A-Z0-9]{10,40}$/.test(value);
}

function orderPayload(product) {
  return {
    intent: "CAPTURE",
    purchase_units: [{
      reference_id: product.id,
      custom_id: product.id,
      description: product.title,
      amount: {
        currency_code: product.currency,
        value: product.amount
      }
    }]
  };
}

async function createOrder(config, productId, fetchImplementation) {
  var product = getProduct(productId);
  if (!product) {
    throw new PaypalError("invalid_product", "The selected item is not available for purchase.", 400);
  }

  var order = await paypalRequest(config, "/v2/checkout/orders", {
    method: "POST",
    headers: { "PayPal-Request-Id": "lbf-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10) },
    body: JSON.stringify(orderPayload(product))
  }, fetchImplementation);

  if (!order || !isOrderId(order.id)) {
    throw new PaypalError("paypal_order_invalid", "PayPal returned an invalid order.", 502);
  }
  return { id: order.id };
}

async function getOrder(config, orderId, fetchImplementation) {
  if (!isOrderId(orderId)) throw new PaypalError("invalid_payment_order", "The payment order is invalid.", 400);
  return paypalRequest(config, "/v2/checkout/orders/" + encodeURIComponent(orderId), {}, fetchImplementation);
}

function normalizeEmail(value) {
  var email = typeof value === "string" ? value.trim().toLowerCase() : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function validateCompletedOrder(order, expectedCaptureId) {
  var purchaseUnit = order && Array.isArray(order.purchase_units) ? order.purchase_units[0] : null;
  // The product id is read back from PayPal's verified order (set by us at
  // createOrder time, never supplied by the client here), then re-resolved
  // against our own catalog so the price/currency we validate against is
  // always server-owned.
  var product = purchaseUnit ? getProduct(purchaseUnit.custom_id) : null;
  var captures = purchaseUnit && purchaseUnit.payments && Array.isArray(purchaseUnit.payments.captures)
    ? purchaseUnit.payments.captures : [];
  var capture = captures.find(function (item) {
    return item && item.status === "COMPLETED" && typeof item.id === "string" && (!expectedCaptureId || item.id === expectedCaptureId);
  });
  var email = normalizeEmail(order && order.payer && order.payer.email_address);
  var amount = purchaseUnit && purchaseUnit.amount;

  if (!order || order.status !== "COMPLETED" || !isOrderId(order.id) || !purchaseUnit || !product ||
      !amount || amount.currency_code !== product.currency || amount.value !== product.amount ||
      !capture || !email) {
    throw new PaypalError("paypal_order_validation_failed", "The completed payment could not be verified.", 409, {
      hasOrder: Boolean(order),
      orderStatus: order && order.status ? String(order.status) : "",
      hasValidOrderId: Boolean(order && isOrderId(order.id)),
      hasPurchaseUnit: Boolean(purchaseUnit),
      productMatches: Boolean(product),
      amountMatches: Boolean(product && amount && amount.currency_code === product.currency && amount.value === product.amount),
      hasCompletedCapture: Boolean(capture),
      hasPayerEmail: Boolean(email)
    });
  }

  return {
    provider: "paypal",
    providerOrderId: order.id,
    providerCaptureId: capture.id,
    programId: product.id,
    productTitle: product.title,
    buyerEmail: email,
    amount: Number(product.amount),
    currency: product.currency,
    paidAt: typeof capture.create_time === "string" ? capture.create_time : new Date().toISOString()
  };
}

async function captureOrder(config, orderId, fetchImplementation) {
  if (!isOrderId(orderId)) throw new PaypalError("invalid_payment_order", "The payment order is invalid.", 400);
  var capturedOrder = await paypalRequest(config, "/v2/checkout/orders/" + encodeURIComponent(orderId) + "/capture", {
    method: "POST",
    headers: { "PayPal-Request-Id": "lbf-capture-" + orderId }
  }, fetchImplementation);
  var capturedPurchaseUnit = capturedOrder && Array.isArray(capturedOrder.purchase_units) ? capturedOrder.purchase_units[0] : null;
  var capturedPayments = capturedPurchaseUnit && capturedPurchaseUnit.payments;
  var capturedItems = capturedPayments && Array.isArray(capturedPayments.captures) ? capturedPayments.captures : [];
  var completedCapture = capturedItems.find(function (item) {
    return item && item.status === "COMPLETED" && typeof item.id === "string";
  });

  // Capture responses may be minimal. Retrieve the order afterwards so validation
  // always uses the full server-authoritative purchase-unit metadata.
  var verifiedOrder = await getOrder(config, orderId, fetchImplementation);
  return validateCompletedOrder(verifiedOrder, completedCapture && completedCapture.id);
}

function readHeader(headers, name) {
  var values = headers || {};
  var expected = String(name).toLowerCase();
  var match = Object.keys(values).find(function (key) { return String(key).toLowerCase() === expected; });
  var value = match ? values[match] : "";
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

async function verifyWebhook(config, headers, event, fetchImplementation) {
  if (!config.webhookId) {
    throw new PaypalError("paypal_webhook_not_configured", "PayPal webhook verification is not configured.", 503);
  }
  if (!event || typeof event !== "object" || typeof event.id !== "string" || !event.id) {
    throw new PaypalError("invalid_webhook_event", "The webhook event is invalid.", 400);
  }

  var verification = await paypalRequest(config, "/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      auth_algo: readHeader(headers, "paypal-auth-algo"),
      cert_url: readHeader(headers, "paypal-cert-url"),
      transmission_id: readHeader(headers, "paypal-transmission-id"),
      transmission_sig: readHeader(headers, "paypal-transmission-sig"),
      transmission_time: readHeader(headers, "paypal-transmission-time"),
      webhook_id: config.webhookId,
      webhook_event: event
    })
  }, fetchImplementation);

  if (!verification || verification.verification_status !== "SUCCESS") {
    throw new PaypalError("paypal_webhook_invalid", "The webhook signature is invalid.", 401);
  }
}

async function getCompletedWebhookPayment(config, event, fetchImplementation) {
  var captureId = event && event.resource && event.resource.id;
  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED" || typeof captureId !== "string" || !captureId) {
    return null;
  }

  var capture = await paypalRequest(config, "/v2/payments/captures/" + encodeURIComponent(captureId), {}, fetchImplementation);
  var orderId = capture && capture.supplementary_data && capture.supplementary_data.related_ids && capture.supplementary_data.related_ids.order_id;
  var order = await getOrder(config, orderId, fetchImplementation);
  return validateCompletedOrder(order, captureId);
}

module.exports = {
  BUNDLE: BUNDLE,
  PaypalError: PaypalError,
  captureOrder: captureOrder,
  createOrder: createOrder,
  getCatalog: getCatalog,
  getProduct: getProduct,
  getCompletedWebhookPayment: getCompletedWebhookPayment,
  getConfig: getConfig,
  getConfigIssues: getConfigIssues,
  getPublicConfig: getPublicConfig,
  getOrder: getOrder,
  getAccessToken: getAccessToken,
  orderPayload: orderPayload,
  validateCompletedOrder: validateCompletedOrder,
  verifyWebhook: verifyWebhook
};
