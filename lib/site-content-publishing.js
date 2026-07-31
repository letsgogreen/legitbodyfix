"use strict";

var CONTENT_PATH = "assets/data/site-content.json";
var CORE_SECTIONS = ["hero", "method", "library", "standard", "pricing"];
var CUSTOM_TYPES = ["hero", "split", "benefits", "testimonials", "faq", "cta"];
var THEMES = ["lime", "teal", "mono"];
var DENSITIES = ["spacious", "compact"];
var SECTION_THEMES = ["paper", "ink", "lime"];

function SiteContentError(code, message, statusCode, details) {
  this.name = "SiteContentError";
  this.code = code;
  this.message = message;
  this.statusCode = statusCode || 500;
  this.details = details || [];
  if (Error.captureStackTrace) Error.captureStackTrace(this, SiteContentError);
}

SiteContentError.prototype = Object.create(Error.prototype);
SiteContentError.prototype.constructor = SiteContentError;

function object(value, path, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(path + " must be an object.");
    return {};
  }
  return value;
}

function plainText(value, path, maximum, errors, required) {
  var cleaned = typeof value === "string" ? value.trim() : "";
  if ((required && !cleaned) || cleaned.length > maximum || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(cleaned)) {
    errors.push(path + " must contain " + (required ? "1-" : "0-") + maximum + " plain-text characters.");
  }
  return cleaned;
}

function strings(value, path, count, maximum, errors) {
  if (!Array.isArray(value) || value.length !== count) {
    errors.push(path + " must contain exactly " + count + " items.");
    value = [];
  }
  return Array.from({ length: count }, function (_, index) {
    return plainText(value[index], path + "." + index, maximum, errors, true);
  });
}

function choice(value, path, allowed, fallback, errors) {
  var cleaned = plainText(value, path, 24, errors, true);
  if (allowed.indexOf(cleaned) === -1) {
    errors.push(path + " is not an approved option.");
    return fallback;
  }
  return cleaned;
}

