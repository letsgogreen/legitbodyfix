(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.LegitAdminVideoDraft = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function reconcile(repositoryVideos, draftVideos) {
    var repositoryById = new Map();
    repositoryVideos.forEach(function (video) {
      if (video && typeof video.id === "string" && video.id) repositoryById.set(video.id, video);
    });

    var recovered = 0;
    var videos = draftVideos.map(function (draftVideo) {
      var video = Object.assign({}, draftVideo);
      var saved = repositoryById.get(video.id);
      if (!saved) return video;

      if (!video.streamVideoId && saved.streamVideoId) {
        video.streamVideoId = saved.streamVideoId;
        video.streamReady = saved.streamReady === true;
        recovered += 1;
      } else if (video.streamVideoId === saved.streamVideoId && saved.streamReady === true) {
        video.streamReady = true;
      }

      if (!Array.isArray(video.relatedMuscleIds) && Array.isArray(saved.relatedMuscleIds)) {
        video.relatedMuscleIds = saved.relatedMuscleIds.slice();
      }

      return video;
    });

    return { videos: videos, recovered: recovered };
  }

  return { reconcile: reconcile };
});
