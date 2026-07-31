"use strict";

var CONTENT_PATH = "assets/data/page-sections.json";
var TYPES = ["hero", "split", "benefits", "testimonials", "faq", "cta"];
var THEMES = ["paper", "ink", "lime"];

function PageSectionsError(code, message, statusCode, details) {
  this.name = "PageSectionsError";
  this.code = code;
  this.message = message;
  this.statusCode = statusCode || 500;
  this.details = details || [];
  if (Error.captureStackTrace) Error.captureStackTrace(this, PageSectionsError);
}

PageSectionsError.prototype = Object.create(Error.prototype);
PageSectionsError.prototype.constructor = PageSectionsError;

function plainText(value, path, maximum, errors, required) {
  var cleaned = typeof value === "string" ? value.trim() : "";
  if ((required && !cleaned) || cleaned.length > maximum || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(cleaned)) {
    errors.push(path + " must contain " + (required ? "1-" : "0-") + maximum + " plain-text characters.");
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

function itemLimits(type) {
  if (type === "benefits") return [2, 6];
  if (type === "testimonials") return [1, 4];
  if (type === "faq") return [1, 8];
  return [0, 0];
}

function validatePageSections(input) {
  var errors = [];
  var root = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  var source = Array.isArray(root.sections) ? root.sections : [];
  if (!Array.isArray(root.sections)) errors.push("sections must be an array.");
  if (source.length > 20) errors.push("sections cannot contain more than 20 items.");
  var ids = Object.create(null);

  var sections = source.slice(0, 20).map(function (value, index) {
    var path = "sections." + index;
    var section = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    if (section !== value) errors.push(path + " must be an object.");
    var id = plainText(section.id, path + ".id", 80, errors, true);
    if (!/^[a-z0-9][a-z0-9-]{2,79}$/i.test(id)) errors.push(path + ".id contains unsupported characters.");
    if (ids[id]) errors.push(path + ".id must be unique.");
    ids[id] = true;

    var type = plainText(section.type, path + ".type", 20, errors, true);
    if (TYPES.indexOf(type) === -1) errors.push(path + ".type is not an approved section template.");
    var theme = plainText(section.theme, path + ".theme", 10, errors, true);
    if (THEMES.indexOf(theme) === -1) errors.push(path + ".theme is not an approved color theme.");

    var limits = itemLimits(type);
    var sourceItems = Array.isArray(section.items) ? section.items : [];
    if (sourceItems.length < limits[0] || sourceItems.length > limits[1]) {
      errors.push(path + ".items must contain " + limits[0] + "-" + limits[1] + " items for this template.");
    }
    var items = sourceItems.slice(0, limits[1]).map(function (item, itemIndex) {
      var itemPath = path + ".items." + itemIndex;
      item = item && typeof item === "object" && !Array.isArray(item) ? item : {};
      return {
        title: plainText(item.title, itemPath + ".title", 100, errors, true),
        body: plainText(item.body, itemPath + ".body", 500, errors, true)
      };
    });

    var needsButton = type === "hero" || type === "cta";
    var buttonLabel = plainText(section.buttonLabel, path + ".buttonLabel", 50, errors, needsButton);
    var buttonHref = safeLink(section.buttonHref, path + ".buttonHref", errors, needsButton);
    if (!needsButton && Boolean(buttonLabel) !== Boolean(buttonHref)) {
      errors.push(path + " must include both a button label and destination, or neither.");
    }
    return {
      id: id,
      type: type,
      theme: theme,
      visible: section.visible !== false,
      eyebrow: plainText(section.eyebrow, path + ".eyebrow", 80, errors, false),
      title: plainText(section.title, path + ".title", 140, errors, true),
      body: plainText(section.body, path + ".body", 700, errors, type !== "benefits" && type !== "testimonials" && type !== "faq"),
      buttonLabel: buttonLabel,
      buttonHref: buttonHref,
      imageUrl: safeImage(section.imageUrl, path + ".imageUrl", errors),
      items: items
    };
  });

  if (errors.length) {
    throw new PageSectionsError("invalid_page_sections", "Page sections are invalid.", 400, errors.slice(0, 30));
  }
  return { version: 1, sections: sections };
}

function serializePageSections(content) {
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
  if (!response.ok) {
    throw new PageSectionsError("github_publish_failed", data.message || "GitHub rejected the update.", response.status === 409 || response.status === 422 ? 409 : 502);
  }
  return data;
}

async function publishPageSections(config, input, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new PageSectionsError("github_publish_unavailable", "Publishing is unavailable.", 503);
  var content = validatePageSections(input);
  var serialized = serializePageSections(content);
  var repository = config.repository.split("/").map(encodeURIComponent).join("/");
  var path = CONTENT_PATH.split("/").map(encodeURIComponent).join("/");
  var endpoint = "https://api.github.com/repos/" + repository + "/contents/" + path;
  var requestHeaders = headers(config.token);
  var current = await json(await fetcher(endpoint + "?ref=" + encodeURIComponent(config.branch), { method: "GET", headers: requestHeaders }));
  if (!current.sha || typeof current.content !== "string") {
    throw new PageSectionsError("github_file_invalid", "The current page sections file could not be read.", 502);
  }
  var currentContent = Buffer.from(current.content.replace(/\s/g, ""), "base64").toString("utf8");
  if (currentContent === serialized) return { unchanged: true, commitSha: null, commitUrl: null, content: content };
  var update = await json(await fetcher(endpoint, {
    method: "PUT",
    headers: requestHeaders,
    body: JSON.stringify({
      message: "Update page sections from admin",
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
  TYPES: TYPES,
  THEMES: THEMES,
  PageSectionsError: PageSectionsError,
  publishPageSections: publishPageSections,
  serializePageSections: serializePageSections,
  validatePageSections: validatePageSections
};
