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

  function playableUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      var parsed = new URL(value);
      return parsed.protocol === "https:" ? parsed.toString() : "";
    } catch (error) {
      return "";
    }
  }

  function isPurchasablePrice(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  }

  function formatPrice(value) {
    return "$" + (Number.isInteger(value) ? value : value.toFixed(2));
  }

  function createCard(video) {
    var thumbnailUrl = playableUrl(video.thumbnailUrl);
    var hasOwnPrice = isPurchasablePrice(video.price);
    // Every card opens its own persuasive session page. Protected playback
    // remains available only inside the authenticated buyer library.
    var card = createElement("a", "course-card reveal");
    card.dataset.videoId = video.id;
    card.href = "video.html?id=" + encodeURIComponent(video.id);
    card.setAttribute("aria-label", "Learn more about " + video.title);

    var media = createElement("div", "course-media");
    if (thumbnailUrl) {
      var thumbnail = document.createElement("img");
      thumbnail.className = "course-thumbnail";
      thumbnail.src = thumbnailUrl;
      thumbnail.alt = "";
      thumbnail.loading = "lazy";
      thumbnail.decoding = "async";
      media.appendChild(thumbnail);
    }
    var tag = createElement("span", "tag mono", video.level);
    var playMark = createElement("div", "play-mark");
    playMark.setAttribute("aria-hidden", "true");
    media.append(tag, playMark);

    var info = createElement("div", "course-info");
    var moduleLabel = "MODULE " + String(video.moduleNumber).padStart(2, "0");
    var lengthText = video.durationMinutes + " min · " + video.equipment;
    lengthText += hasOwnPrice ? " · " + formatPrice(video.price) : " · in $49 program";
    info.append(
      createElement("span", "lvl mono", moduleLabel),
      createElement("h4", "", video.title),
      createElement("span", "len", lengthText)
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

  function showEmpty() {
    var message = createElement(
      "p",
      "course-status",
      "New movement protocols are being prepared. Please check back soon."
    );
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

      var publishedVideos = videos.filter(function (video) { return video.published !== false; });
      if (publishedVideos.length === 0) {
        showEmpty();
        return;
      }

      var fragment = document.createDocumentFragment();
      publishedVideos
        .slice()
        .sort(function (a, b) { return a.moduleNumber - b.moduleNumber; })
        .forEach(function (video) { fragment.appendChild(createCard(video)); });

      grid.replaceChildren(fragment);
      grid.setAttribute("aria-busy", "false");
      revealCards();
    })
    .catch(showError);
})();
