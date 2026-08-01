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
  var muscleAtlas = document.getElementById("muscleAtlas");
  var atlasGrid = document.getElementById("atlasGrid");
  var knowledgePaths = document.getElementById("knowledgePaths");
  var muscleRegionButtons = Array.from(document.querySelectorAll("[data-muscle-region]"));
  var muscleFunction = document.getElementById("muscleFunction");
  var muscleSort = document.getElementById("muscleSort");
  var muscleReset = document.getElementById("muscleReset");
  var activeType = "all";
  var activeMuscleRegion = "all";
  var activeMuscleFunction = "all";
  var data = { conditions: [], muscles: [], recipes: [] };
  var videos = [];

  var muscleRegions = {
    "head-neck": { title: "Neck", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1117_Muscles_of_the_Back.png", imageAlt: "OpenStax anatomy plate of the neck and upper back", credit: "OpenStax College · CC BY 3.0", creditUrl: "https://commons.wikimedia.org/wiki/File:1117_Muscles_of_the_Back.png" },
    "shoulder-chest": { title: "Shoulder & chest", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Arm_shoulder_gray.png", imageAlt: "Gray's Anatomy plate of shoulder and chest muscles", credit: "Gray's Anatomy · public domain", creditUrl: "https://commons.wikimedia.org/wiki/File:Arm_shoulder_gray.png" },
    "arm-hand": { title: "Arm & hand", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1120_Muscles_that_Move_the_Forearm.jpg", imageAlt: "OpenStax anatomy plate of arm and forearm muscles", credit: "OpenStax · CC BY 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:1120_Muscles_that_Move_the_Forearm.jpg" },
    "trunk-back": { title: "Trunk & back", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Gray398.png", imageAlt: "Gray's Anatomy plate of muscles of the torso", credit: "Gray's Anatomy, plate 398 · public domain", creditUrl: "https://commons.wikimedia.org/wiki/File:Gray398.png" },
    "pelvic-floor": { title: "Pelvic floor", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1115_Muscles_of_the_Pelvic_Floor.jpg", imageAlt: "OpenStax superior view of the pelvic floor muscles", credit: "OpenStax · CC BY 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:1115_Muscles_of_the_Pelvic_Floor.jpg" },
    "hip-thigh": { title: "Hip & thigh", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1918_edition_of_Gray%27s_Anatomy_of_the_Human_Body%2C_fig_430.png", imageAlt: "Gray's Anatomy plate of the iliac and anterior femoral muscles", credit: "Gray's Anatomy, figure 430 · public domain", creditUrl: "https://commons.wikimedia.org/wiki/File:1918_edition_of_Gray%27s_Anatomy_of_the_Human_Body%2C_fig_430.png" },
    "lower-leg": { title: "Lower leg", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/LowerLimbMuscles.jpg", imageAlt: "Historical anatomical plate of lower-leg muscles", credit: "Adrien Charpy, 1894 · public domain", creditUrl: "https://commons.wikimedia.org/wiki/File:LowerLimbMuscles.jpg" },
    foot: { title: "Foot", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1124_Intrinsic_Muscles_of_the_Foot_c.png", imageAlt: "OpenStax plantar view of intrinsic foot muscles", credit: "OpenStax College · CC BY 3.0", creditUrl: "https://commons.wikimedia.org/wiki/File:1124_Intrinsic_Muscles_of_the_Foot_c.png" }
  };
  var muscleGroupOrder = [
    "Head and neck", "Anterior neck", "Lateral neck", "Suboccipital neck", "Shoulder girdle", "Chest", "Upper back", "Shoulder", "Rotator cuff",
    "Upper arm", "Forearm", "Hand", "Thorax", "Posterior thorax", "Abdomen", "Back", "Erector spinae", "Deep back",
    "Pelvic diaphragm", "Superficial perineum", "Deep perineum", "Pelvic sphincters",
    "Hip and pelvis", "Deep hip", "Anterior thigh", "Medial thigh", "Posterior thigh",
    "Anterior lower leg", "Lateral lower leg", "Posterior lower leg", "Foot"
  ];

  var labels = { conditions: "Movement pattern", muscles: "Muscle dictionary", recipes: "Correction recipe" };
  var summaries = {
    conditions: function (item) { return item.summary || item.screening || "Explore this movement pattern."; },
    muscles: function (item) { return item.actions || item.function || "Explore this muscle's role in movement."; },
    recipes: function (item) { return item.goal || "Use a focused sequence, then reassess before progressing."; }
  };
  var fields = {
    conditions: [["joints", "Areas involved"], ["tags", "Common associations"], ["tightMuscles", "Often overactive or restricted"], ["weakMuscles", "Often underactive"], ["screening", "Movement screen"]],
    muscles: [["group", "Body region"], ["origin", "Origin"], ["insertion", "Insertion"], ["actions", "Functions and actions"]],
    recipes: [["bodyRegion", "Body area"], ["goal", "Goal"], ["whenToUse", "A useful starting point when"], ["equipment", "What you may need"], ["steps", "Starting sequence"], ["dosage", "Suggested dose"], ["reassess", "Reassess before progressing"], ["regression", "Make it easier"], ["progression", "Make it harder"], ["cautions", "Stop and get help when"], ["relatedConditions", "Related movement patterns"]]
  };

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function openAnatomyViewer(item) {
    var dialog = document.getElementById("anatomyViewer");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "anatomyViewer";
      dialog.className = "anatomy-viewer";
      var panel = element("div", "anatomy-viewer-panel");
      var close = element("button", "anatomy-viewer-close", "Close");
      close.type = "button";
      close.addEventListener("click", function () { dialog.close(); });
      var image = document.createElement("img");
      image.className = "anatomy-viewer-image";
      var copy = element("div", "anatomy-viewer-copy");
      copy.append(element("p", "detail-kicker", "Anatomy plate"), element("h3", "anatomy-viewer-title"), element("p", "anatomy-viewer-note"));
      panel.append(close, image, copy);
      dialog.appendChild(panel);
      dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
      document.body.appendChild(dialog);
    }
    dialog.querySelector(".anatomy-viewer-image").src = item.imageUrl;
    dialog.querySelector(".anatomy-viewer-image").alt = item.imageAlt || (item.title + " anatomy illustration");
    dialog.querySelector(".anatomy-viewer-title").textContent = item.title;
    dialog.querySelector(".anatomy-viewer-note").textContent = (item.imageAlt || "Anatomical reference plate") + ". The plate may include nearby structures for orientation.";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
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
    if (["head and neck", "anterior neck", "lateral neck", "suboccipital neck"].indexOf(group) !== -1) return "head-neck";
    if (["shoulder", "shoulder girdle", "upper back", "chest", "rotator cuff"].indexOf(group) !== -1) return "shoulder-chest";
    if (["upper arm", "forearm", "hand"].indexOf(group) !== -1) return "arm-hand";
    if (["abdomen", "back", "erector spinae", "deep back", "thorax", "posterior thorax"].indexOf(group) !== -1) return "trunk-back";
    if (["pelvic diaphragm", "superficial perineum", "deep perineum", "pelvic sphincters"].indexOf(group) !== -1) return "pelvic-floor";
    if (["hip and pelvis", "deep hip", "anterior thigh", "medial thigh", "posterior thigh"].indexOf(group) !== -1) return "hip-thigh";
    if (["anterior lower leg", "lateral lower leg", "posterior lower leg"].indexOf(group) !== -1) return "lower-leg";
    if (group === "foot") return "foot";
    if (bodyMap === "head-neck") return "head-neck";
    if (["shoulder", "chest"].indexOf(bodyMap) !== -1) return "shoulder-chest";
    if (["upper-arm-front", "upper-arm-back", "forearm"].indexOf(bodyMap) !== -1) return "arm-hand";
    if (["abdomen", "back"].indexOf(bodyMap) !== -1) return "trunk-back";
    if (["hip-front", "hip-back", "thigh-front", "thigh-back"].indexOf(bodyMap) !== -1) return "hip-thigh";
    if (["lower-leg-front", "lower-leg-back"].indexOf(bodyMap) !== -1) return "lower-leg";
    if (bodyMap === "foot") return "foot";
    return "other";
  }

  function muscleFunctionalRoles(item) {
    if (!item) return [];
    var actions = String(item.actions || item.function || "").toLowerCase();
    var region = muscleRegion(item);
    var roles = [];
    function add(label, pattern) {
      if (pattern.test(actions)) roles.push(label);
    }
    if (region === "head-neck") {
      add("Neck flexor", /bilaterally flexes the neck|^flexes and laterally flexes the neck|^flexes (?:and stabilizes )?the cervical spine|^flexes the head|neck flexion/);
      add("Neck extensor", /extends? the (?:head and )?neck|neck extension|extends? the head/);
      add("Neck lateral flexor", /laterally flexes? (?:the head|the neck|the cervical vertebral column|it|to the)/);
      add("Neck rotator", /rotates? (?:and [^.;]+ )?(?:the head|the atlas)|rotates? or laterally flexes it|neck rotation/);
    }
    if (region === "shoulder-chest") {
      add("Shoulder internal rotator", /medial(?:ly)? rotat(?:es|ion)|internal rotation/);
      add("Shoulder external rotator", /lateral(?:ly)? rotat(?:es|ion)|external rotation/);
    }
    add("Shoulder flexor", /shoulder flexion|flexes? (?:and adducts? )?the arm at the shoulder|anterior fibers assist flexion/);
    add("Shoulder extensor", /shoulder extension|extends?(?:, [^.;]+)* the arm|posterior fibers assist extension/);
    add("Shoulder abductor", /abducts? the arm|arm abduction/);
    add("Shoulder adductor", /adducts?(?:, [^.;]+)* the arm|shoulder adduction/);
    add("Scapular protractor", /protracts? the scapula/);
    add("Scapular retractor", /retracts? (?:and [^.;]+ )?the scapula|scapular retraction/);
    add("Scapular elevator", /elevates? (?:and [^.;]+ )?the scapula|scapular elevation/);
    add("Scapular depressor", /depresses? (?:and [^.;]+ )?the scapula|scapular depression/);
    add("Scapular upward rotator", /upward(?:ly)? rotat(?:es|ion)/);
    add("Scapular downward rotator", /downward(?:ly)? rotat(?:es|ion)/);
    add("Elbow flexor", /flexes? the elbow|elbow flexor|elbow flexion/);
    add("Elbow extensor", /extends? the elbow|elbow extension/);
    add("Forearm pronator", /pronates? the forearm/);
    add("Forearm supinator", /supinates? the forearm/);
    add("Wrist flexor", /flexes? (?:and [^.;]+ )?(?:the hand at )?the wrist|wrist flexion/);
    add("Wrist extensor", /extends? (?:and [^.;]+ )?(?:the hand at )?the wrist|wrist extension/);
    if (region === "arm-hand") {
      add("Finger flexor", /flex(?:es|ion) (?:the )?(?:little )?finger|flexes? the (?:proximal|distal) interphalangeal|flexes? [^.;]*fingers|flex the metacarpophalangeal|finger flexion/);
      add("Finger extensor", /extends? (?:the )?(?:little|index)? ?finger|extends? digits|extending the interphalangeal|finger extension/);
      add("Finger abductor", /abducts? (?:the )?(?:little finger|digits?)/);
      add("Finger adductor", /adducts? (?:the )?(?:fingers?|digits?)/);
      add("Thumb flexor", /flexes? the thumb/);
      add("Thumb extensor", /extends? the thumb/);
      add("Thumb abductor", /abducts? (?:and [^.;]+ )?the thumb/);
      add("Thumb adductor", /adducts? the thumb/);
      add("Thumb opposer", /opposes? the thumb|assists? opposition/);
    }
    add("Trunk flexor", /flexes? (?:and [^.;]+ )?(?:the |lumbar )?trunk|trunk flexion/);
    add("Trunk extensor", /extends? (?:and [^.;]+ )?(?:the |lumbar )?trunk|extends? [^.;]*(?:vertebral column|spine)|trunk extension/);
    add("Trunk rotator", /rotates? the trunk|trunk rotation/);
    add("Trunk lateral flexor", /laterally flexes? (?:the |lumbar )?trunk|lateral trunk flexion/);
    add("Inspiratory muscle", /inspiration|elevates? (?:the )?(?:first|second|upper)? ?ribs?|expansion of the thoracic cavity/);
    add("Expiratory muscle", /expiration|depresses? (?:the )?(?:lower )?ribs?/);
    if (region === "hip-thigh") {
      add("Hip flexor", /flexes? the (?:hip|thigh)|hip flexion|assists? flexion|^flexes,/);
      add("Hip extensor", /extends? the (?:hip|thigh)|hip extension|assists? extension/);
      add("Hip internal rotator", /medial(?:ly)? rotat(?:es|ion).*(?:hip|thigh)|anterior fibers assist medial rotation|hip flexion and medial rotation|medial rotation at the hip/);
      add("Hip external rotator", /lateral(?:ly)? rotat(?:es|ion).*(?:hip|thigh)|external rotation/);
      add("Hip abductor", /abducts?(?:, [^.;]+)* (?:the )?(?:hip|thigh)|hip abduction/);
      add("Hip adductor", /adducts?(?:, [^.;]+)* (?:the )?(?:hip|thigh)|assists? adduction of the thigh|hip adduction/);
    }
    add("Knee flexor", /flexes? (?:and [^.;]+ )?(?:the )?knee|knee flexion/);
    add("Knee extensor", /extends? (?:the leg at )?the knee|extends? the knee|knee extension/);
    add("Knee internal rotator", /medial(?:ly)? rotat(?:es|ing) the (?:flexed )?(?:knee|leg|tibia)/);
    add("Knee external rotator", /lateral(?:ly)? rotat(?:es|ing) the (?:flexed )?(?:knee|leg|tibia)/);
    if (region === "lower-leg" || region === "foot") {
      add("Ankle dorsiflexor", /dorsiflex(?:es|ion)/);
      add("Ankle plantarflexor", /plantarflex(?:es|ion)/);
      add("Foot invertor", /inverts? the foot|foot inversion|assists? inversion/);
      add("Foot evertor", /everts? (?:and [^.;]+ )?the foot|foot eversion/);
      add("Toe flexor", /flex(?:es|ing) (?:the )?(?:great|little|lateral four|toes?)/);
      add("Toe extensor", /extends? (?:the )?(?:great|little|lateral four|toes?|digits?)|extension of toes/);
    }
    if (region === "pelvic-floor") {
      add("Pelvic floor supporter", /supports? (?:and elevates? )?(?:the )?pelvic|pelvic support|supports? the central pelvic outlet|stabilizes? the perineal body/);
      add("Urinary continence muscle", /urinary continence|compresses? the urethra|constricts? the urethral/);
      add("Fecal continence muscle", /fecal continence|closes? the anal canal|anorectal angle/);
    }
    return roles;
  }

  function createFunctionalRoleList(item, className) {
    var roles = muscleFunctionalRoles(item);
    if (!roles.length) return null;
    var list = element("span", className || "muscle-role-list");
    roles.forEach(function (role) { list.appendChild(element("span", "muscle-role", role)); });
    return list;
  }

  function selectType(type) {
    activeType = type;
    filterButtons.forEach(function (candidate) {
      var selected = candidate.dataset.knowledgeFilter === type;
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    });
    muscleTools.hidden = type !== "muscles";
    muscleAtlas.hidden = type !== "muscles";
    render();
  }

  function renderAtlas() {
    var cards = Object.keys(muscleRegions).map(function (region) {
      var meta = muscleRegions[region];
      var count = data.muscles.filter(function (item) { return item && item.published !== false && muscleRegion(item) === region; }).length;
      var card = element("button", "atlas-card");
      card.type = "button";
      var image = document.createElement("img");
      image.src = meta.imageUrl; image.alt = meta.imageAlt; image.loading = "lazy"; image.decoding = "async";
      var copy = element("span", "atlas-card-copy");
      copy.append(element("b", "", meta.title), element("small", "", count + (count === 1 ? " muscle" : " muscles")), element("span", "", "Browse region →"));
      card.append(image, copy);
      card.addEventListener("click", function () {
        activeMuscleRegion = region;
        muscleRegionButtons.forEach(function (candidate) {
          var selected = candidate.dataset.muscleRegion === region;
          candidate.classList.toggle("is-active", selected);
          candidate.setAttribute("aria-pressed", String(selected));
        });
        updateFunctionOptions();
        render();
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return card;
    });
    atlasGrid.replaceChildren.apply(atlasGrid, cards);
  }

  function updateMuscleCounts() {
    var muscles = data.muscles.filter(function (item) { return item && item.published !== false; });
    document.querySelectorAll("[data-region-count]").forEach(function (node) {
      var region = node.dataset.regionCount;
      var count = region === "all" ? muscles.length : muscles.filter(function (item) { return muscleRegion(item) === region; }).length;
      node.textContent = String(count);
    });
  }

  function updateTypeCounts() {
    document.querySelectorAll("[data-type-count]").forEach(function (node) {
      var type = node.dataset.typeCount;
      var count = data[type].filter(function (item) { return item && item.published !== false; }).length;
      node.textContent = count + (count === 1 ? " guide" : " guides");
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
    if (type === "muscles") {
      var detailRoles = createFunctionalRoleList(item, "muscle-role-list detail-muscle-roles");
      if (detailRoles) facts.appendChild(detailRoles);
    }
    if (type === "muscles" && typeof item.imageUrl === "string" && /^https:\/\//i.test(item.imageUrl)) {
      var figure = element("figure", "detail-anatomy-image");
      var anatomyButton = element("button", "anatomy-zoom-button");
      anatomyButton.type = "button";
      anatomyButton.setAttribute("aria-label", "Enlarge anatomy plate for " + item.title);
      var anatomyImage = document.createElement("img");
      anatomyImage.src = item.imageUrl;
      anatomyImage.alt = item.imageAlt || (item.title + " anatomy illustration");
      anatomyImage.loading = "eager";
      anatomyImage.decoding = "async";
      anatomyButton.append(anatomyImage, element("span", "anatomy-zoom-label", "Enlarge plate"));
      anatomyButton.addEventListener("click", function () { openAnatomyViewer(item); });
      figure.appendChild(anatomyButton);
      if (item.imageCredit) {
        var caption = document.createElement("figcaption");
        if (typeof item.imageCreditUrl === "string" && /^https:\/\//i.test(item.imageCreditUrl)) {
          var creditLink = document.createElement("a");
          creditLink.href = item.imageCreditUrl;
          creditLink.target = "_blank";
          creditLink.rel = "noopener noreferrer";
          creditLink.textContent = item.imageCredit;
          caption.append("Plate context: " + (item.group || "body region") + ". Image: ", creditLink);
        } else caption.textContent = "Plate context: " + (item.group || "body region") + ". Image: " + item.imageCredit;
        caption.append(". This plate may show nearby muscles; use the listed attachments and actions to identify the selected muscle.");
        figure.appendChild(caption);
      }
      facts.appendChild(figure);
    } else if (type === "muscles") {
      var region = muscleRegions[muscleRegion(item)];
      if (region) {
        var regionalFigure = element("figure", "detail-anatomy-image is-regional");
        var regionalImage = document.createElement("img");
        regionalImage.src = region.imageUrl;
        regionalImage.alt = region.imageAlt;
        regionalImage.loading = "eager";
        var regionalCaption = document.createElement("figcaption");
        var regionalCredit = document.createElement("a");
        regionalCredit.href = region.creditUrl;
        regionalCredit.target = "_blank";
        regionalCredit.rel = "noopener noreferrer";
        regionalCredit.textContent = region.credit;
        regionalCaption.append("Regional anatomy reference · ", regionalCredit);
        regionalFigure.append(regionalImage, regionalCaption);
        facts.appendChild(regionalFigure);
      }
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
      var relatedHeadingCopy = element("div", "related-heading-copy");
      relatedHeadingCopy.append(element("p", "detail-kicker", type === "muscles" ? "Train this area" : "Put it into practice"), element("h3", "", type === "muscles" ? "Related programs" : "Related guided sessions"));
      relatedHeading.appendChild(relatedHeadingCopy);
      if (type === "muscles") relatedHeading.appendChild(element("p", "related-program-context", "Programs selected for the movement roles and body region described in this muscle guide."));
      var relatedGrid = element("div", "related-session-grid");
      relatedVideos.forEach(function (video) {
        var card = element("a", "related-session-card");
        if (type === "muscles") card.classList.add("is-program-match");
        card.href = "video.html?id=" + encodeURIComponent(video.id);
        var copy = element("div", "related-session-copy");
        copy.append(element("span", "", (type === "muscles" ? "Related program · " : "") + String(video.durationMinutes || "") + " min · " + (video.level || "Session")), element("h4", "", video.title || "Movement session"), element("p", "", video.description || "Follow this focused guided session."), element("b", "", type === "muscles" ? "Explore this program →" : "View session →"));
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
      media.append(image, element("span", "knowledge-card-media-label", (record.item.group || "Anatomy") + " plate"));
      card.appendChild(media);
    } else if (record.type === "muscles") {
      var map = createBodyMap(record.item, true);
      if (map) { card.classList.add("has-media"); card.appendChild(map); }
    }
    if (record.type === "muscles") {
      var roles = createFunctionalRoleList(record.item);
      if (roles) card.appendChild(roles);
    }
    if (record.type === "recipes") {
      card.classList.add("is-recipe");
      var recipeMeta = element("span", "recipe-card-meta");
      recipeMeta.append(element("b", "", record.item.bodyRegion || "Whole body"), element("i", "", record.item.time || "10–15 min"));
      card.appendChild(recipeMeta);
    }
    card.append(element("span", "knowledge-card-type", labels[record.type]), element("h3", "", record.item.title), element("p", "", summaries[record.type](record.item)), element("span", "knowledge-card-link", record.type === "recipes" ? "Open the recipe →" : "Read the guide →"));
    card.addEventListener("click", function () { openDetail(record.type, record.item); });
    return card;
  }

  function updateFunctionOptions() {
    var availableMuscles = data.muscles.filter(function (item) {
      return item && item.published !== false && (activeMuscleRegion === "all" || muscleRegion(item) === activeMuscleRegion);
    });
    Array.from(muscleFunction.options).forEach(function (option) {
      if (!option.dataset.baseLabel) option.dataset.baseLabel = option.textContent;
      var count = option.value === "all"
        ? availableMuscles.length
        : availableMuscles.filter(function (item) { return muscleFunctionalRoles(item).indexOf(option.value) !== -1; }).length;
      option.textContent = option.dataset.baseLabel + " (" + count + ")";
      option.disabled = option.value !== "all" && count === 0;
    });
    var selectedOption = muscleFunction.options[muscleFunction.selectedIndex];
    if (selectedOption && selectedOption.disabled) {
      activeMuscleFunction = "all";
      muscleFunction.value = "all";
    }
  }

  function renderMuscleGroups(records) {
    var regionOrder = Object.keys(muscleRegions);
    var visibleRegions = activeMuscleRegion === "all" ? regionOrder : [activeMuscleRegion];
    var sections = visibleRegions.map(function (region) {
      var regionRecords = records.filter(function (record) { return muscleRegion(record.item) === region; });
      if (!regionRecords.length) return null;
      var meta = muscleRegions[region] || { title: "Other muscles" };
      var section = element("section", "muscle-region-section");
      section.setAttribute("aria-labelledby", "muscle-region-" + region);
      var heading = element("header", "muscle-region-heading");
      var title = element("h3", "", meta.title);
      title.id = "muscle-region-" + region;
      heading.append(title, element("span", "", regionRecords.length + (regionRecords.length === 1 ? " muscle" : " muscles")));
      var subgroups = element("div", "muscle-subgroups");
      var groupNames = Array.from(new Set(regionRecords.map(function (record) { return record.item.group || "Other"; })));
      groupNames.sort(function (a, b) {
        var aIndex = muscleGroupOrder.indexOf(a);
        var bIndex = muscleGroupOrder.indexOf(b);
        if (aIndex === -1) aIndex = muscleGroupOrder.length;
        if (bIndex === -1) bIndex = muscleGroupOrder.length;
        return aIndex === bIndex ? a.localeCompare(b) : aIndex - bIndex;
      });
      groupNames.forEach(function (groupName) {
        var groupRecords = regionRecords.filter(function (record) { return (record.item.group || "Other") === groupName; });
        var subgroup = element("section", "muscle-subgroup");
        var subgroupHeading = element("div", "muscle-subgroup-heading");
        subgroupHeading.append(element("h4", "", groupName), element("span", "", String(groupRecords.length)));
        var regionGrid = element("div", "muscle-region-grid");
        regionGrid.replaceChildren.apply(regionGrid, groupRecords.map(createCard));
        subgroup.append(subgroupHeading, regionGrid);
        subgroups.appendChild(subgroup);
      });
      section.append(heading, subgroups);
      return section;
    }).filter(Boolean);
    grid.replaceChildren.apply(grid, sections);
  }

  function renderRecipeGroups(records) {
    var regionOrder = ["Neck & shoulders", "Trunk & breathing", "Hip & pelvis", "Knee", "Ankle & foot", "Whole body"];
    var regions = Array.from(new Set(records.map(function (record) { return record.item.bodyRegion || "Whole body"; })));
    regions.sort(function (a, b) {
      var aIndex = regionOrder.indexOf(a), bIndex = regionOrder.indexOf(b);
      if (aIndex === -1) aIndex = regionOrder.length;
      if (bIndex === -1) bIndex = regionOrder.length;
      return aIndex === bIndex ? a.localeCompare(b) : aIndex - bIndex;
    });
    var sections = regions.map(function (region) {
      var regionRecords = records.filter(function (record) { return (record.item.bodyRegion || "Whole body") === region; });
      var section = element("section", "recipe-region-section");
      var heading = element("header", "recipe-region-heading");
      heading.append(element("h3", "", region), element("span", "", regionRecords.length + (regionRecords.length === 1 ? " recipe" : " recipes")));
      var recipeGrid = element("div", "recipe-region-grid");
      recipeGrid.replaceChildren.apply(recipeGrid, regionRecords.map(createCard));
      section.append(heading, recipeGrid);
      return section;
    });
    grid.replaceChildren.apply(grid, sections);
  }

  function render() {
    var query = search.value.trim().toLowerCase();
    knowledgePaths.hidden = activeType !== "all" || Boolean(query);
    var records = allItems().filter(function (record) {
      if (activeType !== "all" && record.type !== activeType) return false;
      if (activeType === "muscles" && activeMuscleRegion !== "all" && muscleRegion(record.item) !== activeMuscleRegion) return false;
      if (activeType === "muscles" && activeMuscleFunction !== "all" && muscleFunctionalRoles(record.item).indexOf(activeMuscleFunction) === -1) return false;
      if (!query) return true;
      var fieldMatch = Object.values(record.item).some(function (value) { return typeof value === "string" && value.toLowerCase().includes(query); });
      var roleQuery = query.endsWith("s") ? query.slice(0, -1) : query;
      var roleMatch = record.type === "muscles" && muscleFunctionalRoles(record.item).some(function (role) { return role.toLowerCase().includes(query) || role.toLowerCase().includes(roleQuery); });
      return fieldMatch || roleMatch;
    });
    var groupMuscles = activeType === "muscles" && muscleSort.value === "body" && !query;
    var groupRecipes = activeType === "recipes" && !query;
    if (activeType === "muscles" && muscleSort.value === "alpha") {
      records.sort(function (a, b) { return String(a.item.title || "").localeCompare(String(b.item.title || "")); });
    }
    if (activeType === "all" && !query) {
      grid.replaceChildren();
      grid.hidden = true;
      grid.classList.remove("is-grouped");
      grid.setAttribute("aria-busy", "false");
      status.textContent = "Choose a collection above, or search across all resources.";
      return;
    }
    grid.hidden = false;
    grid.classList.toggle("is-grouped", (groupMuscles || groupRecipes) && Boolean(records.length));
    if (!records.length) grid.replaceChildren(element("p", "knowledge-empty", "No published resources match that search yet."));
    else if (groupMuscles) renderMuscleGroups(records);
    else if (groupRecipes) renderRecipeGroups(records);
    else grid.replaceChildren.apply(grid, records.map(createCard));
    grid.setAttribute("aria-busy", "false");
    status.textContent = activeType === "muscles"
      ? records.length + (records.length === 1 ? " muscle" : " muscles") + (activeMuscleFunction === "all" ? (activeMuscleRegion === "all" ? " across 8 body regions" : " in this body region") : " matching " + activeMuscleFunction.toLowerCase())
      : activeType === "recipes"
        ? records.length + (records.length === 1 ? " correction recipe" : " correction recipes") + " grouped by body area"
        : records.length + (records.length === 1 ? " movement guide" : " movement guides");
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
      selectType(button.dataset.knowledgeFilter);
    });
  });
  Array.from(document.querySelectorAll("[data-knowledge-path]")).forEach(function (button) {
    button.addEventListener("click", function () { selectType(button.dataset.knowledgePath); });
  });
  muscleRegionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeMuscleRegion = button.dataset.muscleRegion;
      muscleRegionButtons.forEach(function (candidate) { var selected = candidate === button; candidate.classList.toggle("is-active", selected); candidate.setAttribute("aria-pressed", String(selected)); });
      updateFunctionOptions();
      render();
    });
  });
  muscleFunction.addEventListener("change", function () {
    activeMuscleFunction = muscleFunction.value;
    render();
  });
  muscleSort.addEventListener("change", render);
  muscleReset.addEventListener("click", function () {
    activeMuscleRegion = "all";
    activeMuscleFunction = "all";
    muscleFunction.value = "all";
    muscleSort.value = "body";
    search.value = "";
    muscleRegionButtons.forEach(function (candidate) {
      var selected = candidate.dataset.muscleRegion === "all";
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    });
    updateFunctionOptions();
    render();
  });
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
      updateFunctionOptions();
      updateTypeCounts();
      renderAtlas();
      render();
      openFromUrl();
    })
    .catch(function () { status.textContent = "The movement guides are temporarily unavailable."; status.setAttribute("role", "alert"); grid.setAttribute("aria-busy", "false"); });
})();
