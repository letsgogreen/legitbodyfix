"use strict";

var videos = require("../assets/data/videos.json");

function isVideoId(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ""));
}

function isStreamVideoId(value) {
  return /^[a-f0-9]{32}$/i.test(String(value || ""));
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanLegacyIds(value, canonicalId) {
  return (Array.isArray(value) ? value : []).map(cleanText).filter(function (id, index, ids) {
    return id !== canonicalId && isVideoId(id) && ids.indexOf(id) === index;
  });
}

function normalizeVideo(video) {
  var id = cleanText(video && video.id);
  var programId = cleanText(video && video.programId);
  if (!isVideoId(id) || !isVideoId(programId)) return null;

  var streamVideoId = cleanText(video.streamVideoId);
  return {
    id: id,
    legacyIds: cleanLegacyIds(video.legacyIds, id),
    programId: programId,
    title: cleanText(video.title) || "Movement session",
    description: cleanText(video.description),
    durationMinutes: Number.isInteger(video.durationMinutes) ? video.durationMinutes : null,
    equipment: cleanText(video.equipment),
    thumbnailUrl: cleanText(video.thumbnailUrl),
    published: video.published === true,
    streamVideoId: isStreamVideoId(streamVideoId) ? streamVideoId : "",
    streamReady: video.streamReady === true
  };
}

var normalizedVideos = Array.isArray(videos)
  ? videos.map(normalizeVideo).filter(Boolean)
  : [];

function entitledProgramIds(programs) {
  return new Set((Array.isArray(programs) ? programs : []).map(function (program) {
    return cleanText(program && program.id);
  }).filter(isVideoId));
}

function toClientVideo(video) {
  return {
    id: video.id,
    programId: video.programId,
    title: video.title,
    description: video.description,
    durationMinutes: video.durationMinutes,
    equipment: video.equipment,
    thumbnailUrl: video.thumbnailUrl,
    ready: Boolean(video.streamVideoId && video.streamReady)
  };
}

// A video is accessible if the buyer holds an entitlement for the bundle
// program it belongs to, OR an entitlement for the video's own id (created
// when someone buys that single session individually).
function isEntitledToVideo(allowedPrograms, video) {
  return allowedPrograms.has(video.programId) || allowedPrograms.has(video.id) || video.legacyIds.some(function (id) {
    return allowedPrograms.has(id);
  });
}

function listAccessibleVideos(programs) {
  var allowedPrograms = entitledProgramIds(programs);
  return normalizedVideos.filter(function (video) {
    return video.published && isEntitledToVideo(allowedPrograms, video);
  }).map(toClientVideo);
}

function getAccessibleVideo(programs, videoId) {
  var allowedPrograms = entitledProgramIds(programs);
  var id = cleanText(videoId);
  return normalizedVideos.find(function (video) {
    return (video.id === id || video.legacyIds.indexOf(id) !== -1) && video.published && isEntitledToVideo(allowedPrograms, video);
  }) || null;
}

module.exports = {
  getAccessibleVideo: getAccessibleVideo,
  isStreamVideoId: isStreamVideoId,
  listAccessibleVideos: listAccessibleVideos
};
