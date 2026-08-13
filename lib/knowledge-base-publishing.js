"use strict";

var CONTENT_PATH = "assets/data/knowledge-base.json";
var TYPES = ["conditions", "muscles", "recipes"];
var MUSCLE_FUNCTION_ROLES = ["Neck flexor", "Neck extensor", "Neck lateral flexor", "Neck rotator", "Shoulder flexor", "Shoulder extensor", "Shoulder abductor", "Shoulder adductor", "Shoulder internal rotator", "Shoulder external rotator", "Scapular protractor", "Scapular retractor", "Scapular elevator", "Scapular depressor", "Scapular upward rotator", "Scapular downward rotator", "Elbow flexor", "Elbow extensor", "Forearm pronator", "Forearm supinator", "Wrist flexor", "Wrist extensor", "Finger flexor", "Finger extensor", "Finger abductor", "Finger adductor", "Thumb flexor", "Thumb extensor", "Thumb abductor", "Thumb adductor", "Thumb opposer", "Trunk flexor", "Trunk extensor", "Trunk rotator", "Trunk lateral flexor", "Inspiratory muscle", "Expiratory muscle", "Pelvic floor supporter", "Urinary continence muscle", "Fecal continence muscle", "Hip flexor", "Hip extensor", "Hip abductor", "Hip adductor", "Hip internal rotator", "Hip external rotator", "Knee flexor", "Knee extensor", "Knee internal rotator", "Knee external rotator", "Ankle dorsiflexor", "Ankle plantarflexor", "Foot invertor", "Foot evertor", "Toe flexor", "Toe extensor"];

function KnowledgeBaseError(code, message, statusCode, details) {
  this.name = "KnowledgeBaseError";
  this.code = code;
  this.message = message;
  this.statusCode = statusCode || 500;
  this.details = details || [];
  if (Error.captureStackTrace) Error.captureStackTrace(this, KnowledgeBaseError);
}
KnowledgeBaseError.prototype = Object.create(Error.prototype);
KnowledgeBaseError.prototype.constructor = KnowledgeBaseError;

function cleanText(value, label, maximum, errors) {
  var text = typeof value === "string" ? value.trim() : "";
  if (text.length > maximum) errors.push(label + " must be " + maximum + " characters or fewer.");
  return text;
}

function validateKnowledgeBase(input) {
  var errors = [];
  var output = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new KnowledgeBaseError("invalid_knowledge_base", "Expected a knowledge base object.", 400);
  }
  TYPES.forEach(function (type) {
    var records = input[type];
    var seen = Object.create(null);
    if (!Array.isArray(records)) {
      errors.push(type + " must be a list.");
      records = [];
    }
    if (records.length > 300) errors.push(type + " cannot contain more than 300 records.");
    output[type] = records.slice(0, 300).map(function (record, index) {
      record = record && typeof record === "object" && !Array.isArray(record) ? record : {};
      var prefix = type + " record " + (index + 1);
      var id = cleanText(record.id, prefix + " id", 80, errors);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) errors.push(prefix + " id must use lowercase letters, numbers, and hyphens.");
      if (seen[id]) errors.push(prefix + " id must be unique.");
      seen[id] = true;
      var cleaned = { id: id, title: cleanText(record.title, prefix + " title", 120, errors) };
      if (!cleaned.title) errors.push(prefix + " title is required.");
      Object.keys(record).forEach(function (key) {
        if (key === "id" || key === "title" || key === "published") return;
        if (!/^[A-Za-z][A-Za-z0-9]*$/.test(key)) return;
        if (type === "muscles" && key === "cardImageScale") {
          var scale = Number(record[key]);
          if (!Number.isFinite(scale) || scale < 1 || scale > 3) errors.push(prefix + " cardImageScale must be between 1 and 3.");
          else cleaned[key] = Math.round(scale * 100) / 100;
          return;
        }
        if (type === "muscles" && key === "functionalRoles") {
          if (!Array.isArray(record[key])) errors.push(prefix + " functionalRoles must be a list.");
          else {
            var roles = Array.from(new Set(record[key].filter(function (role) { return typeof role === "string"; })));
            roles.forEach(function (role) { if (MUSCLE_FUNCTION_ROLES.indexOf(role) === -1) errors.push(prefix + " has an unsupported functional role: " + role + "."); });
            cleaned[key] = roles.filter(function (role) { return MUSCLE_FUNCTION_ROLES.indexOf(role) !== -1; });
          }
          return;
        }
        cleaned[key] = cleanText(record[key], prefix + " " + key, key === "steps" ? 2400 : 800, errors);
      });
      cleaned.published = record.published === true;
      return cleaned;
    });
  });
  if (errors.length) throw new KnowledgeBaseError("invalid_knowledge_base", "Knowledge base data is invalid.", 400, errors.slice(0, 30));
  return output;
}

function serializeKnowledgeBase(input) { return JSON.stringify(validateKnowledgeBase(input), null, 2) + "\n"; }

async function parseResponse(response) {
  var data = await response.json().catch(function () { return {}; });
  if (!response.ok) throw new KnowledgeBaseError("github_publish_failed", data.message || "GitHub rejected the update.", response.status === 409 ? 409 : 502);
  return data;
}

async function publishKnowledgeBase(config, input, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") throw new KnowledgeBaseError("github_publish_unavailable", "Publishing is unavailable.", 503);
  var content = serializeKnowledgeBase(input);
  var repository = config.repository.split("/").map(encodeURIComponent).join("/");
  var path = CONTENT_PATH.split("/").map(encodeURIComponent).join("/");
  var endpoint = "https://api.github.com/repos/" + repository + "/contents/" + path;
  var headers = { Accept: "application/vnd.github+json", Authorization: "Bearer " + config.token, "Content-Type": "application/json", "User-Agent": "legitbodyfix-admin", "X-GitHub-Api-Version": "2022-11-28" };
  var current = await parseResponse(await fetcher(endpoint + "?ref=" + encodeURIComponent(config.branch), { method: "GET", headers: headers }));
  var currentContent = Buffer.from(String(current.content || "").replace(/\s/g, ""), "base64").toString("utf8");
  if (currentContent === content) return { unchanged: true, commitSha: null, commitUrl: null };
  var update = await parseResponse(await fetcher(endpoint, { method: "PUT", headers: headers, body: JSON.stringify({ message: "Update knowledge base from admin", content: Buffer.from(content, "utf8").toString("base64"), sha: current.sha, branch: config.branch }) }));
  return { unchanged: false, commitSha: update.commit && update.commit.sha || null, commitUrl: update.commit && update.commit.html_url || null };
}

module.exports = { CONTENT_PATH: CONTENT_PATH, KnowledgeBaseError: KnowledgeBaseError, publishKnowledgeBase: publishKnowledgeBase, serializeKnowledgeBase: serializeKnowledgeBase, validateKnowledgeBase: validateKnowledgeBase };
