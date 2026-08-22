(function () {
  "use strict";

  var DATA_URL = "assets/data/page-sections.json";
  var DRAFT_KEY = "legitbodyfix.pageSectionsDraft.v1";
  var PREVIEW_KEY = "legitbodyfix.pageSectionsPreview.v1";
  var PUBLISH_URL = "/api/admin/videos";
  var list = document.getElementById("pageSectionsList");
  var template = document.getElementById("pageSectionEditorTemplate");
  var status = document.getElementById("pageSectionsStatus");
  var count = document.getElementById("pageSectionCount");
  var publishButton = document.getElementById("publishPageSections");
  if (!list || !template || !status || !count || !publishButton) return;

  var sections = [];
  var LABELS = {
    hero: "Campaign hero",
    split: "Text and image",
    benefits: "Benefits grid",
    testimonials: "Testimonials",
    faq: "Frequently asked questions",
    cta: "Call to action"
  };
  var ITEM_LIMITS = { benefits: 6, testimonials: 4, faq: 8 };

  function setStatus(message, state) {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function makeId(type) {
    return type + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function templateSection(type) {
    var base = {
      id: makeId(type), type: type, theme: "paper", visible: true,
      eyebrow: "LEGITBODYFIX", title: "A clear reason to keep moving.",
      body: "Add concise, useful copy that helps visitors understand the value of your program.",
      buttonLabel: "Explore programs", buttonHref: "#pricing", imageUrl: "", items: []
    };
    if (type === "hero") {
      base.title = "BUILD YOUR NEXT CAMPAIGN.";
      base.body = "Use this focused hero for a launch, announcement, or featured movement program.";
    } else if (type === "split") {
      base.title = "SHOW THE WORK.";
      base.body = "Pair an approved image with a focused story, result, or explanation.";
    } else if (type === "benefits") {
      base.title = "WHY THIS WORKS.";
      base.body = "";
      base.buttonLabel = ""; base.buttonHref = "";
      base.items = [
        { title: "Clear sequence", body: "Follow each session in a deliberate order." },
        { title: "Focused practice", body: "Work on one movement goal at a time." },
        { title: "Repeatable progress", body: "Return to the sessions whenever you need them." }
      ];
    } else if (type === "testimonials") {
      base.title = "WHAT PEOPLE NOTICE.";
      base.body = "";
      base.buttonLabel = ""; base.buttonHref = "";
      base.items = [
        { title: "Verified customer", body: "Add a short, specific customer result here." },
        { title: "Verified customer", body: "Use only testimonials you have permission to publish." }
      ];
    } else if (type === "faq") {
      base.title = "QUESTIONS, ANSWERED.";
      base.body = "";
      base.buttonLabel = ""; base.buttonHref = "";
      base.items = [
        { title: "How long do I keep access?", body: "Access terms are shown clearly at checkout." },
        { title: "Do I need equipment?", body: "Each session lists the equipment you need before you begin." },
        { title: "Is this medical treatment?", body: "No. LegitBodyFix provides educational movement content." }
      ];
    } else if (type === "cta") {
      base.theme = "lime";
      base.title = "READY TO MOVE WITH INTENT?";
      base.body = "Choose your program and start with the first guided session.";
      base.buttonLabel = "Choose a program";
    }
    return base;
  }

  function normalize(section, index) {
    var type = LABELS[section && section.type] ? section.type : "hero";
    var fallback = templateSection(type);
    return {
      id: typeof section.id === "string" && section.id ? section.id : makeId(type + "-" + index),
      type: type,
      theme: ["paper", "ink", "lime"].indexOf(section.theme) !== -1 ? section.theme : fallback.theme,
      visible: section.visible !== false,
      eyebrow: typeof section.eyebrow === "string" ? section.eyebrow : fallback.eyebrow,
      title: typeof section.title === "string" ? section.title : fallback.title,
      body: typeof section.body === "string" ? section.body : fallback.body,
      buttonLabel: typeof section.buttonLabel === "string" ? section.buttonLabel : fallback.buttonLabel,
      buttonHref: typeof section.buttonHref === "string" ? section.buttonHref : fallback.buttonHref,
      imageUrl: typeof section.imageUrl === "string" ? section.imageUrl : "",
      items: Array.isArray(section.items) ? section.items.map(function (item) {
        return { title: typeof item.title === "string" ? item.title : "", body: typeof item.body === "string" ? item.body : "" };
      }) : fallback.items
    };
  }

  function saveDraft(message) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, sections: sections }));
    setStatus(message || "Layout draft saved in this browser.");
  }

  function field(labelText, value, options, onInput) {
    options = options || {};
    var label = document.createElement("label");
    label.className = "field" + (options.wide ? " field-wide" : "");
    var labelName = document.createElement("span");
    labelName.textContent = labelText;
    var input;
    if (options.select) {
      input = document.createElement("select");
      options.select.forEach(function (option) {
        var item = document.createElement("option");
        item.value = option.value;
        item.textContent = option.label;
        input.appendChild(item);
      });
    } else if (options.textarea) {
      input = document.createElement("textarea");
      input.rows = options.rows || 4;
    } else {
      input = document.createElement("input");
      input.type = options.type || "text";
    }
    input.value = value || "";
    if (options.maxLength) input.maxLength = options.maxLength;
    input.required = Boolean(options.required);
    if (options.placeholder) input.placeholder = options.placeholder;
    input.addEventListener("input", function () { onInput(input.value); });
    input.addEventListener("change", function () { onInput(input.value); });
    label.append(labelName, input);
    if (options.hint) {
      var hint = document.createElement("span");
      hint.className = "field-hint";
      hint.textContent = options.hint;
      label.appendChild(hint);
    }
    return label;
  }

  function itemEditor(section, index, onChange) {
    var item = section.items[index];
    var wrapper = document.createElement("div");
    wrapper.className = "builder-item field-wide";
    var heading = document.createElement("div");
    heading.className = "builder-item-heading";
    var title = document.createElement("strong");
    title.textContent = (section.type === "faq" ? "Question " : "Item ") + (index + 1);
    var remove = document.createElement("button");
    remove.className = "text-danger";
    remove.type = "button";
    remove.textContent = "Remove item";
    remove.disabled = section.items.length <= (section.type === "benefits" ? 2 : 1);
    remove.addEventListener("click", function () {
      section.items.splice(index, 1);
      render();
      saveDraft("Item removed from the layout draft.");
    });
    heading.append(title, remove);
    var grid = document.createElement("div");
    grid.className = "builder-item-grid";
    grid.append(
      field(section.type === "testimonials" ? "Attribution" : section.type === "faq" ? "Question" : "Title", item.title, { maxLength: 100, required: true }, function (value) { item.title = value; onChange(); }),
      field(section.type === "testimonials" ? "Quote" : section.type === "faq" ? "Answer" : "Description", item.body, { maxLength: 500, required: true, textarea: true }, function (value) { item.body = value; onChange(); })
    );
    wrapper.append(heading, grid);
    return wrapper;
  }

  function render() {
    list.replaceChildren();
    count.textContent = String(sections.length);
    list.setAttribute("aria-busy", "false");
    if (!sections.length) {
      var empty = document.createElement("div");
      empty.className = "builder-empty";
      var heading = document.createElement("strong");
      heading.textContent = "Your core homepage is protected.";
      var copy = document.createElement("p");
      copy.textContent = "Choose a template above to add an optional section before the footer.";
      empty.append(heading, copy);
      list.appendChild(empty);
      return;
    }

    sections.forEach(function (section, index) {
      var fragment = template.content.cloneNode(true);
      var card = fragment.querySelector(".page-section-editor");
      var form = card.querySelector(".page-section-form");
      card.dataset.sectionId = section.id;
      card.querySelector(".section-template-name").textContent = String(index + 1).padStart(2, "0") + " / " + LABELS[section.type];
      card.querySelector(".page-section-editor-title").textContent = section.title || "Untitled section";
      var up = card.querySelector(".move-section-up");
      var down = card.querySelector(".move-section-down");
      up.disabled = index === 0;
      down.disabled = index === sections.length - 1;
      up.addEventListener("click", function () { sections.splice(index - 1, 0, sections.splice(index, 1)[0]); render(); saveDraft("Section order updated."); });
      down.addEventListener("click", function () { sections.splice(index + 1, 0, sections.splice(index, 1)[0]); render(); saveDraft("Section order updated."); });
      card.querySelector(".duplicate-section").addEventListener("click", function () {
        var duplicate = clone(section);
        duplicate.id = makeId(section.type);
        duplicate.title += " (copy)";
        sections.splice(index + 1, 0, duplicate);
        render(); saveDraft("Section duplicated in the layout draft.");
      });
      card.querySelector(".remove-section").addEventListener("click", function () {
        sections.splice(index, 1); render(); saveDraft("Section removed from the layout draft.");
      });

      var visible = document.createElement("label");
      visible.className = "toggle-field";
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = section.visible;
      checkbox.addEventListener("change", function () { section.visible = checkbox.checked; saveDraft(checkbox.checked ? "Section will be visible after publishing." : "Section hidden from the public page."); });
      var visibleText = document.createElement("span");
      visibleText.textContent = "Visible on website";
      visible.append(checkbox, visibleText);
      form.appendChild(visible);

      form.append(
        field("Color theme", section.theme, { select: [
          { value: "paper", label: "Paper" }, { value: "ink", label: "Ink" }, { value: "lime", label: "Lime" }
        ] }, function (value) { section.theme = value; saveDraft(); }),
        field("Eyebrow", section.eyebrow, { maxLength: 80 }, function (value) { section.eyebrow = value; saveDraft(); }),
        field("Headline", section.title, { maxLength: 140, required: true, wide: true }, function (value) { section.title = value; card.querySelector(".page-section-editor-title").textContent = value || "Untitled section"; saveDraft(); })
      );

      if (["benefits", "testimonials", "faq"].indexOf(section.type) === -1) {
        form.appendChild(field("Body copy", section.body, { maxLength: 700, required: true, textarea: true, wide: true }, function (value) { section.body = value; saveDraft(); }));
      }
      if (section.type === "split") {
        form.appendChild(field("Image URL", section.imageUrl, { maxLength: 500, wide: true, placeholder: "https://...", hint: "Use an HTTPS image or an image already stored in assets/." }, function (value) { section.imageUrl = value; saveDraft(); }));
      }
      if (["hero", "split", "cta"].indexOf(section.type) !== -1) {
        var requiredButton = section.type !== "split";
        form.append(
          field("Button label", section.buttonLabel, { maxLength: 50, required: requiredButton }, function (value) { section.buttonLabel = value; saveDraft(); }),
          field("Button destination", section.buttonHref, { maxLength: 500, required: requiredButton, placeholder: "#pricing", hint: "Only internal paths, page anchors, and HTTPS links are accepted." }, function (value) { section.buttonHref = value; saveDraft(); })
        );
      }
      if (ITEM_LIMITS[section.type]) {
        section.items.forEach(function (_, itemIndex) { form.appendChild(itemEditor(section, itemIndex, saveDraft)); });
        var addItem = document.createElement("button");
        addItem.className = "button field-wide add-builder-item";
        addItem.type = "button";
        addItem.textContent = "+ Add item";
        addItem.disabled = section.items.length >= ITEM_LIMITS[section.type];
        addItem.addEventListener("click", function () {
          section.items.push({ title: section.type === "faq" ? "New question" : "New item", body: "Add the supporting details here." });
          render(); saveDraft("Item added to the layout draft.");
        });
        form.appendChild(addItem);
      }
      list.appendChild(fragment);
    });
  }

  function fetchData() {
    return fetch(DATA_URL, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("Unable to load page sections");
      return response.json();
    });
  }

  function load() {
    var draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        var parsed = JSON.parse(draft);
        sections = (parsed.sections || []).map(normalize);
        render();
        setStatus("Layout draft restored from this browser.");
        return;
      } catch (error) { localStorage.removeItem(DRAFT_KEY); }
    }
    fetchData().then(function (content) {
      sections = (content.sections || []).map(normalize);
      render();
      setStatus("Live page layout loaded. Add a section to create a private draft.");
    }).catch(function () {
      setStatus("Page layout could not be loaded. Refresh and try again.", "error");
    });
  }

  function validDraft() {
    var invalid = list.querySelector(":invalid");
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      setStatus("Complete the highlighted field before continuing.", "error");
      return false;
    }
    return true;
  }

  function requestJson(options) {
    return fetch(PUBLISH_URL, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var error = new Error(data.error || "Request failed");
          error.status = response.status; error.code = data.error; error.details = data.details || [];
          throw error;
        }
        return data;
      });
    });
  }

  document.getElementById("addPageSection").addEventListener("click", function () {
    if (sections.length >= 20) { setStatus("The page builder supports up to 20 optional sections.", "error"); return; }
    sections.push(templateSection(document.getElementById("pageSectionType").value));
    render(); saveDraft("New section added to the private layout draft.");
    list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("resetPageSections").addEventListener("click", function () {
    localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(PREVIEW_KEY);
    setStatus("Reloading the live page layout...");
    fetchData().then(function (content) {
      sections = (content.sections || []).map(normalize); render();
      setStatus("Layout draft cleared. Live page layout restored.", "success");
    }).catch(function () { setStatus("Page layout could not be reloaded.", "error"); });
  });

  document.getElementById("previewPageSections").addEventListener("click", function () {
    if (!validDraft()) return;
    localStorage.setItem(PREVIEW_KEY, JSON.stringify({ version: 1, sections: sections }));
    window.open("index.html?page-preview=1", "_blank");
    setStatus("Private layout preview opened in a new tab.", "success");
  });

  publishButton.addEventListener("click", function () {
    if (!validDraft()) return;
    publishButton.disabled = true;
    setStatus("Publishing page layout...");
    requestJson({
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
      body: JSON.stringify({ action: "publish-page-sections", content: { version: 1, sections: sections } })
    }).then(function (data) {
      localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(PREVIEW_KEY);
      if (data.unchanged) { setStatus("The live website already uses this layout.", "success"); return; }
      var shortSha = typeof data.commitSha === "string" ? data.commitSha.slice(0, 7) : "created";
      setStatus("Published as commit " + shortSha + ". Vercel is updating the live website.", "success");
    }).catch(function (error) {
      if (error.status === 401) setStatus("Your admin session expired. Sign in again; the draft is still safe.", "error");
      else if (error.code === "publishing_disabled_in_preview") setStatus("Publishing is disabled on Preview deployments. Use the production admin page.", "error");
      else if (error.code === "invalid_page_sections") setStatus(error.details[0] || "Correct the invalid section and try again.", "error");
      else if (error.code === "github_publishing_not_configured") setStatus("GitHub publishing is not configured yet.", "error");
      else setStatus("Publishing failed. Your browser draft is still safe.", "error");
    }).finally(function () { publishButton.disabled = false; });
  });

  load();
})();
