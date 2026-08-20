"use strict";

var statusElement = document.getElementById("checkoutStatus");
var buttonContainer = document.getElementById("paypalButtonContainer");
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

function getRequestedProductId() {
  try {
    var value = new URLSearchParams(window.location.search).get("product");
    return typeof value === "string" ? value.trim() : "";
  } catch (error) {
    return "";
  }
}

function chooseProduct(catalog) {
  var products = Array.isArray(catalog) ? catalog : [];
  var requestedId = canonicalProductId(getRequestedProductId());
  return products.find(function (item) { return item.id === requestedId; }) ||
    products.find(function (item) { return item.id === BUNDLE_ID; }) ||
    products[0] || null;
}

function formatPrice(product) {
  var amount = Number(product.amount);
  if (!Number.isFinite(amount)) return "$" + product.amount;
  return "$" + (Number.isInteger(amount) ? amount : amount.toFixed(2));
}

function applyProduct(product) {
  var isBundle = product.id === BUNDLE_ID;
  var sessionTitle = product.title.replace(/\s*—\s*Single Session$/, "");
  labelElement.textContent = isBundle ? "NECK & SHOULDER RESET" : sessionTitle.toUpperCase();
  nameElement.textContent = isBundle ? "Full Body Restoration Package" : "Single Session — Lifetime Access";
  priceElement.innerHTML = formatPrice(product) + "<span> " + product.currency + " / one-time</span>";
  if (introElement) {
    introElement.textContent = isBundle
      ? "Get lifetime access to the Full Body Restoration Package. There is no subscription and no recurring charge."
      : "Get lifetime access to \u201c" + sessionTitle + "\u201d. There is no subscription and no recurring charge.";
  }
}

function request(url, options) {
  return fetch(url, options).then(function (response) {
    return response.json().catch(function () { return {}; }).then(function (payload) {
      if (!response.ok) throw new Error(payload.error || "payment_request_failed");
      return payload;
    });
  });
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

async function beginCheckout() {
  setStatus("Loading secure checkout…", false);
  try {
    var config = await request("/api/paypal/config", { cache: "no-store" });
    var product = chooseProduct(config.catalog);
    if (!product) throw new Error("no_products_available");
    applyProduct(product);

    var paypal = await loadPaypalSdk(config);
    buttonContainer.replaceChildren();
    paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
      createOrder: async function () {
        var payload = await request("/api/paypal/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id })
        });
        return payload.orderId;
      },
      onApprove: async function (data) {
        setStatus("Confirming your payment securely…", false);
        var payload = await request("/api/paypal/orders/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID })
        });
        if (payload.completed) window.location.assign(payload.libraryUrl + "?purchase=complete");
      },
      onCancel: function () {
        setStatus("Checkout was cancelled. No payment was taken.", false);
      },
      onError: function (error) {
        console.error("PayPal checkout failed:", error && error.message ? error.message : error);
        setStatus("We could not complete the payment. Please try again or contact us if the problem continues.", true);
      }
    }).render("#paypalButtonContainer");
    setStatus("Choose PayPal or an eligible debit or credit card option below.", false);
  } catch (error) {
    console.error("PayPal checkout setup failed:", error && error.message ? error.message : error);
    setStatus("Secure checkout is not configured yet. Please try again later.", true);
  }
}

beginCheckout();
