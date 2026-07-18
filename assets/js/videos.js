(function () {
  "use strict";

  var grid = document.getElementById("courseGrid");
  if (!grid) return;

  function createElement(tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === "string") element.textContent = text;
    return element;
  }

  function isValidVideo(video) {
    return video &&
      typeof video.id === "string" &&
      typeof video.level === "string" &&
      Number.isInteger(video.moduleNumber) &&
      typeof video.title === "string" &&
      Number.isInteger(video.durationMinutes) &&
      typeof video.equipment === "string";
  }

  function createCard(video) {
    var card = createElement("article", "course-card reveal");
    card.dataset.videoId = video.id;

    var media = createElement("div", "course-media");
    var tag = createElement("span", "tag mono", video.level);
    var playMark = createElement("div", "play-mark");
    playMark.setAttribute("aria-hidden", "true");
    media.append(tag, playMark);

    var info = createElement("div", "course-info");
    var moduleLabel = "MODULE " + String(video.moduleNumber).padStart(2, "0");
    info.append(
      createElement("span", "lvl mono", moduleLabel),
      createElement("h4", "", video.title),
      createElement("span", "len", video.durationMinutes + " min · " + video.equipment)
    );

    card.append(media, info);
    return card;
  }

  function revealCards() {
    var cards = grid.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (card) { card.classList.add("in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach(function (card) { observer.observe(card); });
  }

  function showError() {
    var message = createElement(
      "p",
      "course-status",
      "The movement library is temporarily unavailable. Please try again later."
    );
    message.setAttribute("role", "alert");
    grid.replaceChildren(message);
    grid.setAttribute("aria-busy", "false");
  }

  fetch("assets/data/videos.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("Unable to load video data");
      return response.json();
    })
    .then(function (videos) {
      if (!Array.isArray(videos) || videos.length === 0 || !videos.every(isValidVideo)) {
        throw new Error("Invalid video data");
      }

      var fragment = document.createDocumentFragment();
      videos
        .slice()
        .sort(function (a, b) { return a.moduleNumber - b.moduleNumber; })
        .forEach(function (video) { fragment.appendChild(createCard(video)); });

      grid.replaceChildren(fragment);
      grid.setAttribute("aria-busy", "false");
      revealCards();
    })
    .catch(showError);
})();
