(function () {
  "use strict";

  var DATA_URL = "assets/data/knowledge-base.json";
  var PUBLISH_URL = "/api/admin/videos";
  var DRAFT_KEY = "legitbodyfix.knowledgeBaseDraft.v1";
  var list = document.getElementById("knowledgeList");
  if (!list) return;

  var status = document.getElementById("knowledgeStatus");
  var search = document.getElementById("knowledgeSearch");
  var publishButton = document.getElementById("publishKnowledge");
  var resetButton = document.getElementById("resetKnowledgeDraft");
  var addButton = document.getElementById("addKnowledgeRecord");
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-knowledge-type]"));
  var countNodes = {
    conditions: document.getElementById("conditionCount"),
    muscles: document.getElementById("muscleCount"),
    recipes: document.getElementById("recipeCount")
  };
  var activeType = "conditions";
  var data = { conditions: [], muscles: [], recipes: [] };
  var repositoryData = null;
  var started = false;

  var schemas = {
    conditions: [
      ["title", "Guide name", 120], ["pathway", "Content pathway", 40], ["joints", "Related joints", 240], ["tags", "Tags", 400],
      ["summary", "Clinical summary", 800, true], ["tightMuscles", "Commonly tight / overactive", 500],
      ["weakMuscles", "Commonly weak / underactive", 500], ["screening", "Screening signs", 600, true],
      ["relatedVideoIds", "Related session IDs (comma separated)", 500]
    ],
    muscles: [
      ["title", "Muscle name", 120], ["group", "Body region", 160], ["origin", "Origin", 800, true],
      ["insertion", "Insertion", 800, true], ["actions", "Functions and actions", 800, true],
      ["imageUrl", "Anatomy image URL (HTTPS)", 800], ["imageAlt", "Image description", 240],
      ["imageCredit", "Image credit", 240], ["imageCreditUrl", "Image source URL (HTTPS)", 800],
      ["bodyMap", "Body map region", 80], ["sourceName", "Anatomy reference name", 240],
      ["sourceUrl", "Anatomy reference URL (HTTPS)", 800],
      ["relatedVideoIds", "Related session IDs (comma separated)", 500]
    ],
    recipes: [
      ["title", "Recipe title", 120], ["pathway", "Content pathway", 40], ["bodyRegion", "Body area", 120], ["time", "Estimated time", 80],
      ["goal", "Public goal", 500, true], ["whenToUse", "Useful starting point when", 800, true], ["equipment", "Equipment", 300],
      ["steps", "Starting sequence", 2400, true], ["dosage", "Suggested dose", 800, true],
      ["reassess", "Reassessment checkpoint", 800, true], ["regression", "Regression", 800, true],
      ["progression", "Progression", 800, true], ["cautions", "Stop / referral guidance", 800, true],
      ["relatedConditions", "Related conditions", 500], ["sourceName", "Exercise reference name", 300], ["sourceUrl", "Exercise reference URL", 800], ["relatedVideoIds", "Related session IDs (comma separated)", 500]
    ]
  };

  function setStatus(message, state) {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function normalizeMuscles(payload) {
    (payload.muscles || []).forEach(function (record) {
      if (!record.actions && record.function) record.actions = record.function;
    });
    ["conditions", "recipes"].forEach(function (type) {
      (payload[type] || []).forEach(function (record) {
        if (!record.pathway) record.pathway = "postural-movement";
      });
    });
    return payload;
  }

  function slugify(value) {
    return String(value || "record").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "record";
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    updateCounts();
    setStatus("Draft saved in this browser. Publish when ready.", "draft");
  }

  function updateCounts() {
    Object.keys(countNodes).forEach(function (type) { if (countNodes[type]) countNodes[type].textContent = data[type].length; });
    var sidebar = document.getElementById("sidebarKnowledgeCount");
    if (sidebar) sidebar.textContent = data.conditions.length + data.muscles.length + data.recipes.length;
  }

  function makeField(record, definition) {
    var name = definition[0];
    var label = document.createElement("label");
    label.className = "field" + (definition[3] ? " field-wide" : "");
    var caption = document.createElement("span");
    caption.textContent = definition[1];
    var input;
    if (name === "pathway") {
      input = document.createElement("select");
      [
        ["postural-movement", "Postural & movement issues"],
        ["musculoskeletal-condition", "Musculoskeletal conditions & injuries"]
      ].forEach(function (entry) {
        var option = document.createElement("option");
        option.value = entry[0];
        option.textContent = entry[1];
        input.appendChild(option);
      });
    } else input = definition[3] ? document.createElement("textarea") : document.createElement("input");
    if (definition[3]) input.rows = name === "steps" ? 7 : 4;
    else if (name !== "pathway") input.type = "text";
    input.name = name;
    if (name !== "pathway") input.maxLength = definition[2];
    input.value = record[name] || (name === "pathway" ? "postural-movement" : "");
    input.addEventListener("input", function () {
      record[name] = input.value;
      if (name === "title") {
        var heading = label.closest(".knowledge-card").querySelector("h3");
        heading.textContent = input.value || "Untitled record";
      }
      saveDraft();
    });
    label.appendChild(caption);
    label.appendChild(input);
    return label;
  }

  function render() {
    list.textContent = "";
    var query = search.value.trim().toLowerCase();
    var visible = data[activeType].filter(function (record) { return !query || JSON.stringify(record).toLowerCase().indexOf(query) !== -1; });
    visible.forEach(function (record) {
      var card = document.createElement("article");
      card.className = "knowledge-card";
      var header = document.createElement("header");
      var headingWrap = document.createElement("div");
      var eyebrow = document.createElement("span");
      eyebrow.className = "module-chip";
      eyebrow.textContent = activeType.slice(0, -1);
      var heading = document.createElement("h3");
      heading.textContent = record.title || "Untitled record";
      headingWrap.appendChild(eyebrow);
      headingWrap.appendChild(heading);
      var actions = document.createElement("div");
      actions.className = "row-actions";
      var publishLabel = document.createElement("label");
      publishLabel.className = "knowledge-publish-toggle";
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = record.published === true;
      checkbox.addEventListener("change", function () { record.published = checkbox.checked; saveDraft(); });
      publishLabel.appendChild(checkbox);
      publishLabel.appendChild(document.createTextNode(" Published"));
      var remove = document.createElement("button");
      remove.className = "button button-quiet";
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        data[activeType] = data[activeType].filter(function (item) { return item !== record; });
        saveDraft(); render();
      });
      actions.appendChild(publishLabel);
      actions.appendChild(remove);
      header.appendChild(headingWrap);
      header.appendChild(actions);
      var fields = document.createElement("div");
      fields.className = "form-grid knowledge-fields";
      schemas[activeType].forEach(function (definition) { fields.appendChild(makeField(record, definition)); });
      card.appendChild(header);
      card.appendChild(fields);
      list.appendChild(card);
    });
    if (!visible.length) {
      var empty = document.createElement("div");
      empty.className = "knowledge-empty";
      var emptyTitle = document.createElement("strong");
      var emptyMessage = document.createElement("span");
      emptyTitle.textContent = "No matching records.";
      emptyMessage.textContent = "Add a record or try another search.";
      empty.appendChild(emptyTitle);
      empty.appendChild(emptyMessage);
      list.appendChild(empty);
    }
    list.setAttribute("aria-busy", "false");
    updateCounts();
  }

  function uniqueId(title) {
    var base = slugify(title), candidate = base, number = 2;
    while (data[activeType].some(function (item) { return item.id === candidate; })) candidate = base + "-" + number++;
    return candidate;
  }

  function addRecord() {
    var labels = { conditions: "New movement pattern", muscles: "New muscle", recipes: "New correction recipe" };
    var record = { id: uniqueId(labels[activeType]), title: labels[activeType], published: false };
    if (activeType === "conditions" || activeType === "recipes") record.pathway = "postural-movement";
    schemas[activeType].forEach(function (definition) { if (!(definition[0] in record)) record[definition[0]] = ""; });
    data[activeType].push(record);
    search.value = "";
    saveDraft(); render();
    list.querySelector("input[name=title]").focus();
  }

  function load() {
    if (started) return;
    started = true;
    fetch(DATA_URL, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("Knowledge data could not be loaded.");
      return response.json();
    }).then(function (loaded) {
      repositoryData = normalizeMuscles(clone(loaded));
      var saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try { data = normalizeMuscles(JSON.parse(saved)); setStatus("Browser draft restored.", "draft"); }
        catch (error) { data = clone(repositoryData); localStorage.removeItem(DRAFT_KEY); }
      } else data = clone(repositoryData);
      render();
      if (!saved) setStatus("Knowledge base loaded. Start editing to create a private draft.");
    }).catch(function () { setStatus("The knowledge base could not be loaded. Refresh and try again.", "error"); });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activeType = tab.dataset.knowledgeType;
      tabs.forEach(function (item) { var selected = item === tab; item.classList.toggle("is-active", selected); item.setAttribute("aria-selected", selected ? "true" : "false"); });
      render();
    });
  });
  search.addEventListener("input", render);
  addButton.addEventListener("click", addRecord);
  resetButton.addEventListener("click", function () { localStorage.removeItem(DRAFT_KEY); data = clone(repositoryData); render(); setStatus("Draft discarded. Repository data restored."); });
  publishButton.addEventListener("click", function () {
    publishButton.disabled = true;
    setStatus("Publishing knowledge base...", "working");
    fetch(PUBLISH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish-knowledge-base", content: data }) }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) { if (!response.ok) { var error = new Error(body.error || "publish_failed"); error.details = body.details; throw error; } return body; });
    }).then(function (result) {
      repositoryData = clone(data); localStorage.removeItem(DRAFT_KEY);
      setStatus(result.unchanged ? "Everything is already published." : "Published successfully. Vercel is updating the live admin.", "success");
    }).catch(function (error) {
      var detail = error.details && error.details[0] ? " " + error.details[0] : "";
      setStatus("Knowledge base could not be published." + detail, "error");
    }).finally(function () { publishButton.disabled = false; });
  });

  window.addEventListener("legitbodyfix:admin-authenticated", load);
  if (!document.getElementById("main").hidden) load();
}());
