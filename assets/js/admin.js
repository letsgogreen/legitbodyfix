(function () {
  "use strict";

  var DATA_URL = "assets/data/videos.json";
  var DRAFT_KEY = "legitbodyfix.videoDraft.v1";
  var SESSION_URL = "/api/admin/session";
  var LOGIN_URL = "/api/admin/login";
  var LOGOUT_URL = "/api/admin/logout";
  var PUBLISH_URL = "/api/admin/videos";
  var authGate = document.getElementById("authGate");
  var authStatus = document.getElementById("authStatus");
  var loginForm = document.getElementById("loginForm");
  var loginButton = document.getElementById("loginButton");
  var passwordInput = document.getElementById("adminPassword");
  var logoutButton = document.getElementById("logoutButton");
  var adminShell = document.getElementById("main");
  var list = document.getElementById("editorList");
  var template = document.getElementById("videoEditorTemplate");
  var status = document.getElementById("editorStatus");
  var videoCount = document.getElementById("videoCount");
  var publishedCount = document.getElementById("publishedCount");
  var publishButton = document.getElementById("publishChanges");
  var videos = [];
  var editorStarted = false;

  function setAuthStatus(message, state) {
    authStatus.textContent = message;
    if (state) authStatus.dataset.state = state;
    else delete authStatus.dataset.state;
  }

  function showLogin(message, state) {
    authGate.hidden = false;
    adminShell.hidden = true;
    logoutButton.hidden = true;
    setAuthStatus(message || "Enter the administrator password.", state);
    if (message) passwordInput.focus();
  }

  function showEditor() {
    authGate.hidden = true;
    adminShell.hidden = false;
    logoutButton.hidden = false;
    if (!editorStarted) {
      editorStarted = true;
      load();
    }
  }

  function requestJson(url, options) {
    return fetch(url, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var error = new Error(data.error || "Request failed");
          error.status = response.status;
          error.code = data.error;
          error.details = Array.isArray(data.details) ? data.details : [];
          throw error;
        }
        return data;
      });
    });
  }

  function requestStatus(url, options) {
    return fetch(url, options).then(function (response) {
      if (!response.ok) {
        var error = new Error("Request failed");
        error.status = response.status;
        throw error;
      }
    });
  }

  function setStatus(message, state) {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function normalizeVideo(video, index) {
    return {
      id: typeof video.id === "string" && video.id ? video.id : "video-" + Date.now() + "-" + index,
      level: typeof video.level === "string" ? video.level : "FOUNDATIONAL",
      moduleNumber: index + 1,
      title: typeof video.title === "string" ? video.title : "Untitled video",
      description: typeof video.description === "string" ? video.description : "",
      durationMinutes: Number.isFinite(Number(video.durationMinutes)) ? Number(video.durationMinutes) : 1,
      equipment: typeof video.equipment === "string" ? video.equipment : "Bodyweight",
      videoUrl: typeof video.videoUrl === "string" ? video.videoUrl : "",
      thumbnailUrl: typeof video.thumbnailUrl === "string" ? video.thumbnailUrl : "",
      published: video.published !== false
    };
  }

  function renumber() {
    videos = videos.map(normalizeVideo);
  }

  function updateSummary() {
    videoCount.textContent = String(videos.length);
    publishedCount.textContent = String(videos.filter(function (video) { return video.published; }).length);
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(videos));
    setStatus("Draft saved in this browser at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ".");
  }

  function readEditor(editor, index) {
    var video = videos[index];
    editor.querySelectorAll("[name]").forEach(function (field) {
      if (field.name === "published") {
        video.published = field.checked;
      } else if (field.name === "durationMinutes") {
        video.durationMinutes = Math.max(1, Number(field.value) || 1);
      } else {
        video[field.name] = field.value.trim();
      }
    });
    editor.querySelector(".editor-title").textContent = video.title || "Untitled video";
    updateSummary();
    saveDraft();
  }

  function render() {
    renumber();
    list.replaceChildren();

    videos.forEach(function (video, index) {
      var editor = template.content.firstElementChild.cloneNode(true);
      editor.dataset.videoId = video.id;
      editor.querySelector(".module-chip").textContent = "MODULE " + String(video.moduleNumber).padStart(2, "0");
      editor.querySelector(".editor-title").textContent = video.title;

      editor.querySelectorAll("[name]").forEach(function (field) {
        if (field.name === "published") {
          field.checked = video.published;
        } else {
          field.value = video[field.name] == null ? "" : String(video[field.name]);
        }
      });

      var moveUp = editor.querySelector(".move-up");
      var moveDown = editor.querySelector(".move-down");
      moveUp.disabled = index === 0;
      moveDown.disabled = index === videos.length - 1;

      moveUp.addEventListener("click", function () {
        videos.splice(index - 1, 0, videos.splice(index, 1)[0]);
        render();
        saveDraft();
      });
      moveDown.addEventListener("click", function () {
        videos.splice(index + 1, 0, videos.splice(index, 1)[0]);
        render();
        saveDraft();
      });
      editor.querySelector(".remove-video").addEventListener("click", function () {
        if (!window.confirm("Remove “" + video.title + "” from this draft?")) return;
        videos.splice(index, 1);
        render();
        saveDraft();
      });
      editor.addEventListener("input", function () { readEditor(editor, index); });
      editor.addEventListener("change", function () { readEditor(editor, index); });
      list.appendChild(editor);
    });

    list.setAttribute("aria-busy", "false");
    updateSummary();
  }

  function makeId(title) {
    var slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return (slug || "video") + "-" + Date.now();
  }

  document.getElementById("addVideo").addEventListener("click", function () {
    videos.push(normalizeVideo({ id: makeId("video"), title: "New video", published: false }, videos.length));
    render();
    saveDraft();
    list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("resetDraft").addEventListener("click", function () {
    if (!window.confirm("Clear the browser draft and reload the repository data?")) return;
    localStorage.removeItem(DRAFT_KEY);
    window.location.reload();
  });

  document.getElementById("downloadJson").addEventListener("click", function () {
    renumber();
    var blob = new Blob([JSON.stringify(videos, null, 2) + "\n"], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "videos.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("JSON downloaded. Review it before replacing the live data file.");
  });

  publishButton.addEventListener("click", function () {
    renumber();
    if (!window.confirm("Publish these changes to the live website? Vercel will redeploy automatically.")) return;

    publishButton.disabled = true;
    setStatus("Publishing changes…");

    requestJson(PUBLISH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ videos: videos })
    }).then(function (data) {
      localStorage.removeItem(DRAFT_KEY);
      if (data.unchanged) {
        setStatus("Everything is already up to date on the live website.", "success");
        return;
      }

      var shortSha = typeof data.commitSha === "string" ? data.commitSha.slice(0, 7) : "created";
      setStatus("Published as commit " + shortSha + ". Vercel is updating the live website.", "success");
    }).catch(function (error) {
      if (error.status === 401) {
        showLogin("Your session expired. Sign in again, then publish the saved draft.", "error");
      } else if (error.code === "publishing_disabled_in_preview") {
        setStatus("Publishing is disabled on preview deployments. Use the production admin page.", "error");
      } else if (error.code === "github_publishing_not_configured") {
        setStatus("GitHub publishing is not configured yet.", "error");
      } else if (error.code === "invalid_video_data") {
        setStatus(error.details[0] || "Please correct the invalid video data and try again.", "error");
      } else {
        setStatus("Publishing failed. Your browser draft is still safe; please try again.", "error");
      }
    }).finally(function () {
      publishButton.disabled = false;
    });
  });

  document.getElementById("importJson").addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (!file) return;
    file.text().then(function (text) {
      var imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error("Expected an array of videos");
      videos = imported.map(normalizeVideo);
      render();
      saveDraft();
      setStatus("Imported " + videos.length + " videos into the browser draft.");
    }).catch(function () {
      setStatus("The selected file is not valid video JSON.");
    });
    event.target.value = "";
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    loginButton.disabled = true;
    setAuthStatus("Signing in…");

    requestStatus(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password: passwordInput.value })
    }).then(function () {
      passwordInput.value = "";
      showEditor();
    }).catch(function (error) {
      if (error.status === 401) showLogin("The password is incorrect.", "error");
      else if (error.status === 503) showLogin("Admin login is not configured on this deployment yet.", "error");
      else showLogin("The login service is unavailable. Please try again.", "error");
      passwordInput.select();
    }).finally(function () {
      loginButton.disabled = false;
    });
  });

  logoutButton.addEventListener("click", function () {
    logoutButton.disabled = true;
    requestStatus(LOGOUT_URL, {
      method: "POST",
      credentials: "same-origin"
    }).catch(function () {
      return null;
    }).finally(function () {
      logoutButton.disabled = false;
      showLogin("You have signed out.");
    });
  });

  function load() {
    var draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        videos = JSON.parse(draft).map(normalizeVideo);
        render();
        setStatus("Browser draft restored. Reset it to reload repository data.");
        return;
      } catch (error) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }

    fetch(DATA_URL, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) throw new Error("Unable to load video data");
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error("Invalid video data");
        videos = data.map(normalizeVideo);
        render();
        setStatus("Repository data loaded. Start editing to create a browser draft.");
      })
      .catch(function () {
        list.setAttribute("aria-busy", "false");
        setStatus("Video data could not be loaded. Open this page through a local web server.");
      });
  }

  requestStatus(SESSION_URL, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store"
  }).then(function () {
    showEditor();
  }).catch(function (error) {
    if (error.status === 401) showLogin();
    else if (error.status === 503) showLogin("Admin login is not configured on this deployment yet.", "error");
    else showLogin("The login service is unavailable. Please try again.", "error");
  });
})();
