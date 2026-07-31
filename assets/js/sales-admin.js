(function () {
  "use strict";

  var API_URL = "/api/admin/sales";
  var sales = [];
  var loaded = false;
  var activeRefund = null;
  var tableBody = document.getElementById("salesTableBody");
  var empty = document.getElementById("salesEmpty");
  var status = document.getElementById("salesStatus");
  var search = document.getElementById("salesSearch");
  var filter = document.getElementById("salesStatusFilter");
  var refresh = document.getElementById("refreshSales");
  var count = document.getElementById("salesCount");
  var sidebarCount = document.getElementById("sidebarSalesCount");
  var collected = document.getElementById("salesCollected");
  var refunded = document.getElementById("salesRefunded");
  var dialog = document.getElementById("refundDialog");
  var refundBuyer = document.getElementById("refundBuyer");
  var refundProduct = document.getElementById("refundProduct");
  var refundAmount = document.getElementById("refundAmount");
  var confirmation = document.getElementById("refundConfirmation");
  var confirmButton = document.getElementById("confirmRefund");
  var cancelButton = document.getElementById("cancelRefund");
  var refundStatus = document.getElementById("refundStatus");
  if (!tableBody) return;

  function setStatus(message, state) {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function setRefundStatus(message, state) {
    refundStatus.textContent = message;
    if (state) refundStatus.dataset.state = state;
    else delete refundStatus.dataset.state;
  }

  function requestJson(url, options) {
    return fetch(url, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok) {
          var error = new Error(body.error || "request_failed");
          error.code = body.error || "request_failed";
          error.status = response.status;
          throw error;
        }
        return body;
      });
    });
  }

  function money(amount, currency) {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(Number(amount) || 0);
    } catch (error) {
      return (currency || "USD") + " " + (Number(amount) || 0).toFixed(2);
    }
  }

  function dateLabel(value) {
    if (!value) return "Unknown";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
  }

  function statusLabel(value) {
    if (value === "completed") return "Paid";
    if (value === "refunded") return "Refunded";
    if (value === "refund_pending") return "Refund pending";
    return value.replace(/_/g, " ");
  }

  function filteredSales() {
    var query = search.value.trim().toLowerCase();
    var selectedStatus = filter.value;
    return sales.filter(function (sale) {
      var matchesStatus = selectedStatus === "all" || sale.status === selectedStatus;
      var haystack = (sale.buyerEmail + " " + sale.productTitle + " " + sale.programId).toLowerCase();
      return matchesStatus && (!query || haystack.indexOf(query) !== -1);
    });
  }

  function renderSummary() {
    var collectedAmount = sales.reduce(function (total, sale) {
      return total + (sale.status === "completed" ? sale.amount : 0);
    }, 0);
    var refundedAmount = sales.reduce(function (total, sale) {
      return total + (["refunded", "refund_pending"].indexOf(sale.status) !== -1 ? sale.amount : 0);
    }, 0);
    count.textContent = String(sales.length);
    sidebarCount.textContent = String(sales.length);
    collected.textContent = money(collectedAmount, "USD");
    refunded.textContent = money(refundedAmount, "USD");
  }

  function openRefund(sale) {
    activeRefund = sale;
    refundBuyer.textContent = sale.buyerEmail;
    refundProduct.textContent = sale.productTitle;
    refundAmount.textContent = money(sale.amount, sale.currency);
    confirmation.value = "";
    confirmButton.disabled = true;
    setRefundStatus("");
    dialog.hidden = false;
    document.body.classList.add("has-refund-open");
    window.requestAnimationFrame(function () { confirmation.focus(); });
  }

  function closeRefund() {
    if (confirmButton.disabled && confirmation.value === "REFUND" && refundStatus.textContent) return;
    dialog.hidden = true;
    document.body.classList.remove("has-refund-open");
    activeRefund = null;
  }

  function render() {
    tableBody.replaceChildren();
    var visible = filteredSales();
    empty.hidden = visible.length !== 0;
    visible.forEach(function (sale) {
      var row = document.createElement("tr");
      var buyerCell = document.createElement("td");
      var buyer = document.createElement("strong");
      buyer.textContent = sale.buyerEmail;
      var reference = document.createElement("small");
      reference.textContent = sale.orderReference ? "Order …" + sale.orderReference : "Recorded purchase";
      buyerCell.append(buyer, reference);
      var productCell = document.createElement("td");
      productCell.textContent = sale.productTitle;
      var amountCell = document.createElement("td");
      amountCell.textContent = money(sale.amount, sale.currency);
      var dateCell = document.createElement("td");
      dateCell.textContent = dateLabel(sale.paidAt);
      var statusCell = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "payment-status payment-status-" + sale.status;
      badge.textContent = statusLabel(sale.status);
      statusCell.appendChild(badge);
      var actionCell = document.createElement("td");
      if (sale.status === "completed" && sale.provider === "paypal") {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "text-button refund-button";
        button.textContent = "Refund";
        button.addEventListener("click", function () { openRefund(sale); });
        actionCell.appendChild(button);
      } else {
        actionCell.textContent = "—";
      }
      row.append(buyerCell, productCell, amountCell, dateCell, statusCell, actionCell);
      tableBody.appendChild(row);
    });
    renderSummary();
  }

  function loadSales(force) {
    if (loaded && !force) return;
    refresh.disabled = true;
    setStatus("Loading sales…");
    requestJson(API_URL, { credentials: "same-origin" }).then(function (data) {
      sales = Array.isArray(data.sales) ? data.sales : [];
      loaded = true;
      render();
      setStatus(sales.length ? "Sales are up to date." : "No purchases have been recorded yet.", "success");
    }).catch(function (error) {
      if (error.status === 401) window.location.reload();
      else setStatus("Sales could not be loaded. Please try again.", "error");
    }).finally(function () { refresh.disabled = false; });
  }

  confirmation.addEventListener("input", function () {
    confirmButton.disabled = confirmation.value !== "REFUND";
  });
  cancelButton.addEventListener("click", closeRefund);
  dialog.addEventListener("click", function (event) { if (event.target === dialog) closeRefund(); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !dialog.hidden) closeRefund();
  });
  confirmButton.addEventListener("click", function () {
    if (!activeRefund || confirmation.value !== "REFUND") return;
    confirmButton.disabled = true;
    cancelButton.disabled = true;
    setRefundStatus("Submitting the full refund to PayPal…");
    requestJson(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "refund", paymentId: activeRefund.id, confirmation: confirmation.value })
    }).then(function () {
      setRefundStatus("Refund accepted. The buyer's library access has been revoked.", "success");
      return loadSales(true);
    }).then(function () {
      window.setTimeout(function () {
        cancelButton.disabled = false;
        confirmation.value = "";
        closeRefund();
      }, 900);
    }).catch(function (error) {
      cancelButton.disabled = false;
      if (error.status === 401) window.location.reload();
      else if (error.code === "refunds_disabled_in_preview") setRefundStatus("Refunds are disabled in previews. Use the production admin page.", "error");
      else if (error.code === "payment_not_refundable") setRefundStatus("This payment is no longer refundable from this page.", "error");
      else setRefundStatus("The refund was not completed. No local status was changed.", "error");
      confirmButton.disabled = confirmation.value !== "REFUND";
    });
  });
  search.addEventListener("input", render);
  filter.addEventListener("change", render);
  refresh.addEventListener("click", function () { loadSales(true); });
  window.addEventListener("legitbodyfix:admin-authenticated", function () { loadSales(false); });
  if (document.getElementById("main") && document.getElementById("main").hidden === false) loadSales(false);
}());
