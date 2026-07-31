"use strict";

function SalesError(code, statusCode, details) {
  this.name = "SalesError";
  this.code = code;
  this.statusCode = statusCode || 502;
  this.details = details || null;
  if (Error.captureStackTrace) Error.captureStackTrace(this, SalesError);
}

SalesError.prototype = Object.create(Error.prototype);
SalesError.prototype.constructor = SalesError;

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
    // The HTTP status is sufficient when Supabase sends no JSON body.
  }
  return details;
}

async function request(config, url, options, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new SalesError("sales_service_unavailable", 503);

  var response;
  try {
    response = await fetcher(url, options);
  } catch (error) {
    throw new SalesError("sales_service_unavailable", 503);
  }
  if (!response.ok) {
    throw new SalesError("sales_store_request_failed", 502, await failureDetails(response));
  }
  return response.json().catch(function () { return null; });
}

function normalizeOrder(row, productLookup) {
  var product = productLookup(row.program_id);
  return {
    id: String(row.id || ""),
    buyerEmail: String(row.buyer_email || ""),
    programId: String(row.program_id || ""),
    productTitle: product ? product.title : String(row.program_id || "Program"),
    amount: Number(row.amount) || 0,
    currency: String(row.currency || "USD"),
    status: String(row.status || "unknown").toLowerCase(),
    provider: String(row.provider || ""),
    paidAt: typeof row.paid_at === "string" ? row.paid_at : null,
    providerOrderId: String(row.provider_order_id || ""),
    providerCaptureId: String(row.provider_capture_id || "")
  };
}

async function listSales(config, productLookup, fetchImplementation) {
  var rows = await request(config, endpoint(config, "payment_orders", {
    select: "id,provider,provider_order_id,provider_capture_id,program_id,buyer_email,amount,currency,status,paid_at",
    order: "paid_at.desc",
    limit: "500"
  }), { headers: headers(config) }, fetchImplementation);

  if (!Array.isArray(rows)) throw new SalesError("sales_response_invalid", 502);
  return rows.map(function (row) {
    var order = normalizeOrder(row, productLookup);
    return {
      id: order.id,
      buyerEmail: order.buyerEmail,
      programId: order.programId,
      productTitle: order.productTitle,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      provider: order.provider,
      paidAt: order.paidAt,
      orderReference: order.providerOrderId ? order.providerOrderId.slice(-6) : ""
    };
  });
}

async function findSale(config, paymentId, productLookup, fetchImplementation) {
  var id = typeof paymentId === "string" ? paymentId.trim() : "";
  if (!id || id.length > 100) throw new SalesError("invalid_payment", 422);
  var rows = await request(config, endpoint(config, "payment_orders", {
    select: "id,provider,provider_order_id,provider_capture_id,program_id,buyer_email,amount,currency,status,paid_at",
    id: "eq." + id,
    limit: "1"
  }), { headers: headers(config) }, fetchImplementation);
  if (!Array.isArray(rows) || !rows[0]) throw new SalesError("payment_not_found", 404);
  return normalizeOrder(rows[0], productLookup);
}

async function markRefunded(config, sale, refund, fetchImplementation) {
  var status = refund.status === "COMPLETED" ? "refunded" : "refund_pending";
  await request(config, endpoint(config, "payment_orders", { id: "eq." + sale.id }), {
    method: "PATCH",
    headers: headers(config, { "Prefer": "return=minimal" }),
    body: JSON.stringify({ status: status })
  }, fetchImplementation);

  await request(config, endpoint(config, "entitlements", { payment_order_id: "eq." + sale.id }), {
    method: "PATCH",
    headers: headers(config, { "Prefer": "return=minimal" }),
    body: JSON.stringify({ status: "revoked" })
  }, fetchImplementation);
  return status;
}

module.exports = {
  SalesError: SalesError,
  findSale: findSale,
  listSales: listSales,
  markRefunded: markRefunded
};
