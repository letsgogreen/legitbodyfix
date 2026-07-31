"use strict";

var CONTENT_PATH = "assets/data/site-content.json";

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

function text(value, path, maximum, errors) {
  var cleaned = typeof value === "string" ? value.trim() : "";
  if (!cleaned || cleaned.length > maximum || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(cleaned)) {
    errors.push(path + " must contain 1-" + maximum + " plain-text characters.");
  }
  return cleaned;
}

function object(value, path, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(path + " must be an object.");
    return {};
  }
  return value;
}

function strings(value, path, count, maximum, errors) {
  if (!Array.isArray(value) || value.length !== count) {
    errors.push(path + " must contain exactly " + count + " items.");
    value = [];
  }
  return Array.from({ length: count }, function (_, index) {
    return text(value[index], path + "." + index, maximum, errors);
  });
}

function validateSiteContent(input) {
  var errors = [];
  var root = object(input, "content", errors);
  var hero = object(root.hero, "hero", errors);
  var method = object(root.method, "method", errors);
  var library = object(root.library, "library", errors);
  var standard = object(root.standard, "standard", errors);
  var pricing = object(root.pricing, "pricing", errors);
  var footer = object(root.footer, "footer", errors);
  var steps = Array.isArray(method.steps) && method.steps.length === 3 ? method.steps : [];

  if (steps.length !== 3) errors.push("method.steps must contain exactly 3 items.");

  var content = {
    hero: {
      kicker: text(hero.kicker, "hero.kicker", 80, errors),
      titleLines: strings(hero.titleLines, "hero.titleLines", 4, 24, errors),
      description: text(hero.description, "hero.description", 320, errors),
      primaryButton: text(hero.primaryButton, "hero.primaryButton", 40, errors),
      secondaryButton: text(hero.secondaryButton, "hero.secondaryButton", 40, errors),
      proofPoints: strings(hero.proofPoints, "hero.proofPoints", 3, 60, errors)
    },
    method: {
      label: text(method.label, "method.label", 80, errors),
      titleLines: strings(method.titleLines, "method.titleLines", 2, 40, errors),
      intro: text(method.intro, "method.intro", 360, errors),
      steps: Array.from({ length: 3 }, function (_, index) {
        var step = object(steps[index], "method.steps." + index, errors);
        return {
          title: text(step.title, "method.steps." + index + ".title", 50, errors),
          description: text(step.description, "method.steps." + index + ".description", 220, errors)
        };
      })
    },
    library: {
      label: text(library.label, "library.label", 80, errors),
      titleLines: strings(library.titleLines, "library.titleLines", 2, 40, errors),
      intro: text(library.intro, "library.intro", 320, errors),
      linkLabel: text(library.linkLabel, "library.linkLabel", 40, errors)
    },
    standard: {
      quote: text(standard.quote, "standard.quote", 280, errors),
      attribution: text(standard.attribution, "standard.attribution", 80, errors)
    },
    pricing: {
      label: text(pricing.label, "pricing.label", 80, errors),
      titleLines: strings(pricing.titleLines, "pricing.titleLines", 2, 40, errors),
      benefits: strings(pricing.benefits, "pricing.benefits", 4, 100, errors),
      programName: text(pricing.programName, "pricing.programName", 100, errors),
      displayPrice: text(pricing.displayPrice, "pricing.displayPrice", 20, errors),
      priceSuffix: text(pricing.priceSuffix, "pricing.priceSuffix", 30, errors),
      description: text(pricing.description, "pricing.description", 280, errors),
      buttonLabel: text(pricing.buttonLabel, "pricing.buttonLabel", 40, errors)
    },
    footer: {
      tagline: text(footer.tagline, "footer.tagline", 100, errors),
      legal: text(footer.legal, "footer.legal", 220, errors)
    }
  };

  if (errors.length) {
    throw new SiteContentError("invalid_site_content", "Website content is invalid.", 400, errors.slice(0, 20));
  }
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
  if (!response.ok) {
    throw new SiteContentError("github_publish_failed", data.message || "GitHub rejected the update.", response.status === 409 || response.status === 422 ? 409 : 502);
  }
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

  if (!current.sha || typeof current.content !== "string") {
    throw new SiteContentError("github_file_invalid", "The current website content file could not be read.", 502);
  }

  var currentContent = Buffer.from(current.content.replace(/\s/g, ""), "base64").toString("utf8");
  if (currentContent === serialized) return { unchanged: true, commitSha: null, commitUrl: null, content: content };

  var update = await json(await fetcher(endpoint, {
    method: "PUT",
    headers: requestHeaders,
    body: JSON.stringify({
      message: "Update website text from admin",
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
  SiteContentError: SiteContentError,
  publishSiteContent: publishSiteContent,
  serializeSiteContent: serializeSiteContent,
  validateSiteContent: validateSiteContent
};
