(function () {
  "use strict";

  var DATA_URL = "assets/data/site-content.json";
  var PREVIEW_KEY = "legitbodyfix.siteContentPreview.v2";
  var CORE_IDS = ["hero", "method", "library", "knowledge", "standard", "pricing"];
  var CUSTOM_TYPES = ["hero", "split", "benefits", "testimonials", "faq", "cta"];

  function readPath(source, path) {
    return path.split(".").reduce(function (value, key) {
      return value != null ? value[key] : undefined;
    }, source);
  }

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

  function applyText(content) {
    document.querySelectorAll("[data-content]").forEach(function (element) {
      var value = readPath(content, element.dataset.content);
      if (typeof value === "string") element.textContent = value;
    });
    document.querySelectorAll("[data-content-href]").forEach(function (element) {
      var value = safeLink(readPath(content, element.dataset.contentHref));
      if (value) element.href = value;
    });
  }

  function applyDesign(content) {
    var settings = content.settings || {};
    document.body.dataset.siteTheme = ["lime", "teal", "mono"].indexOf(settings.theme) !== -1 ? settings.theme : "lime";
    document.body.dataset.siteDensity = settings.density === "compact" ? "compact" : "spacious";
    var image = document.getElementById("heroCustomImage");
    var bodyMap = document.getElementById("heroBodyMap");
    if (!image || !bodyMap) return;
    var imageUrl = safeImage(content.hero && content.hero.imageUrl);
    if (imageUrl) {
      image.src = imageUrl;
      image.alt = content.hero.imageAlt || "LegitBodyFix featured movement";
      image.hidden = false;
      bodyMap.hidden = true;
    } else {
      image.removeAttribute("src");
      image.hidden = true;
      bodyMap.hidden = false;
    }
  }

  function action(section, basePath) {
    var href = safeLink(section.buttonHref);
    if (!href || !section.buttonLabel) return null;
    var link = text("a", "button site-block-button", section.buttonLabel);
    if (basePath) {
      link.dataset.content = basePath + ".buttonLabel";
      link.dataset.contentHref = basePath + ".buttonHref";
    }
    link.href = href;
    if (/^https:\/\//i.test(href)) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }

  function heading(section, container, basePath) {
    if (section.eyebrow) {
      var eyebrow = text("p", "site-block-eyebrow", section.eyebrow);
      if (basePath) eyebrow.dataset.content = basePath + ".eyebrow";
      container.appendChild(eyebrow);
    }
    var title = text("h2", "site-block-title", section.title);
    if (basePath) title.dataset.content = basePath + ".title";
    container.appendChild(title);
    if (section.body) {
      var body = text("p", "site-block-body", section.body);
      if (basePath) body.dataset.content = basePath + ".body";
      container.appendChild(body);
    }
  }

  function renderItems(section, container, basePath) {
    var list = document.createElement("div");
    list.className = "site-block-items site-block-items-" + section.type;
    list.classList.add("site-block-items-count-" + Math.min((section.items || []).length, 6));
    (section.items || []).forEach(function (item, itemIndex) {
      var article = document.createElement("article");
      article.className = "site-block-item";
      var itemTitle = text(section.type === "testimonials" ? "p" : "h3", "site-block-item-title", item.title);
      var itemBody = text(section.type === "testimonials" ? "blockquote" : "p", "", item.body);
      if (basePath) {
        itemTitle.dataset.content = basePath + ".items." + itemIndex + ".title";
        itemBody.dataset.content = basePath + ".items." + itemIndex + ".body";
      }
      if (section.type === "testimonials") article.append(itemBody, itemTitle);
      else article.append(itemTitle, itemBody);
      list.appendChild(article);
    });
    container.appendChild(list);
  }

  function renderCustomSection(section, sectionIndex) {
    var basePath = "customSections." + sectionIndex;
    var wrapper = document.createElement("section");
    wrapper.className = "site-block site-block-" + section.type + " theme-" + section.theme;
    wrapper.dataset.siteSection = section.id;
    var inner = document.createElement("div");
    inner.className = "wrap site-block-inner";
    if (section.type === "split") {
      var copy = document.createElement("div");
      copy.className = "site-block-copy";
      heading(section, copy, basePath);
      var splitAction = action(section, basePath);
      if (splitAction) copy.appendChild(splitAction);
      var media = document.createElement("div");
      media.className = "site-block-media";
      var imageUrl = safeImage(section.imageUrl);
      if (imageUrl) {
        var image = document.createElement("img");
        image.src = imageUrl;
        image.alt = section.imageAlt || section.title;
        image.loading = "lazy";
        media.appendChild(image);
      } else media.appendChild(text("span", "site-block-placeholder", "IMAGE / OPTIONAL"));
      inner.append(copy, media);
    } else {
      heading(section, inner, basePath);
      if (["benefits", "testimonials", "faq"].indexOf(section.type) !== -1) renderItems(section, inner, basePath);
      var sectionAction = action(section, basePath);
      if (sectionAction) inner.appendChild(sectionAction);
    }
    wrapper.appendChild(inner);
    return wrapper;
  }

  function applyLayout(content) {
    var main = document.getElementById("main");
    if (!main) return;
    var coreNodes = {};
    CORE_IDS.forEach(function (id) {
      var node = document.querySelector('[data-site-section="' + id + '"]');
      if (node) coreNodes[id] = node;
    });
    var customNodes = {};
    (content.customSections || []).forEach(function (section, sectionIndex) {
      if (section && CUSTOM_TYPES.indexOf(section.type) !== -1) customNodes[section.id] = renderCustomSection(section, sectionIndex);
    });
    var ordered = [];
    (content.layout || []).forEach(function (entry) {
      if (!entry || entry.visible === false) return;
      var node = entry.kind === "core" ? coreNodes[entry.id] : customNodes[entry.id];
      if (node) ordered.push(node);
    });
    if (ordered.length) main.replaceChildren.apply(main, ordered);
  }

  function applyContent(content) {
    applyText(content);
    applyDesign(content);
    applyLayout(content);
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== window.location.origin) return;
    if (new URLSearchParams(window.location.search).get("site-preview") !== "1") return;
    if (!event.data || event.data.type !== "legitbodyfix:site-preview" || !event.data.content) return;
    applyContent(event.data.content);
  });

  function previewContent() {
    if (new URLSearchParams(window.location.search).get("site-preview") !== "1") return null;
    try { return JSON.parse(localStorage.getItem(PREVIEW_KEY) || "null"); }
    catch (error) { return null; }
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
