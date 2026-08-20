(function () {
  "use strict";

  var DATA_URL = "assets/data/page-sections.json";
  var PREVIEW_KEY = "legitbodyfix.pageSectionsPreview.v1";
  var root = document.getElementById("customSections");
  if (!root) return;

  function safeLink(value) {
    if (typeof value !== "string") return "";
    if (/^#[a-z][a-z0-9_-]*$/i.test(value)) return value;
    if (/^\/?[a-z0-9][a-z0-9/_-]*(?:\.html)?(?:\?[a-z0-9%&=._-]+)?(?:#[a-z0-9_-]+)?$/i.test(value)) return value;
    if (/^https:\/\/[a-z0-9.-]+(?::\d+)?(?:[/?#][^\s]*)?$/i.test(value)) return value;
    return "";
  }

  function safeImage(value) {
    if (typeof value !== "string") return "";
    if (/^assets\/[a-z0-9/_-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(value)) return value;
    if (/^https:\/\/[a-z0-9.-]+(?::\d+)?\/[^\s]+$/i.test(value)) return value;
    return "";
  }

  function text(tag, className, value) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value || "";
    return element;
  }

  function action(section) {
    var href = safeLink(section.buttonHref);
    if (!href || !section.buttonLabel) return null;
    var link = text("a", "button page-section-button", section.buttonLabel);
    link.href = href;
    if (/^https:\/\//i.test(href)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }

  function heading(section, container) {
    if (section.eyebrow) container.appendChild(text("p", "page-section-eyebrow", section.eyebrow));
    container.appendChild(text("h2", "page-section-title", section.title));
    if (section.body) container.appendChild(text("p", "page-section-body", section.body));
  }

  function renderItems(section, container) {
    var list = document.createElement("div");
    list.className = "page-section-items page-section-items-" + section.type;
    (section.items || []).forEach(function (item) {
      var article = document.createElement("article");
      article.className = "page-section-item";
      if (section.type === "testimonials") {
        article.append(text("blockquote", "", item.body), text("p", "page-section-item-title", item.title));
      } else {
        article.append(text("h3", "page-section-item-title", item.title), text("p", "", item.body));
      }
      list.appendChild(article);
    });
    container.appendChild(list);
  }

  function renderSection(section) {
    var wrapper = document.createElement("section");
    wrapper.className = "page-section page-section-" + section.type + " theme-" + section.theme;
    wrapper.dataset.sectionId = section.id;
    var inner = document.createElement("div");
    inner.className = "wrap page-section-inner";

    if (section.type === "split") {
      var copy = document.createElement("div");
      copy.className = "page-section-copy";
      heading(section, copy);
      var splitAction = action(section);
      if (splitAction) copy.appendChild(splitAction);
      var media = document.createElement("div");
      media.className = "page-section-media";
      var imageUrl = safeImage(section.imageUrl);
      if (imageUrl) {
        var image = document.createElement("img");
        image.src = imageUrl;
        image.alt = section.title;
        image.loading = "lazy";
        media.appendChild(image);
      } else {
        media.appendChild(text("span", "page-section-placeholder", "IMAGE / OPTIONAL"));
      }
      inner.append(copy, media);
    } else {
      heading(section, inner);
      if (section.type === "benefits" || section.type === "testimonials" || section.type === "faq") renderItems(section, inner);
      var sectionAction = action(section);
      if (sectionAction) inner.appendChild(sectionAction);
    }

    wrapper.appendChild(inner);
    return wrapper;
  }

  function render(content) {
    root.replaceChildren();
    var sections = content && Array.isArray(content.sections) ? content.sections : [];
    sections.filter(function (section) { return section && section.visible !== false; }).forEach(function (section) {
      if (["hero", "split", "benefits", "testimonials", "faq", "cta"].indexOf(section.type) !== -1) {
        root.appendChild(renderSection(section));
      }
    });
  }

  function previewContent() {
    if (new URLSearchParams(window.location.search).get("page-preview") !== "1") return null;
    try { return JSON.parse(localStorage.getItem(PREVIEW_KEY) || "null"); }
    catch (error) { return null; }
  }

  var preview = previewContent();
  if (preview) {
    render(preview);
    return;
  }

  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("Unable to load page sections");
      return response.json();
    })
    .then(render)
    .catch(function () {
      // Optional sections fail closed; the existing homepage remains complete.
    });
})();
