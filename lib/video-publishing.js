"use strict";

var CONTENT_PATH = "public/assets/data/videos.json";
var DEFAULT_REPOSITORY = "letsgogreen/legitbodyfix";
var DEFAULT_BRANCH = "main";
var ALLOWED_LEVELS = ["FOUNDATIONAL", "INTERMEDIATE", "ADVANCED"];
var MAX_VIDEOS = 200;

function PublishingError(code, message, statusCode, details) {
  this.name = "PublishingError";
  this.code = code;
  this.message = message;
  this.statusCode = statusCode || 500;
  this.details = details || [];
  if (Error.captureStackTrace) Error.captureStackTrace(this, PublishingError);
}

PublishingError.prototype = Object.create(Error.prototype);
PublishingError.prototype.constructor = PublishingError;

function getPublishingConfig() {
  var token = String(process.env.GITHUB_CONTENT_TOKEN || "").trim();
  var repository = String(process.env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY).trim();
  var branch = String(process.env.GITHUB_BRANCH || DEFAULT_BRANCH).trim();

  if (!token || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || !branch) return null;
  return { token: token, repository: repository, branch: branch };
}

function cleanText(value, field, index, minimum, maximum, errors) {
  var text = typeof value === "string" ? value.trim() : "";
  if (text.length < minimum || text.length > maximum) {
    errors.push("Video " + (index + 1) + ": " + field + " must be " + minimum + "-" + maximum + " characters.");
  }
  return text;
}

function cleanUrl(value, field, index, errors) {
  var text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";

  try {
    var parsed = new URL(text);
    if (parsed.protocol !== "https:") throw new Error("HTTPS is required");
    return parsed.toString();
  } catch (error) {
    errors.push("Video " + (index + 1) + ": " + field + " must be an HTTPS URL or empty.");
    return text;
  }
}

function cleanOptionalStreamVideoId(value, index, errors) {
  var text = typeof value === "string" ? value.trim() : "";
  if (text && !/^[a-f0-9]{32}$/i.test(text)) {
    errors.push("Video " + (index + 1) + ": streamVideoId must be a Cloudflare Stream video ID or empty.");
  }
  return text;
}

function cleanLegacyIds(value, id, index, errors) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push("Video " + (index + 1) + ": legacyIds must be an array when present.");
    return [];
  }
  return value.map(function (legacyId) {
    return typeof legacyId === "string" ? legacyId.trim() : "";
  }).filter(function (legacyId, legacyIndex, ids) {
    if (!legacyId || legacyId === id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(legacyId)) {
      errors.push("Video " + (index + 1) + ": legacyIds must contain valid former ids different from the current id.");
      return false;
    }
    return ids.indexOf(legacyId) === legacyIndex;
  });
}

function cleanRelatedMuscleIds(value, index, errors) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push("Video " + (index + 1) + ": relatedMuscleIds must be an array when present.");
    return [];
  }
  if (value.length > 8) {
    errors.push("Video " + (index + 1) + ": relatedMuscleIds can contain at most 8 muscles.");
  }
  return value.map(function (muscleId) {
    return typeof muscleId === "string" ? muscleId.trim() : "";
  }).filter(function (muscleId, muscleIndex, ids) {
    if (!muscleId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(muscleId)) {
      errors.push("Video " + (index + 1) + ": relatedMuscleIds must contain valid muscle ids.");
      return false;
    }
    return ids.indexOf(muscleId) === muscleIndex && muscleIndex < 8;
  });
}

function cleanRelatedMuscleGroupIds(value, index, errors) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push("Video " + (index + 1) + ": relatedMuscleGroupIds must be an array when present.");
    return [];
  }
  if (value.length > 4) {
    errors.push("Video " + (index + 1) + ": relatedMuscleGroupIds can contain at most 4 groups.");
  }
  return value.map(function (groupId) {
    return typeof groupId === "string" ? groupId.trim() : "";
  }).filter(function (groupId, groupIndex, ids) {
    if (!groupId || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(groupId)) {
      errors.push("Video " + (index + 1) + ": relatedMuscleGroupIds must contain valid group ids.");
      return false;
    }
    return ids.indexOf(groupId) === groupIndex && groupIndex < 4;
  });
}

// Optional individual-session price in USD. A video with no price (null)
// can still be sold as part of the full program bundle, but will not appear
// as its own purchasable product on the library preview or in checkout.
function cleanOptionalPrice(value, index, errors) {
  if (value === undefined || value === null || value === "") return null;
  var price = Number(value);
  if (!Number.isFinite(price) || price < 0 || price > 999) {
    errors.push("Video " + (index + 1) + ": price must be a number from 0 to 999 when present.");
    return null;
  }
  return Math.round(price * 100) / 100;
}

