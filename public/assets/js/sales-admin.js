(function () {
  "use strict";

  var API_URL = "/api/admin/sales";
  var sales = [];
  var loaded = false;
  var tableBody = document.getElementById("salesTableBody");
  var empty = document.getElementById("salesEmpty");
  var status = document.getElementById("salesStatus");
  var search = document.getElementById("salesSearch");
  var filter = document.getElementById("salesStatusFilter");
  var refresh = document.getElementById("refreshSales");
  var count = document.getElementById("salesCount");
  var sidebarCount = document.getElementById("sidebarSalesCount");
  var collected = document.getElementById("salesCollected");
  var customers = document.getElementById("salesCustomers");
  if (!tableBody) return;

  function setStatus(message, state) {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function requestJson(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok) {
          var error = new Error(body.error || "request_failed");
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
    var buyerEmails = new Set(sales.map(function (sale) { return sale.buyerEmail.toLowerCase(); }).filter(Boolean));
    count.textContent = String(sales.length);
    sidebarCount.textContent = String(sales.length);
    collected.textContent = money(collectedAmount, "USD");
    customers.textContent = String(buyerEmails.size);
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
      reference.textContent = sale.orderReference ? "Order " + sale.orderReference : "Recorded purchase";
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
      row.append(buyerCell, productCell, amountCell, dateCell, statusCell);
      tableBody.appendChild(row);
    });
    renderSummary();
  }

  function loadSales(force) {
    if (loaded && !force) return;
    refresh.disabled = true;
    setStatus("Loading sales...");
    requestJson(API_URL).then(function (data) {
      sales = Array.isArray(data.sales) ? data.sales : [];
      loaded = true;
      render();
      setStatus(sales.length ? "Sales are up to date." : "No purchases have been recorded yet.", "success");
    }).catch(function (error) {
      if (error.status === 401) window.location.reload();
      else setStatus("Sales could not be loaded. Please try again.", "error");
    }).finally(function () { refresh.disabled = false; });
  }

  search.addEventListener("input", render);
  filter.addEventListener("change", render);
  refresh.addEventListener("click", function () { loadSales(true); });
  window.addEventListener("legitbodyfix:admin-authenticated", function () { loadSales(false); });
  if (document.getElementById("main") && document.getElementById("main").hidden === false) loadSales(false);
}());
