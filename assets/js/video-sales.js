(function () {
  "use strict";

  var loading = document.getElementById("loadingState");
  var unavailable = document.getElementById("unavailableState");
  var page = document.getElementById("salesPage");

  function setText(id, value) {
    document.getElementById(id).textContent = value;
  }

  function text(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function safeImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      var parsed = new URL(value);
      return parsed.protocol === "https:" ? parsed.toString() : "";
    } catch (error) {
      return "";
    }
  }

  function isPurchasablePrice(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  }

  function formatPrice(value) {
    return "$" + (Number.isInteger(value) ? value : value.toFixed(2)) + " USD";
  }

  function showUnavailable() {
    loading.hidden = true;
    unavailable.hidden = false;
    page.hidden = true;
  }

  function render(video) {
    var title = text(video.title, "Movement session");
    var hasOwnPrice = isPurchasablePrice(video.price);
    var productId = hasOwnPrice ? video.id : text(video.programId, "neck-shoulder-reset");
    var checkoutUrl = "checkout.html?product=" + encodeURIComponent(productId);
    var headline = text(video.landingHeadline, "Build better movement with " + title + ".");
    var summary = text(video.landingSummary, text(video.description, "A focused session designed to improve awareness and control."));

    document.title = title + " — LegitBodyFix";
    document.getElementById("metaDescription").setAttribute("content", summary.slice(0, 155));
    setText("landingEyebrow", text(video.landingEyebrow, "Targeted movement session"));
    setText("landingHeadline", headline);
    setText("landingSummary", summary);
    setText("duration", String(video.durationMinutes) + " minutes");
    setText("level", text(video.level, "Foundational").toLowerCase().replace(/^./, function (letter) { return letter.toUpperCase(); }));
    setText("equipment", text(video.equipment, "Bodyweight"));
    setText("moduleNumber", "SESSION " + String(video.moduleNumber || 1).padStart(2, "0"));
    setText("previewTitle", title);
    setText("description", text(video.description, summary));
    setText("benefit1", text(video.landingBenefit1, "Practice controlled movement with a clear sequence."));
    setText("benefit2", text(video.landingBenefit2, "Build awareness you can apply outside the session."));
    setText("benefit3", text(video.landingBenefit3, "Return to the practice whenever you need it."));
    setText("audience", text(video.landingAudience, "For people who want a focused, practical approach to better everyday movement."));
    setText("reassurance", text(video.landingReassurance, "One payment gives you protected access through your personal movement library."));
    setText("finalHeadline", "Put " + title.toLowerCase() + " into practice.");
    setText("price", hasOwnPrice ? formatPrice(video.price) : "Complete program");
    setText("paymentNote", hasOwnPrice ? "One-time payment" : "Included in the full package");

    document.querySelectorAll(".checkout-link").forEach(function (link) { link.href = checkoutUrl; });

    var thumbnailUrl = safeImageUrl(video.thumbnailUrl);
    if (thumbnailUrl) {
      var thumbnail = document.getElementById("thumbnail");
      thumbnail.src = thumbnailUrl;
      thumbnail.alt = title + " session preview";
      thumbnail.hidden = false;
      document.getElementById("previewPlaceholder").hidden = true;
    }

    loading.hidden = true;
    unavailable.hidden = true;
    page.hidden = false;
  }

  var videoId = new URLSearchParams(window.location.search).get("id");
  if (!videoId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(videoId)) {
    showUnavailable();
    return;
  }

  fetch("assets/data/videos.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("Unable to load sessions");
      return response.json();
    })
    .then(function (videos) {
      if (!Array.isArray(videos)) throw new Error("Invalid session data");
      var video = videos.find(function (item) { return item && item.id === videoId && item.published !== false; });
      if (!video) return showUnavailable();
      render(video);
    })
    .catch(showUnavailable);
})();