function validateVideos(input) {
  var errors = [];
  var seenIds = Object.create(null);

  if (!Array.isArray(input)) {
    throw new PublishingError("invalid_video_data", "Expected a video list.", 400, ["Videos must be an array."]);
  }
  if (input.length > MAX_VIDEOS) {
    throw new PublishingError("invalid_video_data", "Too many videos.", 400, ["A maximum of " + MAX_VIDEOS + " videos is allowed."]);
  }

  var videos = input.map(function (video, index) {
    if (!video || typeof video !== "object" || Array.isArray(video)) {
      errors.push("Video " + (index + 1) + ": expected an object.");
      video = {};
    }

    var id = cleanText(video.id, "id", index, 1, 80, errors);
    if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      errors.push("Video " + (index + 1) + ": id must contain lowercase letters, numbers, and single hyphens only.");
    }
    if (id && seenIds[id]) errors.push("Video " + (index + 1) + ": id must be unique.");
    if (id) seenIds[id] = true;

    var level = typeof video.level === "string" ? video.level.trim().toUpperCase() : "";
    if (ALLOWED_LEVELS.indexOf(level) === -1) {
      errors.push("Video " + (index + 1) + ": level is invalid.");
    }

    var duration = Number(video.durationMinutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 600) {
      errors.push("Video " + (index + 1) + ": durationMinutes must be a whole number from 1 to 600.");
    }

    if (typeof video.published !== "boolean") {
      errors.push("Video " + (index + 1) + ": published must be true or false.");
    }
    if (video.streamReady !== undefined && typeof video.streamReady !== "boolean") {
      errors.push("Video " + (index + 1) + ": streamReady must be true or false when present.");
    }

    var programId = cleanText(video.programId || "neck-shoulder-reset", "programId", index, 1, 80, errors);
    if (programId && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(programId)) {
      errors.push("Video " + (index + 1) + ": programId must contain lowercase letters, numbers, and single hyphens only.");
    }

    return {
      id: id,
      legacyIds: cleanLegacyIds(video.legacyIds, id, index, errors),
      programId: programId,
      level: level,
      moduleNumber: index + 1,
      title: cleanText(video.title, "title", index, 1, 80, errors),
      description: cleanText(video.description, "description", index, 0, 240, errors),
      landingEyebrow: cleanText(video.landingEyebrow, "landingEyebrow", index, 0, 60, errors),
      landingHeadline: cleanText(video.landingHeadline, "landingHeadline", index, 0, 120, errors),
      landingSummary: cleanText(video.landingSummary, "landingSummary", index, 0, 360, errors),
      landingBenefit1: cleanText(video.landingBenefit1, "landingBenefit1", index, 0, 140, errors),
      landingBenefit2: cleanText(video.landingBenefit2, "landingBenefit2", index, 0, 140, errors),
      landingBenefit3: cleanText(video.landingBenefit3, "landingBenefit3", index, 0, 140, errors),
      landingAudience: cleanText(video.landingAudience, "landingAudience", index, 0, 300, errors),
      landingReassurance: cleanText(video.landingReassurance, "landingReassurance", index, 0, 240, errors),
      relatedMuscleGroupIds: cleanRelatedMuscleGroupIds(video.relatedMuscleGroupIds, index, errors),
      relatedMuscleIds: cleanRelatedMuscleIds(video.relatedMuscleIds, index, errors),
      durationMinutes: duration,
      equipment: cleanText(video.equipment, "equipment", index, 1, 80, errors),
      streamVideoId: cleanOptionalStreamVideoId(video.streamVideoId, index, errors),
      streamReady: video.streamReady === true,
      videoUrl: cleanUrl(video.videoUrl, "videoUrl", index, errors),
      thumbnailUrl: cleanUrl(video.thumbnailUrl, "thumbnailUrl", index, errors),
      published: video.published,
      price: cleanOptionalPrice(video.price, index, errors)
    };
  });

  if (errors.length) {
    throw new PublishingError("invalid_video_data", "Video data is invalid.", 400, errors.slice(0, 20));
  }
  return videos;
}

function serializeVideos(videos) {
  return JSON.stringify(videos, null, 2) + "\n";
}

function githubHeaders(token) {
  return {
    "Accept": "application/vnd.github+json",
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json",
    "User-Agent": "legitbodyfix-admin",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

async function parseResponse(response) {
  var data = await response.json().catch(function () { return {}; });
  if (!response.ok) {
    var message = typeof data.message === "string" ? data.message : "GitHub rejected the update.";
    var statusCode = response.status === 409 || response.status === 422 ? 409 : 502;
    throw new PublishingError("github_publish_failed", message, statusCode);
  }
  return data;
}

async function publishVideos(config, input, fetchImplementation) {
  var fetcher = fetchImplementation || globalThis.fetch;
  if (typeof fetcher !== "function") {
    throw new PublishingError("github_publish_unavailable", "The publishing service is unavailable.", 503);
  }

  var videos = validateVideos(input);
  var content = serializeVideos(videos);
  var repositoryParts = config.repository.split("/").map(encodeURIComponent);
  var path = CONTENT_PATH.split("/").map(encodeURIComponent).join("/");
  var endpoint = "https://api.github.com/repos/" + repositoryParts.join("/") + "/contents/" + path;
  var headers = githubHeaders(config.token);

  var currentResponse = await fetcher(endpoint + "?ref=" + encodeURIComponent(config.branch), {
    method: "GET",
    headers: headers
  });
  var current = await parseResponse(currentResponse);

  if (!current.sha || typeof current.content !== "string") {
    throw new PublishingError("github_file_invalid", "The current video data file could not be read.", 502);
  }

  var currentContent = Buffer.from(current.content.replace(/\s/g, ""), "base64").toString("utf8");
  if (currentContent === content) {
    return { unchanged: true, commitSha: null, commitUrl: null, videos: videos };
  }

  var updateResponse = await fetcher(endpoint, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({
      message: "Update video library from admin",
      content: Buffer.from(content, "utf8").toString("base64"),
      sha: current.sha,
      branch: config.branch
    })
  });
  var update = await parseResponse(updateResponse);

  return {
    unchanged: false,
    commitSha: update.commit && update.commit.sha || null,
    commitUrl: update.commit && update.commit.html_url || null,
    videos: videos
  };
}

module.exports = {
  CONTENT_PATH: CONTENT_PATH,
  PublishingError: PublishingError,
  getPublishingConfig: getPublishingConfig,
  publishVideos: publishVideos,
  serializeVideos: serializeVideos,
  validateVideos: validateVideos
};
