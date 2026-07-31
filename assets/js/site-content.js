(function () {
  "use strict";

  var DATA_URL = "assets/data/site-content.json";
  var PREVIEW_KEY = "legitbodyfix.siteContentPreview.v1";

  function readPath(source, path) {
    return path.split(".").reduce(function (value, key) {
      return value != null ? value[key] : undefined;
    }, source);
  }

  function applyContent(content) {
    document.querySelectorAll("[data-content]").forEach(function (element) {
      var value = readPath(content, element.dataset.content);
      if (typeof value === "string") element.textContent = value;
    });
  }

  function previewContent() {
    if (new URLSearchParams(window.location.search).get("content-preview") !== "1") return null;
    try {
      return JSON.parse(localStorage.getItem(PREVIEW_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  var preview = previewContent();
  if (preview) {
    applyContent(preview);
    return;
  }

  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("Unable to load site content");
      return response.json();
    })
    .then(applyContent)
    .catch(function () {
      // The HTML contains a complete static fallback, so the page remains usable.
    });
})();
