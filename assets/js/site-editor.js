(function () {
  "use strict";

  var DATA_URL = "assets/data/site-content.json";
  var DRAFT_KEY = "legitbodyfix.siteContentDraft.v2";
  var PREVIEW_KEY = "legitbodyfix.siteContentPreview.v2";
  var PUBLISH_URL = "/api/admin/videos";
  var CORE_ORDER = ["hero", "method", "library", "knowledge", "standard", "pricing"];
  var CUSTOM_LABELS = { hero: "Campaign hero", split: "Text and image", benefits: "Benefits grid", testimonials: "Testimonials", faq: "FAQ", cta: "Call to action" };
  var ITEM_LIMITS = { benefits: 6, testimonials: 4, faq: 8 };
  var started = false;
  var content = null;
  var form = document.getElementById("siteContentForm");
  var status = document.getElementById("siteContentStatus");
  var publishButton = document.getElementById("publishSiteContent");
  var previewDialog = document.getElementById("sitePreviewDialog");
  var previewShell = previewDialog && previewDialog.querySelector(".site-preview-shell");
  var previewFrame = document.getElementById("sitePreviewFrame");
  var livePreviewFrame = document.getElementById("siteEditorLiveFrame");
  var previewDeviceButtons = previewDialog ? previewDialog.querySelectorAll("[data-preview-device]") : [];
  var previewReturnFocus = null;
  var selectedSectionId = "hero";
  var inspectorTitle = document.getElementById("siteInspectorTitle");
  var inspectorHint = document.getElementById("siteInspectorHint");
  var canvasStage = document.querySelector(".site-editor-canvas-stage");
  var canvasDeviceButtons = document.querySelectorAll("[data-canvas-device]");
  var saveState = document.getElementById("siteEditorSaveState");
  var undoButton = document.getElementById("undoSiteContent");
  var redoButton = document.getElementById("redoSiteContent");
  var insertMenu = document.getElementById("siteInsertMenu");
  var history = [];
  var historyIndex = -1;
  var publishedSignature = "";
  var lastHistoryKey = "";
  var lastHistoryTime = 0;
  var insertionAfterId = "";
  var selectedTemplateType = "hero";
  var TEMPLATE_HINTS = {
    hero: "Best for launches, announcements, and featured programs.",
    split: "Best when an image helps explain your message.",
    benefits: "Best for summarizing three concrete reasons to buy.",
    testimonials: "Best when you have approved customer proof.",
    faq: "Best for resolving common objections before checkout.",
    cta: "Best for closing the page with one focused action."
  };

  var CORE_DEFINITIONS = {
    hero: { title: "Hero", description: "The first message, actions, proof points, and optional feature image.", fields: [
      ["hero.kicker", "Kicker", 80], ["hero.titleLines.0", "Title line 1", 24], ["hero.titleLines.1", "Title line 2", 24],
      ["hero.titleLines.2", "Outlined title line 3", 24], ["hero.titleLines.3", "Outlined title line 4", 24],
      ["hero.description", "Description", 320, "textarea"], ["hero.primaryButton", "Primary button", 40], ["hero.primaryHref", "Primary destination", 500, "link"],
      ["hero.secondaryButton", "Secondary button", 40], ["hero.secondaryHref", "Secondary destination", 500, "link"],
      ["hero.proofPoints.0", "Proof point 1", 60], ["hero.proofPoints.1", "Proof point 2", 60], ["hero.proofPoints.2", "Proof point 3", 60],
      ["hero.imageUrl", "Feature image URL (optional)", 500, "image"], ["hero.imageAlt", "Feature image description", 160]
    ]},
    method: { title: "Method", description: "The four-step explanation of the LegitBodyFix approach.", fields: [
      ["method.label", "Section label", 80], ["method.titleLines.0", "Title line 1", 40], ["method.titleLines.1", "Title line 2", 40],
      ["method.intro", "Introduction", 360, "textarea"], ["method.steps.0.title", "Step 1 title", 50], ["method.steps.0.description", "Step 1 description", 220, "textarea"],
      ["method.steps.1.title", "Step 2 title", 50], ["method.steps.1.description", "Step 2 description", 220, "textarea"],
      ["method.steps.2.title", "Step 3 title", 50], ["method.steps.2.description", "Step 3 description", 220, "textarea"],
      ["method.steps.3.title", "Step 4 title", 50], ["method.steps.3.description", "Step 4 description", 220, "textarea"]
    ]},
    library: { title: "Library preview", description: "The public preview above the live product cards.", fields: [
      ["library.label", "Section label", 80], ["library.titleLines.0", "Title line 1", 40], ["library.titleLines.1", "Title line 2", 40],
      ["library.intro", "Introduction", 320, "textarea"], ["library.linkLabel", "Link label", 40], ["library.linkHref", "Link destination", 500, "link"]
    ]},
    knowledge: { title: "Movement guides preview", description: "Free education that builds trust and guides visitors toward the most relevant paid program.", fields: [
      ["knowledge.label", "Section label", 80], ["knowledge.titleLines.0", "Title line 1", 40], ["knowledge.titleLines.1", "Title line 2", 40],
      ["knowledge.intro", "Introduction", 320, "textarea"], ["knowledge.linkLabel", "Link label", 40], ["knowledge.linkHref", "Link destination", 500, "link"]
    ]},
    standard: { title: "Brand statement", description: "A short statement that separates the library and pricing sections.", fields: [
      ["standard.quote", "Statement", 280, "textarea"], ["standard.attribution", "Attribution", 80]
    ]},
    pricing: { title: "Program and pricing", description: "Public package copy. The server-owned PayPal amount remains protected.", fields: [
      ["pricing.label", "Section label", 80], ["pricing.titleLines.0", "Title line 1", 40], ["pricing.titleLines.1", "Title line 2", 40],
      ["pricing.benefits.0", "Benefit 1", 100], ["pricing.benefits.1", "Benefit 2", 100], ["pricing.benefits.2", "Benefit 3", 100], ["pricing.benefits.3", "Benefit 4", 100],
      ["pricing.programName", "Program name", 100], ["pricing.displayPrice", "Displayed price", 20], ["pricing.priceSuffix", "Price suffix", 30],
      ["pricing.description", "Program description", 280, "textarea"], ["pricing.buttonLabel", "Button label", 40], ["pricing.buttonHref", "Button destination", 500, "link"]
    ]}
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function readPath(source, path) {
    return path.split(".").reduce(function (value, key) { return value != null ? value[key] : undefined; }, source);
  }

  function writePath(source, path, value) {
    var keys = path.split(".");
    var target = source;
    keys.slice(0, -1).forEach(function (key) { target = target[key]; });
    target[keys[keys.length - 1]] = value;
  }

  function setStatus(message, state) {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function signature(value) { return JSON.stringify(value || {}); }

  function updateSaveState(state, label) {
    if (!saveState) return;
    saveState.dataset.state = state;
    saveState.querySelector("span").textContent = label;
  }

  function updateHistoryControls() {
    undoButton.disabled = historyIndex <= 0;
    redoButton.disabled = historyIndex < 0 || historyIndex >= history.length - 1;
    var dirty = content && signature(content) !== publishedSignature;
    publishButton.disabled = !content || !dirty;
    updateSaveState(dirty ? "draft" : "live", dirty ? "Draft saved" : "Live version");
  }

  function seedHistory() {
    history = [clone(content)]; historyIndex = 0; lastHistoryKey = ""; lastHistoryTime = 0; updateHistoryControls();
  }

  function recordHistory(key) {
    var now = Date.now();
    if (key && key === lastHistoryKey && now - lastHistoryTime < 900 && historyIndex >= 0) history[historyIndex] = clone(content);
    else {
      history = history.slice(0, historyIndex + 1);
      history.push(clone(content));
      if (history.length > 80) history.shift();
      historyIndex = history.length - 1;
    }
    lastHistoryKey = key || ""; lastHistoryTime = now; updateHistoryControls();
  }

  function restoreHistory(nextIndex) {
    if (nextIndex < 0 || nextIndex >= history.length) return;
    historyIndex = nextIndex; content = clone(history[historyIndex]); lastHistoryKey = "";
    localStorage.setItem(DRAFT_KEY, JSON.stringify(content)); localStorage.setItem(PREVIEW_KEY, JSON.stringify(content));
    render(); updateOpenPreview(); sendContentToFrame(livePreviewFrame); window.setTimeout(enableInlineEditing, 50);
    updateHistoryControls(); setStatus(historyIndex < history.length - 1 ? "Change undone. Your draft remains private." : "Change restored. Your draft remains private.");
  }

  function saveDraft(message, historyKey) {
    recordHistory(historyKey);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(content));
    updateOpenPreview();
    sendContentToFrame(livePreviewFrame);
    window.setTimeout(enableInlineEditing, 50);
    setStatus(message || "Complete site draft saved in this browser.");
  }

  function saveInlineDraft(path) {
    recordHistory("inline:" + path);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(content));
    updateOpenPreview();
    setStatus("Draft saved while you edit.");
  }

  function sectionForPath(path) {
    if (!path) return "hero";
    var root = path.split(".")[0];
    if (CORE_DEFINITIONS[root]) return root;
    if (root === "footer") return "footer";
    if (root === "customSections") {
      var customIndex = Number(path.split(".")[1]);
      return content.customSections[customIndex] ? content.customSections[customIndex].id : "design";
    }
    return "design";
  }

  function selectInspectorSection(id, path) {
    selectedSectionId = id || "design";
    form.querySelectorAll(".site-editor-card").forEach(function (card) {
      var cardId = card.dataset.sectionId || (card.id === "site-editor-design" ? "design" : card.id === "site-editor-footer" ? "footer" : "");
      card.hidden = cardId !== selectedSectionId;
      card.classList.toggle("is-previewing", cardId === selectedSectionId);
    });
    var definition = CORE_DEFINITIONS[selectedSectionId];
    var customDefinition = content.customSections.find(function (section) { return section.id === selectedSectionId; });
    inspectorTitle.textContent = definition ? definition.title : selectedSectionId === "footer" ? "Footer" : selectedSectionId === "design" ? "Page settings" : customDefinition ? CUSTOM_LABELS[customDefinition.type] : "Section settings";
    inspectorHint.textContent = path ? "Editing “" + path + "”. Advanced controls are below." : "Adjust this section without leaving the canvas.";
    var active = path && form.querySelector('[data-site-field="' + path + '"]');
    if (active) {
      var details = active.closest("details");
      if (details) details.open = true;
      form.querySelectorAll(".is-inline-active").forEach(function (element) { element.classList.remove("is-inline-active"); });
      active.classList.add("is-inline-active");
    }
  }

  function openInsertMenu(afterId) {
    insertionAfterId = afterId || selectedSectionId;
    insertMenu.hidden = false;
    insertMenu.querySelector("[data-insert-site-section]").focus();
  }

  function closeInsertMenu() { insertMenu.hidden = true; insertionAfterId = ""; }

  function enableInlineEditing() {
    if (!livePreviewFrame || !livePreviewFrame.contentDocument) return;
    var previewDocument = livePreviewFrame.contentDocument;
    var style = previewDocument.getElementById("legitbodyfixVisualEditorStyles");
    if (!style) {
      style = previewDocument.createElement("style");
      style.id = "legitbodyfixVisualEditorStyles";
      style.textContent = '[data-content]{cursor:text;outline:1px dashed transparent;outline-offset:4px;border-radius:2px}[data-content]:hover{outline-color:#087b78;background:rgba(203,255,50,.2)}[data-content]:focus{outline:3px solid #cbff32;background:#fff;color:#111}[data-site-section],[data-page-section-id]{position:relative}[data-site-section]:hover,[data-page-section-id]:hover{box-shadow:inset 0 0 0 2px rgba(8,123,120,.55)}.lbf-media-edit-button{position:absolute;z-index:20;right:14px;top:14px;min-height:36px;padding:8px 12px;border:1px solid #111;background:#cbff32;color:#111;font:700 11px Arial,sans-serif;box-shadow:3px 3px 0 #111;cursor:pointer}.lbf-media-edit-button:hover{background:#fff}.lbf-insert-section{position:absolute;z-index:25;left:50%;bottom:-17px;transform:translateX(-50%);min-height:34px;padding:7px 12px;border:1px solid #111;border-radius:999px;background:#111;color:#fff;font:700 10px Arial,sans-serif;box-shadow:0 0 0 3px #cbff32;cursor:pointer;opacity:0;transition:opacity .15s}.lbf-insert-section:focus,[data-site-section]:hover>.lbf-insert-section{opacity:1}';
      previewDocument.head.appendChild(style);
    }
    previewDocument.querySelectorAll("[data-content]").forEach(function (element) {
      if (element.dataset.visualEditorBound === "true") return;
      element.dataset.visualEditorBound = "true";
      element.setAttribute("contenteditable", "plaintext-only");
      element.setAttribute("spellcheck", "true");
      element.addEventListener("click", function (event) {
        event.preventDefault(); event.stopPropagation();
        selectInspectorSection(sectionForPath(element.dataset.content), element.dataset.content);
      });
      element.addEventListener("input", function () {
        var path = element.dataset.content;
        writePath(content, path, element.textContent.trim());
        var control = form.querySelector('[data-site-field="' + path + '"]');
        if (control) control.value = element.textContent.trim();
        saveInlineDraft(path);
      });
      element.addEventListener("blur", function () { sendContentToFrame(livePreviewFrame); window.setTimeout(enableInlineEditing, 50); });
      element.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && element.tagName !== "P") { event.preventDefault(); element.blur(); }
      });
    });
    previewDocument.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", function (event) { event.preventDefault(); }); });
    var selectors = { hero: ".hero", method: "#method", library: "#library-preview", knowledge: "#knowledge-preview", standard: ".standard", pricing: "#pricing" };
    Object.keys(selectors).forEach(function (id) {
      var section = previewDocument.querySelector(selectors[id]);
      if (section && section.dataset.visualSectionBound !== "true") {
        section.dataset.visualSectionBound = "true";
        section.addEventListener("click", function () { selectInspectorSection(id); });
      }
    });
    content.customSections.forEach(function (section) {
      var customSection = previewDocument.querySelector('[data-site-section="' + section.id + '"]');
      if (customSection && customSection.dataset.visualSectionBound !== "true") {
        customSection.dataset.visualSectionBound = "true";
        customSection.addEventListener("click", function () { selectInspectorSection(section.id); });
      }
    });
    function mediaButton(container, sectionId, fieldPath) {
      if (!container || container.querySelector(".lbf-media-edit-button")) return;
      var button = previewDocument.createElement("button");
      button.type = "button"; button.className = "lbf-media-edit-button"; button.textContent = "Replace image";
      button.addEventListener("click", function (event) {
        event.preventDefault(); event.stopPropagation(); selectInspectorSection(sectionId, fieldPath);
        var fieldControl = form.querySelector('[data-site-field="' + fieldPath + '"]'); if (fieldControl) fieldControl.focus();
      });
      container.appendChild(button);
    }
    mediaButton(previewDocument.querySelector(".hero"), "hero", "hero.imageUrl");
    content.customSections.forEach(function (section, index) {
      if (section.type === "split") mediaButton(previewDocument.querySelector('[data-site-section="' + section.id + '"] .site-block-media'), section.id, "customSections." + index + ".imageUrl");
    });
    content.layout.filter(function (entry) { return entry.visible !== false; }).forEach(function (entry) {
      var target = entry.kind === "core" ? previewDocument.querySelector(selectors[entry.id]) : previewDocument.querySelector('[data-site-section="' + entry.id + '"]');
      if (!target || target.querySelector(":scope > .lbf-insert-section")) return;
      var insert = previewDocument.createElement("button"); insert.type = "button"; insert.className = "lbf-insert-section"; insert.textContent = "+ Add section after";
      insert.addEventListener("click", function (event) { event.preventDefault(); event.stopPropagation(); openInsertMenu(entry.id); });
      target.appendChild(insert);
    });
  }

  function sendContentToFrame(frame) {
    if (!frame || !frame.contentWindow || !content) return;
    frame.contentWindow.postMessage({ type: "legitbodyfix:site-preview", content: clone(content) }, window.location.origin);
  }

  function sendPreviewContent() {
    sendContentToFrame(previewFrame);
  }

  function updateOpenPreview() {
    if (!previewDialog || previewDialog.hidden || !content) return;
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(content));
    sendPreviewContent();
  }

  function setPreviewDevice(device) {
    if (!previewShell || ["desktop", "tablet", "mobile"].indexOf(device) === -1) return;
    previewShell.dataset.previewDevice = device;
    previewDeviceButtons.forEach(function (button) {
      var active = button.dataset.previewDevice === device;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function refreshPreview() {
    if (!previewFrame || !content) return;
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(content));
    previewFrame.src = "index.html?site-preview=1&refresh=" + Date.now();
  }

  function openPreview() {
    if (!previewDialog || !content || !form.reportValidity()) return;
    previewReturnFocus = document.activeElement;
    previewDialog.hidden = false;
    document.body.classList.add("preview-open");
    setPreviewDevice(previewShell.dataset.previewDevice || "desktop");
    refreshPreview();
    document.getElementById("closeSitePreview").focus();
    setStatus("Private responsive preview opened. Changes update as you edit.", "success");
  }

  function closePreview() {
    if (!previewDialog || previewDialog.hidden) return;
    previewDialog.hidden = true;
    document.body.classList.remove("preview-open");
    if (previewReturnFocus && typeof previewReturnFocus.focus === "function") previewReturnFocus.focus();
  }

  function makeId(type) {
    return type + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function templateSection(type) {
    var section = {
      id: makeId(type), type: type, theme: "paper", eyebrow: "LEGITBODYFIX",
      title: "A clear reason to keep moving.", body: "Add concise, useful copy that helps visitors understand the value of your program.",
      buttonLabel: "Explore programs", buttonHref: "#pricing", imageUrl: "", imageAlt: "", items: []
    };
    if (type === "hero") { section.title = "BUILD YOUR NEXT CAMPAIGN."; section.body = "Use this focused hero for a launch, announcement, or featured movement program."; }
    if (type === "split") { section.title = "SHOW THE WORK."; section.body = "Pair an approved image with a focused story, result, or explanation."; }
    if (type === "benefits") { section.title = "WHY THIS WORKS."; section.body = ""; section.buttonLabel = ""; section.buttonHref = ""; section.items = [
      { title: "Clear sequence", body: "Follow each session in a deliberate order." },
      { title: "Focused practice", body: "Work on one movement goal at a time." },
      { title: "Repeatable progress", body: "Return whenever your movement needs attention." }
    ]; }
    if (type === "testimonials") { section.title = "WHAT PEOPLE NOTICE."; section.body = ""; section.buttonLabel = ""; section.buttonHref = ""; section.items = [
      { title: "Verified customer", body: "Add a short, specific result you have permission to publish." }
    ]; }
    if (type === "faq") { section.title = "QUESTIONS, ANSWERED."; section.body = ""; section.buttonLabel = ""; section.buttonHref = ""; section.items = [
      { title: "How long do I keep access?", body: "Access terms are shown clearly at checkout." },
      { title: "Do I need equipment?", body: "Each session lists the equipment you need." }
    ]; }
    if (type === "cta") { section.theme = "lime"; section.title = "READY TO MOVE WITH INTENT?"; section.body = "Choose your program and start with the first guided session."; section.buttonLabel = "Choose a program"; }
    return section;
  }

  function normalize(source) {
    var next = clone(source || {});
    next.version = 2;
    next.settings = next.settings || { theme: "lime", density: "spacious" };
    next.navigation = next.navigation || { method: "Method", library: "Library", myLibrary: "My library", programs: "Programs", howItWorks: "How it works", browsePrograms: "Browse programs" };
    next.customSections = Array.isArray(next.customSections) ? next.customSections : [];
    next.layout = Array.isArray(next.layout) && next.layout.length ? next.layout : CORE_ORDER.map(function (id) { return { id: id, kind: "core", visible: true }; });
    next.hero.primaryHref = next.hero.primaryHref || "#pricing";
    next.hero.secondaryHref = next.hero.secondaryHref || "#library-preview";
    next.hero.imageUrl = next.hero.imageUrl || "";
    next.hero.imageAlt = next.hero.imageAlt || "Corrective movement body map showing shoulder, hip, and knee focus areas";
    next.library.linkHref = next.library.linkHref || "#pricing";
    next.pricing.buttonHref = next.pricing.buttonHref || "checkout.html";
    return next;
  }

  function field(path, labelText, maximum, kind, required) {
    var label = document.createElement("label");
    label.className = "field" + (kind === "textarea" || kind === "image" ? " field-wide" : "");
    var name = document.createElement("span");
    name.textContent = labelText;
    var input = document.createElement(kind === "textarea" ? "textarea" : "input");
    if (kind === "textarea") input.rows = 3;
    else input.type = kind === "image" ? "url" : "text";
    input.maxLength = maximum;
    input.required = required !== false && kind !== "image";
    input.value = String(readPath(content, path) || "");
    input.dataset.siteField = path;
    if (kind === "link") input.placeholder = "#section or page.html";
    if (kind === "image") input.placeholder = "https://… or assets/image.jpg";
    input.addEventListener("input", function () { writePath(content, path, input.value); saveDraft(null, "field:" + path); });
    label.append(name, input);
    if (kind === "link" || kind === "image") {
      var hint = document.createElement("small");
      hint.className = "field-hint";
      hint.textContent = kind === "link" ? "Internal paths, page anchors, and HTTPS links only." : "HTTPS images or images already stored in assets/.";
      label.appendChild(hint);
    }
    return label;
  }

  function selectField(labelText, value, options, onChange) {
    var label = document.createElement("label");
    label.className = "field";
    var name = document.createElement("span");
    name.textContent = labelText;
    var select = document.createElement("select");
    options.forEach(function (option) {
      var item = document.createElement("option"); item.value = option.value; item.textContent = option.label; select.appendChild(item);
    });
    select.value = value;
    select.addEventListener("change", function () { onChange(select.value); saveDraft(); });
    label.append(name, select);
    return label;
  }

  function cardHeader(titleText, description, entry, index, isCustom) {
    var header = document.createElement("header");
    header.className = "site-editor-card-header";
    var copy = document.createElement("div");
    var eyebrow = document.createElement("span"); eyebrow.className = "module-chip"; eyebrow.textContent = String(index + 1).padStart(2, "0") + " / " + (isCustom ? "ADDED" : "CORE");
    var title = document.createElement("h3"); title.textContent = titleText;
    var note = document.createElement("p"); note.textContent = description;
    copy.append(eyebrow, title, note);
    var controls = document.createElement("div"); controls.className = "site-editor-card-actions";
    var view = document.createElement("button"); view.type = "button"; view.className = "button button-quiet site-section-view"; view.textContent = "View";
    view.addEventListener("click", function () {
      if (!livePreviewFrame) return;
      var targets = { hero: ".hero", method: "#method", library: "#library-preview", knowledge: "#knowledge-preview", standard: ".standard", pricing: "#pricing" };
      try {
        var previewDocument = livePreviewFrame.contentDocument;
        var target = previewDocument && previewDocument.querySelector(targets[entry.id] || '[data-page-section-id="' + entry.id + '"]');
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (error) {}
      document.querySelectorAll(".site-editor-card.is-previewing").forEach(function (card) { card.classList.remove("is-previewing"); });
      var card = header.closest(".site-editor-card"); if (card) card.classList.add("is-previewing");
    });
    var visible = document.createElement("label"); visible.className = "toggle-field";
    var checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = entry.visible !== false;
    var visibleText = document.createElement("span"); visibleText.textContent = "Visible";
    checkbox.addEventListener("change", function () { entry.visible = checkbox.checked; saveDraft(checkbox.checked ? "Section will be visible after publishing." : "Section hidden from the public page."); });
    visible.append(checkbox, visibleText);
    var up = document.createElement("button"); up.type = "button"; up.className = "icon-button"; up.textContent = "↑"; up.setAttribute("aria-label", "Move section up"); up.disabled = index === 0;
    var down = document.createElement("button"); down.type = "button"; down.className = "icon-button"; down.textContent = "↓"; down.setAttribute("aria-label", "Move section down"); down.disabled = index === content.layout.length - 1;
    up.addEventListener("click", function () { content.layout.splice(index - 1, 0, content.layout.splice(index, 1)[0]); render(); saveDraft("Section order updated."); });
    down.addEventListener("click", function () { content.layout.splice(index + 1, 0, content.layout.splice(index, 1)[0]); render(); saveDraft("Section order updated."); });
    controls.append(view, visible, up, down);
    if (isCustom) {
      var duplicate = document.createElement("button"); duplicate.type = "button"; duplicate.className = "icon-button"; duplicate.textContent = "Duplicate";
      var remove = document.createElement("button"); remove.type = "button"; remove.className = "icon-button danger"; remove.textContent = "Remove";
      duplicate.addEventListener("click", function () {
        var original = content.customSections.find(function (section) { return section.id === entry.id; });
        var copySection = clone(original); copySection.id = makeId(copySection.type); copySection.title += " (copy)";
        content.customSections.push(copySection); content.layout.splice(index + 1, 0, { id: copySection.id, kind: "custom", visible: true });
        render(); saveDraft("Section duplicated.");
      });
      remove.addEventListener("click", function () {
        content.customSections = content.customSections.filter(function (section) { return section.id !== entry.id; });
        content.layout.splice(index, 1); render(); saveDraft("Section removed from the draft.");
      });
      controls.append(duplicate, remove);
    }
    header.append(copy, controls);
    return header;
  }

  function itemEditor(section, item, itemIndex) {
    var box = document.createElement("div"); box.className = "site-editor-item field-wide";
    var heading = document.createElement("div"); heading.className = "site-editor-item-heading";
    var title = document.createElement("strong"); title.textContent = (section.type === "faq" ? "Question " : "Item ") + (itemIndex + 1);
    var remove = document.createElement("button"); remove.type = "button"; remove.className = "text-danger"; remove.textContent = "Remove item";
    var minimum = section.type === "benefits" ? 2 : 1; remove.disabled = section.items.length <= minimum;
    remove.addEventListener("click", function () { section.items.splice(itemIndex, 1); render(); saveDraft("Item removed."); });
    heading.append(title, remove);
    var grid = document.createElement("div"); grid.className = "content-field-grid";
    function itemField(labelText, property, textarea) {
      var label = document.createElement("label"); label.className = "field" + (textarea ? " field-wide" : "");
      var span = document.createElement("span"); span.textContent = labelText;
      var input = document.createElement(textarea ? "textarea" : "input"); if (textarea) input.rows = 3; else input.type = "text";
      input.maxLength = textarea ? 500 : 100; input.required = true; input.value = item[property] || "";
      input.addEventListener("input", function () { item[property] = input.value; saveDraft(null, "item:" + itemIndex + ":" + property); });
      label.append(span, input); return label;
    }
    grid.append(itemField(section.type === "testimonials" ? "Attribution" : section.type === "faq" ? "Question" : "Title", "title", false), itemField(section.type === "testimonials" ? "Quote" : section.type === "faq" ? "Answer" : "Description", "body", true));
    box.append(heading, grid); return box;
  }

  function customFields(section) {
    var grid = document.createElement("div"); grid.className = "content-field-grid";
    var sectionPath = "customSections." + content.customSections.indexOf(section);
    function customField(labelText, property, maximum, kind, required) {
      var label = document.createElement("label"); label.className = "field" + (kind === "textarea" || kind === "image" ? " field-wide" : "");
      var name = document.createElement("span"); name.textContent = labelText;
      var input = document.createElement(kind === "textarea" ? "textarea" : "input");
      if (kind === "textarea") input.rows = 4; else input.type = kind === "image" ? "url" : "text";
      input.value = section[property] || ""; input.maxLength = maximum; input.required = required === true;
      input.dataset.siteField = sectionPath + "." + property;
      input.addEventListener("input", function () { section[property] = input.value; saveDraft(null, sectionPath + "." + property); });
      label.append(name, input); return label;
    }
    grid.append(selectField("Color theme", section.theme, [{ value: "paper", label: "Paper" }, { value: "ink", label: "Ink" }, { value: "lime", label: "Lime" }], function (value) { section.theme = value; }), customField("Eyebrow", "eyebrow", 80, "text", false), customField("Headline", "title", 140, "text", true));
    if (["benefits", "testimonials", "faq"].indexOf(section.type) === -1) grid.appendChild(customField("Body copy", "body", 700, "textarea", true));
    if (section.type === "split") grid.append(customField("Image URL", "imageUrl", 500, "image", false), customField("Image description", "imageAlt", 160, "text", false));
    if (["hero", "split", "cta"].indexOf(section.type) !== -1) grid.append(customField("Button label", "buttonLabel", 50, "text", section.type !== "split"), customField("Button destination", "buttonHref", 500, "text", section.type !== "split"));
    if (ITEM_LIMITS[section.type]) {
      section.items.forEach(function (item, index) { grid.appendChild(itemEditor(section, item, index)); });
      var add = document.createElement("button"); add.type = "button"; add.className = "button field-wide"; add.textContent = "+ Add item"; add.disabled = section.items.length >= ITEM_LIMITS[section.type];
      add.addEventListener("click", function () { section.items.push({ title: section.type === "faq" ? "New question" : "New item", body: "Add the supporting details here." }); render(); saveDraft("Item added."); });
      grid.appendChild(add);
    }
    return grid;
  }

  function renderSettings() {
    var card = document.createElement("article"); card.className = "site-editor-card site-editor-settings";
    card.id = "site-editor-design";
    var header = document.createElement("header"); header.className = "site-editor-card-header";
    var copy = document.createElement("div"); var chip = document.createElement("span"); chip.className = "module-chip"; chip.textContent = "GLOBAL";
    var title = document.createElement("h3"); title.textContent = "Design and navigation";
    var note = document.createElement("p"); note.textContent = "Choose a controlled visual preset and edit the labels visitors use to move around the site.";
    copy.append(chip, title, note); header.appendChild(copy);
    var grid = document.createElement("div"); grid.className = "content-field-grid";
    grid.append(selectField("Accent preset", content.settings.theme, [{ value: "lime", label: "Signature lime" }, { value: "teal", label: "Movement teal" }, { value: "mono", label: "Monochrome" }], function (value) { content.settings.theme = value; }), selectField("Section spacing", content.settings.density, [{ value: "spacious", label: "Spacious" }, { value: "compact", label: "Compact" }], function (value) { content.settings.density = value; }));
    [["navigation.method", "Method label"], ["navigation.library", "Library label"], ["navigation.myLibrary", "My library label"], ["navigation.programs", "Programs label"], ["navigation.howItWorks", "How it works label"], ["navigation.browsePrograms", "Header button"]].forEach(function (definition) { grid.appendChild(field(definition[0], definition[1], 40, "text")); });
    card.append(header, grid); form.appendChild(card);
  }

  function renderCore(entry, index) {
    var definition = CORE_DEFINITIONS[entry.id];
    var card = document.createElement("article"); card.className = "site-editor-card"; card.dataset.sectionId = entry.id;
    card.appendChild(cardHeader(definition.title, definition.description, entry, index, false));
    var details = document.createElement("details"); details.className = "site-editor-fields"; details.open = index === 0;
    var summary = document.createElement("summary"); summary.textContent = "Edit section content";
    var grid = document.createElement("div"); grid.className = "content-field-grid";
    definition.fields.forEach(function (definitionField) { grid.appendChild(field(definitionField[0], definitionField[1], definitionField[2], definitionField[3] || "text", definitionField[3] !== "image")); });
    details.append(summary, grid); card.appendChild(details); form.appendChild(card);
  }

  function renderCustom(entry, index) {
    var section = content.customSections.find(function (candidate) { return candidate.id === entry.id; });
    if (!section) return;
    var card = document.createElement("article"); card.className = "site-editor-card site-editor-custom"; card.dataset.sectionId = entry.id;
    card.appendChild(cardHeader(CUSTOM_LABELS[section.type], "Added section: " + (section.title || "Untitled"), entry, index, true));
    var details = document.createElement("details"); details.className = "site-editor-fields"; details.open = true;
    var summary = document.createElement("summary"); summary.textContent = "Edit added section";
    details.append(summary, customFields(section)); card.appendChild(details); form.appendChild(card);
  }

  function renderFooter() {
    var card = document.createElement("article"); card.className = "site-editor-card";
    card.id = "site-editor-footer";
    var header = document.createElement("header"); header.className = "site-editor-card-header";
    var copy = document.createElement("div"); var chip = document.createElement("span"); chip.className = "module-chip"; chip.textContent = "FOOTER";
    var title = document.createElement("h3"); title.textContent = "Footer"; var note = document.createElement("p"); note.textContent = "Closing brand and legal copy shown on every homepage visit.";
    copy.append(chip, title, note); header.appendChild(copy);
    var grid = document.createElement("div"); grid.className = "content-field-grid"; grid.append(field("footer.tagline", "Tagline", 100, "text"), field("footer.legal", "Legal note", 220, "textarea"));
    card.append(header, grid); form.appendChild(card);
  }

  function render() {
    if (!CORE_DEFINITIONS[selectedSectionId] && ["design", "footer"].indexOf(selectedSectionId) === -1 && !content.customSections.some(function (section) { return section.id === selectedSectionId; })) selectedSectionId = "hero";
    form.replaceChildren();
    renderSettings();
    var sectionMarker = document.createElement("div");
    sectionMarker.className = "site-editor-divider";
    sectionMarker.id = "site-editor-sections";
    var sectionLabel = document.createElement("span"); sectionLabel.className = "module-chip"; sectionLabel.textContent = "PAGE FLOW";
    var sectionTitle = document.createElement("strong"); sectionTitle.textContent = "Homepage sections";
    sectionMarker.append(sectionLabel, sectionTitle);
    form.appendChild(sectionMarker);
    content.layout.forEach(function (entry, index) {
      if (entry.kind === "core" && CORE_DEFINITIONS[entry.id]) renderCore(entry, index);
      else if (entry.kind === "custom") renderCustom(entry, index);
    });
    renderFooter();
    sendContentToFrame(livePreviewFrame);
    selectInspectorSection(selectedSectionId);
  }

  function fetchContent() {
    return fetch(DATA_URL, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("Unable to load website content");
      return response.json();
    });
  }

  function requestJson(options) {
    return fetch(PUBLISH_URL, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var error = new Error(data.error || "Request failed"); error.status = response.status; error.code = data.error; error.details = data.details || []; throw error;
        }
        return data;
      });
    });
  }

  function load() {
    var draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        content = normalize(JSON.parse(draft)); render(); seedHistory(); updateSaveState("draft", "Draft restored"); setStatus("Complete site draft restored from this browser.");
        fetchContent().then(function (live) { publishedSignature = signature(normalize(live)); updateHistoryControls(); });
        return;
      }
      catch (error) { localStorage.removeItem(DRAFT_KEY); }
    }
    fetchContent().then(function (live) { content = normalize(live); publishedSignature = signature(content); render(); seedHistory(); setStatus("Live website loaded. Edit any section or add a new one."); })
      .catch(function () { setStatus("The website editor could not load. Refresh and try again.", "error"); });
  }

  function bindActions() {
    function addSection(type, afterId) {
      if (!content) return;
      if (content.customSections.length >= 20) { setStatus("The editor supports up to 20 added sections.", "error"); return; }
      var section = templateSection(type);
      content.customSections.push(section);
      var newEntry = { id: section.id, kind: "custom", visible: true };
      var insertionIndex = afterId ? content.layout.findIndex(function (entry) { return entry.id === afterId; }) : -1;
      if (insertionIndex >= 0) content.layout.splice(insertionIndex + 1, 0, newEntry);
      else content.layout.push(newEntry);
      selectedSectionId = section.id; closeInsertMenu();
      render(); saveDraft("New section added to the complete site draft.");
      var card = form.querySelector('[data-section-id="' + section.id + '"]'); if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function selectTemplate(type) {
      if (!CUSTOM_LABELS[type]) return;
      selectedTemplateType = type;
      document.querySelectorAll("[data-select-site-section]").forEach(function (button) {
        var selected = button.dataset.selectSiteSection === type;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
        var state = button.querySelector("em");
        if (state) state.textContent = selected ? "Selected" : "Select";
      });
      document.getElementById("selectedSiteSectionLabel").textContent = CUSTOM_LABELS[type];
      document.getElementById("selectedSiteSectionHint").textContent = TEMPLATE_HINTS[type];
      document.getElementById("addSiteSection").firstChild.textContent = "Add " + CUSTOM_LABELS[type] + " ";
    }
    document.getElementById("addSiteSection").addEventListener("click", function () { addSection(selectedTemplateType); });
    document.querySelectorAll("[data-select-site-section]").forEach(function (button) {
      button.addEventListener("click", function () {
        selectTemplate(button.dataset.selectSiteSection);
      });
    });
    document.querySelectorAll("[data-insert-site-section]").forEach(function (button) {
      button.addEventListener("click", function () { addSection(button.dataset.insertSiteSection, insertionAfterId); });
    });
    document.getElementById("closeSiteInsertMenu").addEventListener("click", closeInsertMenu);
    undoButton.addEventListener("click", function () { restoreHistory(historyIndex - 1); });
    redoButton.addEventListener("click", function () { restoreHistory(historyIndex + 1); });
    document.addEventListener("keydown", function (event) {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      if (event.key.toLowerCase() === "z") { event.preventDefault(); restoreHistory(historyIndex + (event.shiftKey ? 1 : -1)); }
      else if (event.key.toLowerCase() === "y") { event.preventDefault(); restoreHistory(historyIndex + 1); }
    });
    document.getElementById("resetSiteContent").addEventListener("click", function () {
      localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(PREVIEW_KEY); setStatus("Reloading the live website…");
      fetchContent().then(function (live) { content = normalize(live); publishedSignature = signature(content); render(); seedHistory(); setStatus("Draft cleared. Live website restored.", "success"); })
        .catch(function () { setStatus("The live website could not be reloaded.", "error"); });
    });
    document.getElementById("previewSiteContent").addEventListener("click", openPreview);
    if (livePreviewFrame) {
      livePreviewFrame.src = "index.html?site-preview=1&inline=1";
      livePreviewFrame.addEventListener("load", function () { sendContentToFrame(livePreviewFrame); window.setTimeout(enableInlineEditing, 120); });
      document.getElementById("expandSitePreview").addEventListener("click", openPreview);
      canvasDeviceButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          canvasStage.dataset.canvasDevice = button.dataset.canvasDevice;
          canvasDeviceButtons.forEach(function (candidate) {
            var active = candidate === button; candidate.classList.toggle("is-active", active); candidate.setAttribute("aria-pressed", active ? "true" : "false");
          });
        });
      });
    }
    if (previewDialog) {
      document.getElementById("closeSitePreview").addEventListener("click", closePreview);
      document.getElementById("refreshSitePreview").addEventListener("click", refreshPreview);
      previewDeviceButtons.forEach(function (button) {
        button.addEventListener("click", function () { setPreviewDevice(button.dataset.previewDevice); });
      });
      previewFrame.addEventListener("load", sendPreviewContent);
      previewDialog.addEventListener("click", function (event) { if (event.target === previewDialog) closePreview(); });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !previewDialog.hidden) closePreview();
      });
    }
    publishButton.addEventListener("click", function () {
      if (!content || !form.reportValidity()) return;
      publishButton.disabled = true; updateSaveState("publishing", "Publishing"); setStatus("Publishing the complete website…");
      requestJson({ method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ action: "publish-site-content", content: content }) })
        .then(function (data) {
          localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(PREVIEW_KEY);
          publishedSignature = signature(content); seedHistory();
          if (data.unchanged) { setStatus("The live website already uses this version.", "success"); return; }
          setStatus("Published as commit " + (data.commitSha ? data.commitSha.slice(0, 7) : "created") + ". Vercel is updating the live website.", "success");
        }).catch(function (error) {
          if (error.status === 401) setStatus("Your admin session expired. Sign in again; the draft is still safe.", "error");
          else if (error.code === "publishing_disabled_in_preview") setStatus("Publishing is disabled on Preview deployments. Use the production admin page.", "error");
          else if (error.code === "invalid_site_content") setStatus(error.details[0] || "Correct the invalid field and try again.", "error");
          else setStatus("Publishing failed. Your browser draft is still safe.", "error");
        }).finally(updateHistoryControls);
    });
  }

  window.LegitSiteEditor = {
    start: function () {
      if (started || !form || !status || !publishButton) return;
      started = true; bindActions(); load();
    }
  };
})();
