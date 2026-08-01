(function () {
  "use strict";

  var grid = document.getElementById("knowledgeGrid");
  var status = document.getElementById("knowledgeStatus");
  var search = document.getElementById("knowledgeSearch");
  var detail = document.getElementById("knowledgeDetail");
  var detailContent = document.getElementById("knowledgeDetailContent");
  var directory = document.querySelector(".knowledge-directory");
  var filterButtons = Array.from(document.querySelectorAll("[data-knowledge-filter]"));
  var muscleTools = document.getElementById("muscleTools");
  var muscleRegionButtons = Array.from(document.querySelectorAll("[data-muscle-region]"));
  var muscleSort = document.getElementById("muscleSort");
  var activeType = "all";
  var activeMuscleRegion = "all";
  var data = { conditions: [], muscles: [], recipes: [] };
  var videos = [];

  var labels = { conditions: "Movement pattern", muscles: "Muscle dictionary", recipes: "Program preview" };
  var summaries = {
    conditions: function (item) { return item.summary || item.screening || "Explore this movement pattern."; },
    muscles: function (item) { return item.actions || item.function || "Explore this muscle's role in movement."; },
    recipes: function (item) { return item.goal || "Preview the purpose of this guided program."; }
  };
  var fields = {
    conditions: [["joints", "Areas involved"], ["tags", "Common associations"], ["tightMuscles", "Often overactive or restricted"], ["weakMuscles", "Often underactive"], ["screening", "Movement screen"]],
    muscles: [["group", "Body region"], ["origin", "Origin"], ["insertion", "Insertion"], ["actions", "Functions and actions"]],
    recipes: [["goal", "What this program works toward"], ["equipment", "What you may need"], ["cautions", "Before you begin"], ["relatedConditions", "Related movement patterns"]]
  };

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  var bodyMapHighlights = {
    "head-neck": { x: 85, y: 34, width: 30, height: 45 },
    shoulder: { x: 48, y: 70, width: 104, height: 35 },
    chest: { x: 66, y: 82, width: 68, height: 48 },
    "upper-arm-front": { x: 40, y: 91, width: 25, height: 66 },
    "upper-arm-back": { x: 135, y: 91, width: 25, height: 66 },
    forearm: { x: 25, y: 145, width: 28, height: 70 },
    abdomen: { x: 72, y: 125, width: 56, height: 70 },
    back: { x: 64, y: 82, width: 72, height: 115 },
    "hip-front": { x: 65, y: 184, width: 70, height: 48 },
    "hip-back": { x: 61, y: 180, width: 78, height: 57 },
    "thigh-front": { x: 58, y: 220, width: 35, height: 100 },
    "thigh-back": { x: 107, y: 220, width: 35, height: 100 },
    "lower-leg-front": { x: 60, y: 308, width: 31, height: 105 },
    "lower-leg-back": { x: 109, y: 308, width: 31, height: 105 },
    foot: { x: 51, y: 405, width: 43, height: 24 }
  };

  function createBodyMap(item, compact) {
    var focus = bodyMapHighlights[item.bodyMap];
    if (!focus) return null;
    var figure = element("figure", compact ? "knowledge-card-body-map" : "detail-body-map");
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 200 440");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", item.title + " body-region orientation map");
    var head = document.createElementNS(svg.namespaceURI, "circle");
    head.setAttribute("cx", "100"); head.setAttribute("cy", "30"); head.setAttribute("r", "18");
    var body = document.createElementNS(svg.namespaceURI, "path");
    body.setAttribute("d", "M76 55 Q100 48 124 55 L143 86 L130 170 L142 220 L126 300 L139 414 L112 414 L100 260 L88 414 L61 414 L74 300 L58 220 L70 170 L57 86 Z");
    var highlight = document.createElementNS(svg.namespaceURI, "rect");
    Object.keys(focus).forEach(function (key) { highlight.setAttribute(key, String(focus[key])); });
    highlight.setAttribute("rx", "12");
    highlight.setAttribute("class", "body-map-highlight");
    svg.append(head, body, highlight);
    figure.appendChild(svg);
    if (!compact) figure.appendChild(element("figcaption", "", "Orientation map: " + (item.group || "body region") + ". Not a diagnostic image."));
    return figure;
  }

  function allItems() {
    return Object.keys(labels).flatMap(function (type) {
      return data[type].filter(function (item) { return item && item.published !== false; }).map(function (item) { return { type: type, item: item }; });
    });
  }

  function muscleRegion(item) {
    var bodyMap = item && item.bodyMap;
    var group = String(item && item.group || "").toLowerCase();
    if (["head-neck", "shoulder", "chest", "upper-arm-front", "upper-arm-back", "forearm"].indexOf(bodyMap) !== -1) return "upper-body";
    if (["abdomen", "back"].indexOf(bodyMap) !== -1) return "trunk";
    if (["hip-front", "hip-back", "thigh-front", "thigh-back"].indexOf(bodyMap) !== -1) return "hip-thigh";
    if (["lower-leg-front", "lower-leg-back", "foot"].indexOf(bodyMap) !== -1) return "lower-leg-foot";
    if (["head and neck", "shoulder", "shoulder girdle", "upper back", "chest", "upper arm", "forearm"].indexOf(group) !== -1) return "upper-body";
    return "other";
  }

  function updateMuscleCounts() {
    var muscles = data.muscles.filter(function (item) { return item && item.published !== false; });
    document.querySelectorAll("[data-region-count]").forEach(function (node) {
      var region = node.dataset.regionCount;
      var count = region === "all" ? muscles.length : muscles.filter(function (item) { return muscleRegion(item) === region; }).length;
      node.textContent = String(count);
    });
  }

  function updateUrl(type, id) {
    var url = new URL(window.location.href);
    if (type && id) { url.searchParams.set("type", type); url.searchParams.set("id", id); }
    else { url.searchParams.delete("type"); url.searchParams.delete("id"); }
    history.pushState({}, "", url.pathname + url.search);
  }

  function openDetail(type, item, shouldUpdateUrl) {
    if (!labels[type] || !item) return;
    var intro = element("div", "detail-intro");
    intro.append(element("p", "detail-kicker", labels[type]), element("h2", "", item.title || "Untitled"), element("p", "detail-summary", summaries[type](item)));
    var list = element("dl", "detail-fields");
    fields[type].forEach(function (definition) {
      var value = item[definition[0]];
      if (type === "muscles" && definition[0] === "actions" && !value) value = item.function;
      if (typeof value !== "string" || !value.trim()) return;
      var row = element("div", "detail-field");
      row.append(element("dt", "", definition[1]), element("dd", "", value));
      list.appendChild(row);
    });
    var body = element("div", "detail-layout");
    var facts = element("div", "detail-facts");
    if (type === "muscles" && typeof item.imageUrl === "string" && /^https:\/\//i.test(item.imageUrl)) {
      var figure = element("figure", "detail-anatomy-image");
      var anatomyImage = document.createElement("img");
      anatomyImage.src = item.imageUrl;
      anatomyImage.alt = item.imageAlt || (item.title + " anatomy illustration");
      anatomyImage.loading = "eager";
      anatomyImage.decoding = "async";
      figure.appendChild(anatomyImage);
      if (item.imageCredit) {
        var caption = document.createElement("figcaption");
        if (typeof item.imageCreditUrl === "string" && /^https:\/\//i.test(item.imageCreditUrl)) {
          var creditLink = document.createElement("a");
          creditLink.href = item.imageCreditUrl;
          creditLink.target = "_blank";
          creditLink.rel = "noopener noreferrer";
          creditLink.textContent = item.imageCredit;
          caption.append("Image: ", creditLink);
        } else caption.textContent = "Image: " + item.imageCredit;
        figure.appendChild(caption);
      }
      facts.appendChild(figure);
    } else if (type === "muscles") {
      var bodyMap = createBodyMap(item, false);
      if (bodyMap) facts.appendChild(bodyMap);
    }
    facts.append(list, element("p", "detail-disclaimer", "Use this resource for movement education only. Pain, acute injury, neurological symptoms, or uncertainty about exercise should be assessed by a qualified clinician."));
    if (type === "muscles" && item.sourceName && typeof item.sourceUrl === "string" && /^https:\/\//i.test(item.sourceUrl)) {
      var source = element("p", "detail-source", "Reference: ");
      var sourceLink = document.createElement("a");
      sourceLink.href = item.sourceUrl; sourceLink.target = "_blank"; sourceLink.rel = "noopener noreferrer"; sourceLink.textContent = item.sourceName;
      source.appendChild(sourceLink); facts.appendChild(source);
    }
    body.append(intro, facts);
    var relatedIds = typeof item.relatedVideoIds === "string" ? item.relatedVideoIds.split(",").map(function (id) { return id.trim(); }).filter(Boolean) : [];
    var relatedVideos = videos.filter(function (video) { return video && video.published !== false && relatedIds.indexOf(video.id) !== -1; });
    var related = null;
    if (relatedVideos.length) {
      related = element("section", "related-sessions");
      var relatedHeading = element("div", "related-heading");
      relatedHeading.append(element("p", "detail-kicker", "Put it into practice"), element("h3", "", "Related guided sessions"));
      var relatedGrid = element("div", "related-session-grid");
      relatedVideos.forEach(function (video) {
        var card = element("a", "related-session-card");
        card.href = "video.html?id=" + encodeURIComponent(video.id);
        var copy = element("div", "related-session-copy");
        copy.append(element("span", "", String(video.durationMinutes || "") + " min · " + (video.level || "Session")), element("h4", "", video.title || "Movement session"), element("p", "", video.description || "Follow this focused guided session."), element("b", "", "View session →"));
        var imageUrl = typeof video.thumbnailUrl === "string" && /^https:\/\//.test(video.thumbnailUrl) ? video.thumbnailUrl : "";
        if (imageUrl) { var image = document.createElement("img"); image.src = imageUrl; image.alt = ""; image.loading = "lazy"; card.appendChild(image); }
        card.appendChild(copy); relatedGrid.appendChild(card);
      });
      related.append(relatedHeading, relatedGrid);
    }
    detailContent.replaceChildren(body);
    if (related) detailContent.appendChild(related);
    directory.hidden = true;
    detail.hidden = false;
    document.title = (item.title || "Movement Guide") + " — LegitBodyFix";
    if (shouldUpdateUrl !== false) updateUrl(type, item.id);
    detail.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showDirectory(shouldUpdateUrl) {
    detail.hidden = true;
    directory.hidden = false;
    document.title = "Movement Guides — LegitBodyFix";
    if (shouldUpdateUrl !== false) updateUrl();
  }

  function createCard(record) {
    var card = element("button", "knowledge-card");
    card.type = "button";
    card.setAttribute("aria-label", "Read about " + record.item.title);
    if (record.type === "muscles" && typeof record.item.imageUrl === "string" && /^https:\/\//i.test(record.item.imageUrl)) {
      card.classList.add("has-media");
      var media = element("span", "knowledge-card-media");
      var image = document.createElement("img");
      image.src = record.item.imageUrl;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      media.appendChild(image);
      card.appendChild(media);
    } else if (record.type === "muscles") {
      var map = createBodyMap(record.item, true);
      if (map) { card.classList.add("has-media"); card.appendChild(map); }
    }
    card.append(element("span", "knowledge-card-type", labels[record.type]), element("h3", "", record.item.title), element("p", "", summaries[record.type](record.item)), element("span", "knowledge-card-link", record.type === "recipes" ? "Preview the approach →" : "Read the guide →"));
    card.addEventListener("click", function () { openDetail(record.type, record.item); });
    return card;
  }

  function render() {
    var query = search.value.trim().toLowerCase();
    var records = allItems().filter(function (record) {
      if (activeType !== "all" && record.type !== activeType) return false;
      if (activeType === "muscles" && activeMuscleRegion !== "all" && muscleRegion(record.item) !== activeMuscleRegion) return false;
      return !query || Object.values(record.item).some(function (value) { return typeof value === "string" && value.toLowerCase().includes(query); });
    });
    if (activeType === "muscles" && muscleSort.value === "alpha") {
      records.sort(function (a, b) { return String(a.item.title || "").localeCompare(String(b.item.title || "")); });
    }
    if (!records.length) grid.replaceChildren(element("p", "knowledge-empty", "No published resources match that search yet."));
    else grid.replaceChildren.apply(grid, records.map(createCard));
    grid.setAttribute("aria-busy", "false");
    status.textContent = records.length + (records.length === 1 ? " movement guide" : " movement guides");
  }

  function openFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var type = params.get("type");
    var id = params.get("id");
    if (!labels[type] || !id) { showDirectory(false); return; }
    var item = data[type].find(function (candidate) { return candidate.id === id && candidate.published !== false; });
    if (item) openDetail(type, item, false);
    else showDirectory(false);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeType = button.dataset.knowledgeFilter;
      filterButtons.forEach(function (candidate) { var selected = candidate === button; candidate.classList.toggle("is-active", selected); candidate.setAttribute("aria-pressed", String(selected)); });
      muscleTools.hidden = activeType !== "muscles";
      render();
    });
  });
  muscleRegionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeMuscleRegion = button.dataset.muscleRegion;
      muscleRegionButtons.forEach(function (candidate) { var selected = candidate === button; candidate.classList.toggle("is-active", selected); candidate.setAttribute("aria-pressed", String(selected)); });
      render();
    });
  });
  muscleSort.addEventListener("change", render);
  search.addEventListener("input", render);
  document.getElementById("detailBack").addEventListener("click", function () { showDirectory(); });
  window.addEventListener("popstate", openFromUrl);

  Promise.all([
    fetch("assets/data/knowledge-base.json", { cache: "no-cache" }),
    fetch("assets/data/videos.json", { cache: "no-cache" })
  ]).then(function (responses) {
    if (!responses[0].ok || !responses[1].ok) throw new Error("Unable to load public content");
    return Promise.all([responses[0].json(), responses[1].json()]);
  }).then(function (payloads) {
      var payload = payloads[0];
      videos = Array.isArray(payloads[1]) ? payloads[1] : [];
      Object.keys(labels).forEach(function (type) { data[type] = Array.isArray(payload[type]) ? payload[type] : []; });
      updateMuscleCounts();
      render();
      openFromUrl();
    })
    .catch(function () { status.textContent = "The movement guides are temporarily unavailable."; status.setAttribute("role", "alert"); grid.setAttribute("aria-busy", "false"); });
})();
