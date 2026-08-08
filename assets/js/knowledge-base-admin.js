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
  var muscleNavigator = document.getElementById("adminMuscleNavigator");
  var adminMuscleRegions = document.getElementById("adminMuscleRegions");
  var adminMuscleActions = document.getElementById("adminMuscleActions");
  var countNodes = {
    conditions: document.getElementById("conditionCount"),
    muscles: document.getElementById("muscleCount"),
    recipes: document.getElementById("recipeCount")
  };
  var activeType = "conditions";
  var data = { conditions: [], muscles: [], recipes: [] };
  var repositoryData = null;
  var started = false;
  var activeAdminMuscleRegion = "all";
  var activeAdminMuscleAction = "all";
  var adminRegionLabels = {
    all: "All body areas", "head-neck": "Neck", "shoulder-scapula": "Shoulder & Scapula", "elbow-forearm": "Elbow & Forearm",
    "wrist-hand": "Wrist & Hand", "thoracic-spine": "Thoracic Spine", "lumbar-spine": "Lumbar Spine", "pelvis-hip": "Pelvis & Hip", knee: "Knee", "foot-ankle": "Foot & Ankle"
  };
  var adminRoleSections = [
    { region: "head-neck", roles: ["Neck flexor", "Neck extensor", "Neck lateral flexor", "Neck rotator"] },
    { region: "shoulder-scapula", roles: ["Shoulder flexor", "Shoulder extensor", "Shoulder abductor", "Shoulder adductor", "Shoulder internal rotator", "Shoulder external rotator", "Scapular protractor", "Scapular retractor", "Scapular elevator", "Scapular depressor", "Scapular upward rotator", "Scapular downward rotator"] },
    { region: "elbow-forearm", roles: ["Elbow flexor", "Elbow extensor", "Forearm pronator", "Forearm supinator", "Wrist flexor", "Wrist extensor"] },
    { region: "wrist-hand", roles: ["Finger flexor", "Finger extensor", "Finger abductor", "Finger adductor", "Thumb flexor", "Thumb extensor", "Thumb abductor", "Thumb adductor", "Thumb opposer"] },
    { region: "thoracic-spine", roles: ["Trunk extensor", "Trunk rotator", "Trunk lateral flexor", "Inspiratory muscle", "Expiratory muscle"] },
    { region: "lumbar-spine", roles: ["Trunk flexor", "Trunk extensor", "Trunk rotator", "Trunk lateral flexor"] },
    { region: "pelvis-hip", roles: ["Hip flexor", "Hip extensor", "Hip abductor", "Hip adductor", "Hip internal rotator", "Hip external rotator", "Pelvic floor supporter", "Urinary continence muscle", "Fecal continence muscle"] },
    { region: "knee", roles: ["Hip flexor", "Hip extensor", "Hip abductor", "Hip adductor", "Hip internal rotator", "Hip external rotator", "Knee flexor", "Knee extensor", "Knee internal rotator", "Knee external rotator"] },
    { region: "foot-ankle", roles: ["Ankle dorsiflexor", "Ankle plantarflexor", "Foot invertor", "Foot evertor", "Toe flexor", "Toe extensor"] }
  ];

  var schemas = {
    conditions: [
      ["title", "Guide name", 120], ["pathway", "Content pathway", 40], ["postureCategory", "Posture body-area group", 120], ["conditionCategory", "Condition category", 120], ["bodyRegion", "Body region", 120],
      ["joints", "Related joints", 240], ["tags", "Tags", 400],
      ["summary", "Clinical summary", 800, true], ["tightMuscles", "Commonly tight / overactive", 500],
      ["weakMuscles", "Commonly weak / underactive", 500], ["screening", "Screening signs", 600, true],
      ["sourceName", "Clinical reference name", 300], ["sourceUrl", "Clinical reference URL", 800],
      ["relatedVideoIds", "Related session IDs (comma separated)", 500]
    ],
    muscles: [
      ["title", "Muscle name", 120], ["group", "Anatomical group", 160], ["family", "Muscle family", 160], ["origin", "Origin", 800, true],
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

  function adminMuscleRegion(record) {
    var title = String(record.title || "").toLowerCase(), group = String(record.group || "").toLowerCase(), bodyMap = record.bodyMap;
    if (/\b(cervicis|capitis)\b/.test(title) || ["head and neck", "anterior neck", "lateral neck", "suboccipital neck"].indexOf(group) !== -1 || bodyMap === "head-neck") return "head-neck";
    if (["shoulder", "shoulder girdle", "upper back", "chest", "rotator cuff"].indexOf(group) !== -1 || ["shoulder", "chest"].indexOf(bodyMap) !== -1) return "shoulder-scapula";
    if (["upper arm", "forearm"].indexOf(group) !== -1 || ["upper-arm-front", "upper-arm-back", "forearm"].indexOf(bodyMap) !== -1) return "elbow-forearm";
    if (group === "hand") return "wrist-hand";
    if (["thorax", "posterior thorax"].indexOf(group) !== -1 || /thoracis|thoracic|costarum/.test(title)) return "thoracic-spine";
    if (["abdomen", "back", "erector spinae", "deep back"].indexOf(group) !== -1) return "lumbar-spine";
    if (["pelvic diaphragm", "superficial perineum", "deep perineum", "pelvic sphincters", "hip and pelvis", "deep hip", "medial thigh"].indexOf(group) !== -1) return "pelvis-hip";
    if (["anterior thigh", "posterior thigh"].indexOf(group) !== -1 || title === "popliteus") return "knee";
    if (["anterior lower leg", "lateral lower leg", "posterior lower leg", "foot"].indexOf(group) !== -1) return "foot-ankle";
    return "other";
  }

  function adminActionMatches(record, role) {
    if (role === "all") return true;
    var actions = String(record.actions || record.function || "").toLowerCase();
    var words = role.toLowerCase().replace(/ muscle$/, "").split(" ");
    var joint = words[0], movement = words.slice(1).join(" ");
    var aliases = { flexor: /flex(?:es|ion)/, extensor: /extend|extends|extension/, "lateral flexor": /lateral(?:ly)? flex/, abductor: /abduct/, adductor: /adduct/, "internal rotator": /medial(?:ly)? rotat|internal rotation/, "external rotator": /lateral(?:ly)? rotat|external rotation/, "upward rotator": /upward(?:ly)? rotat/, "downward rotator": /downward(?:ly)? rotat/, rotator: /rotat/, protractor: /protract/, retractor: /retract/, elevator: /elevat/, depressor: /depress/, pronator: /pronat/, supinator: /supinat/, dorsiflexor: /dorsiflex/, plantarflexor: /plantarflex/, invertor: /invert|inversion/, evertor: /evert|eversion/, supporter: /support|stabiliz/, continence: /continence|urethr|anal canal|anorectal/, opposer: /oppos/ };
    var pattern = aliases[movement] || aliases[words[words.length - 1]] || new RegExp(movement.replace(/[^a-z ]/g, ""));
    var jointPattern = joint === "neck" ? /neck|head|cervical/ : joint === "trunk" ? /trunk|spine|vertebral|lumbar/ : ["pelvic", "urinary", "fecal"].indexOf(joint) !== -1 ? /pelvic|perine|continence|urethr|anal|anorectal/ : new RegExp(joint);
    return jointPattern.test(actions) && pattern.test(actions);
  }

  function renderAdminMuscleNavigator() {
    if (!muscleNavigator) return;
    muscleNavigator.hidden = activeType !== "muscles";
    if (activeType !== "muscles") return;
    var regions = Object.keys(adminRegionLabels).map(function (region) {
      var count = region === "all" ? data.muscles.length : data.muscles.filter(function (record) { return adminMuscleRegion(record) === region; }).length;
      var button = document.createElement("button");
      button.type = "button"; button.className = activeAdminMuscleRegion === region ? "is-active" : ""; button.textContent = adminRegionLabels[region] + " · " + count;
      button.addEventListener("click", function () { activeAdminMuscleRegion = region; activeAdminMuscleAction = "all"; render(); });
      return button;
    });
    adminMuscleRegions.replaceChildren.apply(adminMuscleRegions, regions);
    var roles = Array.from(new Set(adminRoleSections.filter(function (section) { return activeAdminMuscleRegion === "all" || section.region === activeAdminMuscleRegion; }).flatMap(function (section) { return section.roles; })));
    var all = document.createElement("button"); all.type = "button"; all.className = activeAdminMuscleAction === "all" ? "is-active" : ""; all.textContent = "All movements";
    all.addEventListener("click", function () { activeAdminMuscleAction = "all"; render(); });
    var actions = [all].concat(roles.map(function (role) {
      var button = document.createElement("button"); button.type = "button"; button.className = activeAdminMuscleAction === role ? "is-active" : ""; button.textContent = role.replace(/ muscle$/, "");
      button.addEventListener("click", function () { activeAdminMuscleAction = role; render(); });
      return button;
    }));
    adminMuscleActions.replaceChildren.apply(adminMuscleActions, actions);
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
    renderAdminMuscleNavigator();
    var visible = data[activeType].filter(function (record) {
      if (activeType === "muscles" && activeAdminMuscleRegion !== "all" && adminMuscleRegion(record) !== activeAdminMuscleRegion) return false;
      if (activeType === "muscles" && !adminActionMatches(record, activeAdminMuscleAction)) return false;
      return !query || JSON.stringify(record).toLowerCase().indexOf(query) !== -1;
    });
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
