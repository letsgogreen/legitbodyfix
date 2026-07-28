"use strict";

var statusElement = document.getElementById("checkoutStatus");
var buttonContainer = document.getElementById("paypalButtonContainer");

function setStatus(message, isError) {
  statusElement.textContent = message || "";
  statusElement.classList.toggle("error", Boolean(isError));
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
    var paypal = await loadPaypalSdk(config);
    buttonContainer.replaceChildren();
    paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
      createOrder: async function () {
        var payload = await request("/api/paypal/orders/create", { method: "POST" });
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
