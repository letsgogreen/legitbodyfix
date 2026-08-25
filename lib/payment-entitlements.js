"use strict";

function PaymentStoreError(code, message, statusCode, details) {
  this.name = "PaymentStoreError";
  this.code = code;
  this.message = message;
  this.statusCode = statusCode || 502;
  this.details = details || null;
  if (Error.captureStackTrace) Error.captureStackTrace(this, PaymentStoreError);
}

PaymentStoreError.prototype = Object.create(Error.prototype);
PaymentStoreError.prototype.constructor = PaymentStoreError;

function getConfig(accessConfig) {
  if (!accessConfig || !accessConfig.url || !accessConfig.secretKey) return null;
  return { url: accessConfig.url, secretKey: accessConfig.secretKey };
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

async function responseError(response) {
  var details = { status: response.status };
  try {
    var body = await response.json();
    if (body && typeof body === "object") {
      ["code", "message", "hint"].forEach(function (name) {
        if (typeof body[name] === "string" && body[name]) details[name] = body[name].slice(0, 300);
      });
    }
  } catch (error) {
    // The HTTP status is still useful when Supabase returns no JSON body.
  }
  return details;
}

async function jsonRequest(config, url, options, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") {
    throw new PaymentStoreError("payment_store_unavailable", "The purchase service is unavailable.", 503);
  }
  var response;
  try {
    response = await fetcher(url, options);
  } catch (error) {
    throw new PaymentStoreError("payment_store_unavailable", "The purchase service is unavailable.", 503);
  }
  if (!response.ok) {
    throw new PaymentStoreError("supabase_payment_write_failed", "The purchase record could not be saved.", 502, await responseError(response));
  }
  return response.json().catch(function () { return null; });
}

async function findOrderByCapture(config, captureId, fetchImplementation) {
  var rows = await jsonRequest(config, endpoint(config, "payment_orders", {
    select: "id",
    provider_capture_id: "eq." + captureId,
    limit: "1"
  }), { headers: headers(config) }, fetchImplementation);
  return Array.isArray(rows) && rows[0] && rows[0].id ? rows[0] : null;
}

async function saveEntitlement(config, paymentOrderId, payment, fetchImplementation) {
  return jsonRequest(config, endpoint(config, "entitlements", {
    on_conflict: "buyer_email,program_id"
  }), {
    method: "POST",
    headers: headers(config, { "Prefer": "resolution=ignore-duplicates,return=representation" }),
    body: JSON.stringify({
      buyer_email: payment.buyerEmail,
      program_id: payment.programId,
      payment_order_id: paymentOrderId,
      status: "active"
    })
  }, fetchImplementation);
}

async function recordPurchase(config, payment, fetchImplementation) {
  var existing = await findOrderByCapture(config, payment.providerCaptureId, fetchImplementation);
  if (existing) {
    await saveEntitlement(config, existing.id, payment, fetchImplementation);
    return { paymentOrderId: existing.id, duplicate: true };
  }

  var rows;
  try {
    rows = await jsonRequest(config, endpoint(config, "payment_orders"), {
      method: "POST",
      headers: headers(config, { "Prefer": "return=representation" }),
      body: JSON.stringify({
        provider: "paypal",
        provider_order_id: payment.providerOrderId,
        provider_capture_id: payment.providerCaptureId,
        program_id: payment.programId,
        buyer_email: payment.buyerEmail,
        amount: payment.amount,
        currency: payment.currency,
        status: "completed",
        paid_at: payment.paidAt
      })
    }, fetchImplementation);
  } catch (error) {
    if (!(error instanceof PaymentStoreError)) throw error;
    existing = await findOrderByCapture(config, payment.providerCaptureId, fetchImplementation);
    if (!existing) throw error;
    await saveEntitlement(config, existing.id, payment, fetchImplementation);
    return { paymentOrderId: existing.id, duplicate: true };
  }

  var order = Array.isArray(rows) ? rows[0] : null;
  if (!order || !order.id) {
    throw new PaymentStoreError("supabase_payment_write_failed", "The purchase record could not be saved.", 502);
  }
  await saveEntitlement(config, order.id, payment, fetchImplementation);
  return { paymentOrderId: order.id, duplicate: false };
}

async function findWebhookEvent(config, eventId, fetchImplementation) {
  var rows = await jsonRequest(config, endpoint(config, "payment_webhook_events", {
    select: "provider_event_id,processed_at",
    provider_event_id: "eq." + eventId,
    limit: "1"
  }), { headers: headers(config) }, fetchImplementation);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function recordWebhookEvent(config, event, fetchImplementation) {
  return jsonRequest(config, endpoint(config, "payment_webhook_events", {
    on_conflict: "provider_event_id"
  }), {
    method: "POST",
    headers: headers(config, { "Prefer": "resolution=ignore-duplicates,return=representation" }),
    body: JSON.stringify({
      provider_event_id: event.id,
      event_type: event.event_type,
      payload: event
    })
  }, fetchImplementation);
}

async function markWebhookProcessed(config, eventId, fetchImplementation) {
  return jsonRequest(config, endpoint(config, "payment_webhook_events", {
    provider_event_id: "eq." + eventId
  }), {
    method: "PATCH",
    headers: headers(config, { "Prefer": "return=minimal" }),
    body: JSON.stringify({ processed_at: new Date().toISOString() })
  }, fetchImplementation);
}

module.exports = {
  PaymentStoreError: PaymentStoreError,
  findWebhookEvent: findWebhookEvent,
  getConfig: getConfig,
  markWebhookProcessed: markWebhookProcessed,
  recordPurchase: recordPurchase,
  recordWebhookEvent: recordWebhookEvent
};