function safeLink(value, path, errors, required) {
  var cleaned = plainText(value, path, 500, errors, required);
  if (!cleaned) return "";
  var internal = /^#[a-z][a-z0-9_-]*$/i.test(cleaned) || /^\/?[a-z0-9][a-z0-9/_-]*(?:\.html)?(?:\?[a-z0-9%&=._-]+)?(?:#[a-z0-9_-]+)?$/i.test(cleaned);
  var external = /^https:\/\/[a-z0-9.-]+(?::\d+)?(?:[/?#][^\s]*)?$/i.test(cleaned);
  if (!internal && !external) errors.push(path + " must be an internal path, page anchor, or HTTPS URL.");
  return cleaned;
}

function safeImage(value, path, errors) {
  var cleaned = plainText(value, path, 500, errors, false);
  if (!cleaned) return "";
  var local = /^assets\/[a-z0-9/_-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(cleaned);
  var remote = /^https:\/\/[a-z0-9.-]+(?::\d+)?\/[^\s]+$/i.test(cleaned);
  if (!local && !remote) errors.push(path + " must be an HTTPS image URL or an image in assets/.");
  return cleaned;
}

function validateCustomSection(value, index, errors, seenIds) {
  var path = "customSections." + index;
  var section = object(value, path, errors);
  var id = plainText(section.id, path + ".id", 80, errors, true);
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/i.test(id)) errors.push(path + ".id contains unsupported characters.");
  if (seenIds[id]) errors.push(path + ".id must be unique.");
  seenIds[id] = true;
  var type = choice(section.type, path + ".type", CUSTOM_TYPES, "hero", errors);
  var theme = choice(section.theme, path + ".theme", SECTION_THEMES, "paper", errors);
  var itemLimits = { benefits: [2, 6], testimonials: [1, 4], faq: [1, 8] };
  var limits = itemLimits[type] || [0, 0];
  var sourceItems = Array.isArray(section.items) ? section.items : [];
  if (sourceItems.length < limits[0] || sourceItems.length > limits[1]) {
    errors.push(path + ".items must contain " + limits[0] + "-" + limits[1] + " items for this template.");
  }
  var items = sourceItems.slice(0, limits[1]).map(function (item, itemIndex) {
    item = object(item, path + ".items." + itemIndex, errors);
    return {
      title: plainText(item.title, path + ".items." + itemIndex + ".title", 100, errors, true),
      body: plainText(item.body, path + ".items." + itemIndex + ".body", 500, errors, true)
    };
  });
  var requiresButton = type === "hero" || type === "cta";
  var buttonLabel = plainText(section.buttonLabel, path + ".buttonLabel", 50, errors, requiresButton);
  var buttonHref = safeLink(section.buttonHref, path + ".buttonHref", errors, requiresButton);
  if (!requiresButton && Boolean(buttonLabel) !== Boolean(buttonHref)) {
    errors.push(path + " must include both a button label and destination, or neither.");
  }
  return {
    id: id,
    type: type,
    theme: theme,
    eyebrow: plainText(section.eyebrow, path + ".eyebrow", 80, errors, false),
    title: plainText(section.title, path + ".title", 140, errors, true),
    body: plainText(section.body, path + ".body", 700, errors, type !== "benefits" && type !== "testimonials" && type !== "faq"),
    buttonLabel: buttonLabel,
    buttonHref: buttonHref,
    imageUrl: safeImage(section.imageUrl, path + ".imageUrl", errors),
    imageAlt: plainText(section.imageAlt, path + ".imageAlt", 160, errors, false),
    items: items
  };
}

function validateSiteContent(input) {
  var errors = [];
  var root = object(input, "content", errors);
  var settings = object(root.settings, "settings", errors);
  var navigation = object(root.navigation, "navigation", errors);
  var hero = object(root.hero, "hero", errors);
  var method = object(root.method, "method", errors);
  var library = object(root.library, "library", errors);
  var standard = object(root.standard, "standard", errors);
  var pricing = object(root.pricing, "pricing", errors);
  var footer = object(root.footer, "footer", errors);
  var steps = Array.isArray(method.steps) && method.steps.length === 3 ? method.steps : [];
  if (steps.length !== 3) errors.push("method.steps must contain exactly 3 items.");

  var seenIds = Object.create(null);
  CORE_SECTIONS.forEach(function (id) { seenIds[id] = true; });
  var customSource = Array.isArray(root.customSections) ? root.customSections : [];
  if (!Array.isArray(root.customSections)) errors.push("customSections must be an array.");
  if (customSource.length > 20) errors.push("customSections cannot contain more than 20 items.");
  var customSections = customSource.slice(0, 20).map(function (section, index) {
    return validateCustomSection(section, index, errors, seenIds);
  });

  var allowedLayoutIds = CORE_SECTIONS.concat(customSections.map(function (section) { return section.id; }));
  var layoutSource = Array.isArray(root.layout) ? root.layout : [];
  if (!Array.isArray(root.layout)) errors.push("layout must be an array.");
  if (layoutSource.length !== allowedLayoutIds.length) errors.push("layout must include every homepage section exactly once.");
  var layoutSeen = Object.create(null);
  var layout = layoutSource.slice(0, 25).map(function (value, index) {
    var path = "layout." + index;
    var entry = object(value, path, errors);
    var id = plainText(entry.id, path + ".id", 80, errors, true);
    if (allowedLayoutIds.indexOf(id) === -1) errors.push(path + ".id is not a known homepage section.");
    if (layoutSeen[id]) errors.push(path + ".id must be unique.");
    layoutSeen[id] = true;
    var expectedKind = CORE_SECTIONS.indexOf(id) !== -1 ? "core" : "custom";
    var kind = plainText(entry.kind, path + ".kind", 10, errors, true);
    if (kind !== expectedKind) errors.push(path + ".kind must be " + expectedKind + ".");
    return { id: id, kind: expectedKind, visible: entry.visible !== false };
  });
  allowedLayoutIds.forEach(function (id) {
    if (!layoutSeen[id]) errors.push("layout is missing " + id + ".");
  });

  var content = {
    version: 2,
    settings: {
      theme: choice(settings.theme, "settings.theme", THEMES, "lime", errors),
      density: choice(settings.density, "settings.density", DENSITIES, "spacious", errors)
    },
    navigation: {
      method: plainText(navigation.method, "navigation.method", 30, errors, true),
      library: plainText(navigation.library, "navigation.library", 30, errors, true),
      myLibrary: plainText(navigation.myLibrary, "navigation.myLibrary", 30, errors, true),
      programs: plainText(navigation.programs, "navigation.programs", 30, errors, true),
      howItWorks: plainText(navigation.howItWorks, "navigation.howItWorks", 30, errors, true),
      browsePrograms: plainText(navigation.browsePrograms, "navigation.browsePrograms", 40, errors, true)
    },
    layout: layout,
    hero: {
      kicker: plainText(hero.kicker, "hero.kicker", 80, errors, true),
      titleLines: strings(hero.titleLines, "hero.titleLines", 4, 24, errors),
      description: plainText(hero.description, "hero.description", 320, errors, true),
      primaryButton: plainText(hero.primaryButton, "hero.primaryButton", 40, errors, true),
      primaryHref: safeLink(hero.primaryHref, "hero.primaryHref", errors, true),
      secondaryButton: plainText(hero.secondaryButton, "hero.secondaryButton", 40, errors, true),
      secondaryHref: safeLink(hero.secondaryHref, "hero.secondaryHref", errors, true),
      proofPoints: strings(hero.proofPoints, "hero.proofPoints", 3, 60, errors),
      imageUrl: safeImage(hero.imageUrl, "hero.imageUrl", errors),
      imageAlt: plainText(hero.imageAlt, "hero.imageAlt", 160, errors, true)
    },
    method: {
      label: plainText(method.label, "method.label", 80, errors, true),
      titleLines: strings(method.titleLines, "method.titleLines", 2, 40, errors),
      intro: plainText(method.intro, "method.intro", 360, errors, true),
      steps: Array.from({ length: 3 }, function (_, index) {
        var step = object(steps[index], "method.steps." + index, errors);
        return {
          title: plainText(step.title, "method.steps." + index + ".title", 50, errors, true),
          description: plainText(step.description, "method.steps." + index + ".description", 220, errors, true)
        };
      })
    },
    library: {
      label: plainText(library.label, "library.label", 80, errors, true),
      titleLines: strings(library.titleLines, "library.titleLines", 2, 40, errors),
      intro: plainText(library.intro, "library.intro", 320, errors, true),
      linkLabel: plainText(library.linkLabel, "library.linkLabel", 40, errors, true),
      linkHref: safeLink(library.linkHref, "library.linkHref", errors, true)
    },
    standard: {
      quote: plainText(standard.quote, "standard.quote", 280, errors, true),
      attribution: plainText(standard.attribution, "standard.attribution", 80, errors, true)
    },
    pricing: {
      label: plainText(pricing.label, "pricing.label", 80, errors, true),
      titleLines: strings(pricing.titleLines, "pricing.titleLines", 2, 40, errors),
      benefits: strings(pricing.benefits, "pricing.benefits", 4, 100, errors),
      programName: plainText(pricing.programName, "pricing.programName", 100, errors, true),
      displayPrice: plainText(pricing.displayPrice, "pricing.displayPrice", 20, errors, true),
      priceSuffix: plainText(pricing.priceSuffix, "pricing.priceSuffix", 30, errors, true),
      description: plainText(pricing.description, "pricing.description", 280, errors, true),
      buttonLabel: plainText(pricing.buttonLabel, "pricing.buttonLabel", 40, errors, true),
      buttonHref: safeLink(pricing.buttonHref, "pricing.buttonHref", errors, true)
    },
    footer: {
      tagline: plainText(footer.tagline, "footer.tagline", 100, errors, true),
      legal: plainText(footer.legal, "footer.legal", 220, errors, true)
    },
    customSections: customSections
  };

  if (errors.length) throw new SiteContentError("invalid_site_content", "Website content is invalid.", 400, errors.slice(0, 40));
  return content;
}

function serializeSiteContent(content) {
  return JSON.stringify(content, null, 2) + "\n";
}

function headers(token) {
  return {
    "Accept": "application/vnd.github+json",
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json",
    "User-Agent": "legitbodyfix-admin",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

async function json(response) {
  var data = await response.json().catch(function () { return {}; });
  if (!response.ok) throw new SiteContentError("github_publish_failed", data.message || "GitHub rejected the update.", response.status === 409 || response.status === 422 ? 409 : 502);
  return data;
}

async function publishSiteContent(config, input, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new SiteContentError("github_publish_unavailable", "Publishing is unavailable.", 503);
  var content = validateSiteContent(input);
  var serialized = serializeSiteContent(content);
  var repository = config.repository.split("/").map(encodeURIComponent).join("/");
  var path = CONTENT_PATH.split("/").map(encodeURIComponent).join("/");
  var endpoint = "https://api.github.com/repos/" + repository + "/contents/" + path;
  var requestHeaders = headers(config.token);
  var current = await json(await fetcher(endpoint + "?ref=" + encodeURIComponent(config.branch), { method: "GET", headers: requestHeaders }));
  if (!current.sha || typeof current.content !== "string") throw new SiteContentError("github_file_invalid", "The current website content file could not be read.", 502);
  var currentContent = Buffer.from(current.content.replace(/\s/g, ""), "base64").toString("utf8");
  if (currentContent === serialized) return { unchanged: true, commitSha: null, commitUrl: null, content: content };
  var update = await json(await fetcher(endpoint, {
    method: "PUT",
    headers: requestHeaders,
    body: JSON.stringify({
      message: "Update website from admin",
      content: Buffer.from(serialized, "utf8").toString("base64"),
      sha: current.sha,
      branch: config.branch
    })
  }));
  return {
    unchanged: false,
    commitSha: update.commit && update.commit.sha || null,
    commitUrl: update.commit && update.commit.html_url || null,
    content: content
  };
}

module.exports = {
  CONTENT_PATH: CONTENT_PATH,
  CORE_SECTIONS: CORE_SECTIONS,
  CUSTOM_TYPES: CUSTOM_TYPES,
  SiteContentError: SiteContentError,
  publishSiteContent: publishSiteContent,
  serializeSiteContent: serializeSiteContent,
  validateSiteContent: validateSiteContent
};
