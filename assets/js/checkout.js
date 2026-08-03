"use strict";

var statusElement = document.getElementById("checkoutStatus");
var cardButton = document.getElementById("cardPaymentButton");
var paypalContainer = document.getElementById("paypalButtonContainer");
var paymentDivider = document.getElementById("paymentDivider");
var labelElement = document.getElementById("productLabel");
var nameElement = document.getElementById("productName");
var priceElement = document.getElementById("productPrice");
var introElement = document.getElementById("checkoutIntro");
var BUNDLE_ID = "neck-shoulder-reset";

function canonicalProductId(value) {
  return value === "shoulder-reset" ? "ankle-sprain-rehabilitation" : value;
}

function setStatus(message, isError) {
  statusElement.textContent = message || "";
  statusElement.classList.toggle("error", Boolean(isError));
}

function queryValue(name) {
  try { return new URLSearchParams(window.location.search).get(name) || ""; }
  catch (error) { return ""; }
}

function getRequestedProductId() {
  return canonicalProductId(queryValue("product").trim());
}

function chooseProduct(catalog) {
  var products = Array.isArray(catalog) ? catalog : [];
  var requestedId = getRequestedProductId();
  return products.find(function (item) { return item.id === requestedId; }) ||
    products.find(function (item) { return item.id === BUNDLE_ID; }) || products[0] || null;
}

function formatPrice(product) {
  var amount = Number(product.amount);
  if (!Number.isFinite(amount)) return "$" + product.amount;
  return "$" + (Number.isInteger(amount) ? amount : amount.toFixed(2));
}

function applyProduct(product) {
  var isBundle = product.id === BUNDLE_ID;
  var sessionTitle = product.title.replace(/\s*—\s*Single Session$/, "");
  labelElement.textContent = isBundle ? "FULL BODY RESTORATION" : sessionTitle.toUpperCase();
  nameElement.textContent = isBundle ? "Full Body Restoration Package" : "Single Session — Lifetime Access";
  priceElement.innerHTML = formatPrice(product) + "<span> " + product.currency + " / one-time</span>";
  if (introElement) introElement.textContent = isBundle
    ? "Get lifetime access to the Full Body Restoration Package. There is no subscription and no recurring charge."
    : "Get lifetime access to “" + sessionTitle + "”. There is no subscription and no recurring charge.";
}

function request(url, options) {
  return fetch(url, options).then(function (response) {
    return response.json().catch(function () { return {}; }).then(function (payload) {
      if (!response.ok) throw new Error(payload.error || "payment_request_failed");
      return payload;
    });
  });
}

function optionalRequest(url) {
  return request(url, { cache: "no-store" }).catch(function () { return null; });
}

function loadPaypalSdk(config) {
  return new Promise(function (resolve, reject) {
    if (window.paypal && window.paypal.Buttons) return resolve(window.paypal);
    var script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(config.clientId) +
      "&currency=" + encodeURIComponent(config.currency) + "&intent=capture&components=buttons";
    script.async = true;
    script.onload = function () {
      if (window.paypal && window.paypal.Buttons) resolve(window.paypal);
      else reject(new Error("paypal_sdk_unavailable"));
    };
    script.onerror = function () { reject(new Error("paypal_sdk_unavailable")); };
    document.head.appendChild(script);
  });
}

async function confirmStripeReturn() {
  if (queryValue("stripe") !== "success") return false;
  var sessionId = queryValue("session_id");
  if (!sessionId) throw new Error("missing_stripe_session");
  setStatus("Confirming your card payment securely…", false);
  var payload = await request("/api/stripe/checkout/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: sessionId })
  });
  if (!payload.completed) throw new Error("stripe_confirmation_failed");
  window.location.replace(payload.libraryUrl + "?purchase=complete");
  return true;
}

function setupCardCheckout(product) {
  cardButton.hidden = false;
  cardButton.addEventListener("click", async function () {
    cardButton.disabled = true;
    setStatus("Opening encrypted card checkout…", false);
    try {
      var payload = await request("/api/stripe/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id })
      });
      window.location.assign(payload.checkoutUrl);
    } catch (error) {
      cardButton.disabled = false;
      console.error("Card checkout failed:", error && error.message ? error.message : error);
      setStatus("Card checkout could not be opened. Please try again or use PayPal.", true);
    }
  });
}

async function setupPaypalCheckout(config, product) {
  var paypal = await loadPaypalSdk(config);
  paypalContainer.hidden = false;
  paypalContainer.replaceChildren();
  paypal.Buttons({
    style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
    createOrder: async function () {
      var payload = await request("/api/paypal/orders/create", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id })
      });
      return payload.orderId;
    },
    onApprove: async function (data) {
      setStatus("Confirming your PayPal payment securely…", false);
      var payload = await request("/api/paypal/orders/capture", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: data.orderID })
      });
      if (payload.completed) window.location.assign(payload.libraryUrl + "?purchase=complete");
    },
    onCancel: function () { setStatus("Checkout was cancelled. No payment was taken.", false); },
    onError: function (error) {
      console.error("PayPal checkout failed:", error && error.message ? error.message : error);
      setStatus("PayPal could not complete the payment. Please try again or pay by card.", true);
    }
  }).render("#paypalButtonContainer");
}

async function beginCheckout() {
  setStatus("Loading secure checkout…", false);
  try {
    if (await confirmStripeReturn()) return;
    var configs = await Promise.all([optionalRequest("/api/stripe/config"), optionalRequest("/api/paypal/config")]);
    var stripeConfig = configs[0];
    var paypalConfig = configs[1];
    var catalog = stripeConfig && stripeConfig.catalog || paypalConfig && paypalConfig.catalog || [];
    var product = chooseProduct(catalog);
    if (!product) throw new Error("no_products_available");
    applyProduct(product);

    if (stripeConfig) setupCardCheckout(product);
    if (paypalConfig) {
      try { await setupPaypalCheckout(paypalConfig, product); }
      catch (error) { console.error("PayPal setup failed:", error && error.message ? error.message : error); paypalConfig = null; }
    }
    paymentDivider.hidden = !(stripeConfig && paypalConfig);
    if (!stripeConfig && !paypalConfig) throw new Error("no_payment_provider");
    if (queryValue("stripe") === "cancelled") setStatus("Card checkout was cancelled. No payment was taken.", false);
    else if (stripeConfig && paypalConfig) setStatus("Pay securely by card, or choose PayPal below.", false);
    else if (stripeConfig) setStatus("Pay securely by debit or credit card.", false);
    else setStatus("Pay securely with PayPal.", false);
  } catch (error) {
    console.error("Checkout setup failed:", error && error.message ? error.message : error);
    setStatus("Secure checkout is not configured yet. Please try again later.", true);
  }
}

beginCheckout();
