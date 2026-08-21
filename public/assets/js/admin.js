(function () {
  "use strict";

  var DATA_URL = "assets/data/videos.json";
  var KNOWLEDGE_DATA_URL = "assets/data/knowledge-base.json";
  var DRAFT_KEY = "legitbodyfix.videoDraft.v1";
  var SITE_DATA_URL = "assets/data/site-content.json";
  var SITE_DRAFT_KEY = "legitbodyfix.siteContentDraft.v1";
  var SITE_PREVIEW_KEY = "legitbodyfix.siteContentPreview.v1";
  var LAUNCH_CHECKS_KEY = "legitbodyfix.launchChecks.v1";
  var SESSION_URL = "/api/admin/session";
  var LOGIN_URL = "/api/admin/login";
  var LOGOUT_URL = "/api/admin/logout";
  var PUBLISH_URL = "/api/admin/videos";
  var UPLOAD_URL = "/api/admin/uploads";
  var STREAM_UPLOAD_URL = "/api/admin/uploads?kind=stream";
  var STREAM_STATUS_URL = "/api/admin/uploads?kind=stream-status";
  var STREAM_PLAYBACK_URL = "/api/admin/uploads?kind=stream-playback";
  var ACCESS_GRANT_URL = "/api/admin/videos";
  var ACCESS_CONFIG_URL = "/api/access/config";
  var SUPABASE_SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
  var authGate = document.getElementById("authGate");
  var authStatus = document.getElementById("authStatus");
  var emailVerificationForm = document.getElementById("emailVerificationForm");
  var emailVerificationButton = document.getElementById("emailVerificationButton");
  var verifiedAdmin = document.getElementById("verifiedAdmin");
  var verifiedAdminEmail = document.getElementById("verifiedAdminEmail");
  var changeAdminEmail = document.getElementById("changeAdminEmail");
  var loginForm = document.getElementById("loginForm");
  var loginButton = document.getElementById("loginButton");
  var emailInput = document.getElementById("adminEmail");
  var passwordInput = document.getElementById("adminPassword");
  var logoutButton = document.getElementById("logoutButton");
  var adminShell = document.getElementById("main");
  var list = document.getElementById("editorList");
  var videoNavigator = document.getElementById("videoSessionNavigator");
  var template = document.getElementById("videoEditorTemplate");
  var status = document.getElementById("editorStatus");
  var videoCount = document.getElementById("videoCount");
  var publishedCount = document.getElementById("publishedCount");
  var missingThumbnailCount = document.getElementById("missingThumbnailCount");
  var streamNotReadyCount = document.getElementById("streamNotReadyCount");
  var unpublishedProgramCount = document.getElementById("unpublishedProgramCount");
  var publishButton = document.getElementById("publishChanges");
  var videoSaveState = document.getElementById("videoEditorSaveState");
  var undoVideoButton = document.getElementById("undoVideoChanges");
  var redoVideoButton = document.getElementById("redoVideoChanges");
  var accessGrantForm = document.getElementById("accessGrantForm");
  var accessGrantEmail = document.getElementById("accessGrantEmail");
  var accessGrantProgram = document.getElementById("accessGrantProgram");
  var accessGrantButton = document.getElementById("grantAccessButton");
  var accessGrantStatus = document.getElementById("accessGrantStatus");
  var siteContentForm = document.getElementById("siteContentForm");
  var siteContentStatus = document.getElementById("siteContentStatus");
  var publishSiteContentButton = document.getElementById("publishSiteContent");
  var videos = [];
  var repositoryVideos = [];
  var videoHistory = [];
  var videoHistoryIndex = -1;
  var videoHistoryKey = "";
  var videoHistoryTime = 0;
  var muscleCatalog = [];
  var siteContent = null;
  var editorStarted = false;
  var activeUploads = 0;
  var supabaseClient = null;
  var supabaseInitialization = null;
  var verifiedSession = null;
  var launchChecksInitialized = false;

  function initializeLaunchChecks() {
    if (launchChecksInitialized) return;
    launchChecksInitialized = true;
    var cards = Array.from(document.querySelectorAll("[data-launch-check]"));
    var count = document.getElementById("launchCheckCount");
    var reset = document.getElementById("resetLaunchChecks");
    var values = {};
    try { values = JSON.parse(localStorage.getItem(LAUNCH_CHECKS_KEY) || "{}"); } catch (error) { values = {}; }

    function renderLaunchChecks() {
      var completed = 0;
      cards.forEach(function (card) {
        var verified = values[card.dataset.launchCheck] === true;
        var button = card.querySelector(".launch-check-toggle");
        card.dataset.verified = verified ? "true" : "false";
        button.setAttribute("aria-pressed", verified ? "true" : "false");
        button.textContent = verified ? "Verified ✓" : "Mark verified";
        if (verified) completed += 1;
      });
      count.textContent = completed + " of " + cards.length + " verified";
      localStorage.setItem(LAUNCH_CHECKS_KEY, JSON.stringify(values));
    }

    cards.forEach(function (card) {
      card.querySelector(".launch-check-toggle").addEventListener("click", function () {
        values[card.dataset.launchCheck] = values[card.dataset.launchCheck] !== true;
        renderLaunchChecks();
      });
    });
    reset.addEventListener("click", function () { values = {}; renderLaunchChecks(); });
    renderLaunchChecks();
  }

  var SITE_FIELDS = [
    { title: "Hero", fields: [
      ["hero.kicker", "Kicker", 80], ["hero.titleLines.0", "Title line 1", 24], ["hero.titleLines.1", "Title line 2", 24],
      ["hero.titleLines.2", "Outlined title line 3", 24], ["hero.titleLines.3", "Outlined title line 4", 24],
      ["hero.description", "Description", 320, true], ["hero.primaryButton", "Primary button", 40], ["hero.secondaryButton", "Secondary button", 40],
      ["hero.proofPoints.0", "Proof point 1", 60], ["hero.proofPoints.1", "Proof point 2", 60], ["hero.proofPoints.2", "Proof point 3", 60]
    ]},
    { title: "Method", fields: [
      ["method.label", "Section label", 80], ["method.titleLines.0", "Title line 1", 40], ["method.titleLines.1", "Title line 2", 40],
      ["method.intro", "Introduction", 360, true], ["method.steps.0.title", "Step 1 title", 50], ["method.steps.0.description", "Step 1 description", 220, true],
      ["method.steps.1.title", "Step 2 title", 50], ["method.steps.1.description", "Step 2 description", 220, true],
      ["method.steps.2.title", "Step 3 title", 50], ["method.steps.2.description", "Step 3 description", 220, true],
      ["method.steps.3.title", "Step 4 title", 50], ["method.steps.3.description", "Step 4 description", 220, true]
    ]},
    { title: "Library preview", fields: [
      ["library.label", "Section label", 80], ["library.titleLines.0", "Title line 1", 40], ["library.titleLines.1", "Title line 2", 40],
      ["library.intro", "Introduction", 320, true], ["library.linkLabel", "Link label", 40]
    ]},
    { title: "Brand statement", fields: [
      ["standard.quote", "Statement", 280, true], ["standard.attribution", "Attribution", 80]
    ]},
    { title: "Program and pricing", fields: [
      ["pricing.label", "Section label", 80], ["pricing.titleLines.0", "Title line 1", 40], ["pricing.titleLines.1", "Title line 2", 40],
      ["pricing.benefits.0", "Benefit 1", 100], ["pricing.benefits.1", "Benefit 2", 100], ["pricing.benefits.2", "Benefit 3", 100], ["pricing.benefits.3", "Benefit 4", 100],
      ["pricing.programName", "Program name", 100], ["pricing.displayPrice", "Displayed price", 20], ["pricing.priceSuffix", "Price suffix", 30],
      ["pricing.description", "Program description", 280, true], ["pricing.buttonLabel", "Button label", 40]
    ]},
    { title: "Footer", fields: [
      ["footer.tagline", "Tagline", 100], ["footer.legal", "Legal note", 220, true]
    ]}
  ];

  function setAuthStatus(message, state) {
    authStatus.textContent = message;
    if (state) authStatus.dataset.state = state;
    else delete authStatus.dataset.state;
  }

  function renderAuthenticationStep() {
    var verified = Boolean(verifiedSession && verifiedSession.access_token && verifiedSession.user);
    emailVerificationForm.hidden = verified;
    verifiedAdmin.hidden = !verified;
    loginForm.hidden = !verified;
    verifiedAdminEmail.textContent = verified ? (verifiedSession.user.email || "Verified administrator") : "";
  }

  function initializeEmailVerification() {
    if (supabaseInitialization) return supabaseInitialization;

    supabaseInitialization = Promise.all([
      requestJson(ACCESS_CONFIG_URL, { cache: "no-store" }),
      import(SUPABASE_SDK_URL)
    ]).then(function (results) {
      var config = results[0];
      var createClient = results[1].createClient;
      supabaseClient = createClient(config.url, config.publishableKey, {
        auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
      });
      return supabaseClient.auth.getSession();
    }).then(function (result) {
      if (result.error) throw result.error;
      verifiedSession = result.data.session || null;
      renderAuthenticationStep();
      return verifiedSession;
    }).catch(function (error) {
      supabaseInitialization = null;
      throw error;
    });

    return supabaseInitialization;
  }

  function getVerifiedAdminSession() {
    return initializeEmailVerification().then(function () {
      return supabaseClient.auth.getSession();
    }).then(function (result) {
      if (result.error || !result.data.session || !result.data.session.access_token) {
        var error = result.error || new Error("Email verification required");
        error.status = 401;
        throw error;
      }
      verifiedSession = result.data.session;
      renderAuthenticationStep();
      return verifiedSession;
    });
  }

  function signOutVerifiedEmail() {
    return initializeEmailVerification().then(function () {
      return supabaseClient.auth.signOut({ scope: "local" });
    }).catch(function () {
      return null;
    }).then(function () {
      verifiedSession = null;
      renderAuthenticationStep();
    });
  }

  function showLogin(message, state) {
    document.body.classList.add("auth-visible");
    authGate.hidden = false;
    adminShell.hidden = true;
    logoutButton.hidden = true;
    renderAuthenticationStep();
    setAuthStatus(message || (verifiedSession
      ? "Email verified. Enter your administrator password."
      : "Verification is required to continue."), state);
    if (verifiedSession) passwordInput.focus();
    else emailInput.focus();
  }

  function showEditor() {
    document.body.classList.remove("auth-visible");
    authGate.hidden = true;
    adminShell.hidden = false;
    logoutButton.hidden = false;
    initializeLaunchChecks();
    if (!editorStarted) {
      editorStarted = true;
      load();
      if (window.LegitSiteEditor) window.LegitSiteEditor.start();
      else loadSiteContent();
    }
    window.dispatchEvent(new CustomEvent("legitbodyfix:admin-authenticated"));
  }

  function readPath(source, path) {
    return path.split(".").reduce(function (value, key) {
      return value != null ? value[key] : undefined;
    }, source);
  }

  function writePath(source, path, value) {
    var keys = path.split(".");
    var target = source;
    keys.slice(0, -1).forEach(function (key) { target = target[key]; });
    target[keys[keys.length - 1]] = value;
  }

  function setSiteContentStatus(message, state) {
    siteContentStatus.textContent = message;
    if (state) siteContentStatus.dataset.state = state;
    else delete siteContentStatus.dataset.state;
  }

  function saveSiteContentDraft() {
    localStorage.setItem(SITE_DRAFT_KEY, JSON.stringify(siteContent));
    setSiteContentStatus("Text draft saved in this browser.");
  }

  function renderSiteContent() {
    siteContentForm.replaceChildren();
    SITE_FIELDS.forEach(function (group, groupIndex) {
      var details = document.createElement("details");
      details.className = "content-group";
      details.open = groupIndex === 0;
      var summary = document.createElement("summary");
      summary.textContent = group.title;
      var grid = document.createElement("div");
      grid.className = "content-field-grid";

      group.fields.forEach(function (definition) {
        var field = document.createElement("label");
        field.className = "field" + (definition[3] ? " field-wide" : "");
        var label = document.createElement("span");
        label.textContent = definition[1];
        var input = document.createElement(definition[3] ? "textarea" : "input");
        if (definition[3]) input.rows = 3;
        else input.type = "text";
        input.maxLength = definition[2];
        input.required = true;
        input.dataset.siteField = definition[0];
        input.value = String(readPath(siteContent, definition[0]) || "");
        input.addEventListener("input", function () {
          writePath(siteContent, definition[0], input.value);
          saveSiteContentDraft();
        });
        field.append(label, input);
        grid.appendChild(field);
      });

      details.append(summary, grid);
      siteContentForm.appendChild(details);
    });
  }

  function fetchSiteContent() {
    return fetch(SITE_DATA_URL, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("Unable to load website content");
      return response.json();
    });
  }

  function loadSiteContent() {
    var draft = localStorage.getItem(SITE_DRAFT_KEY);
    if (draft) {
      try {
        siteContent = JSON.parse(draft);
        renderSiteContent();
        setSiteContentStatus("Website text draft restored from this browser.");
        return;
      } catch (error) {
        localStorage.removeItem(SITE_DRAFT_KEY);
      }
    }

    fetchSiteContent().then(function (content) {
      siteContent = content;
      renderSiteContent();
      setSiteContentStatus("Live website text loaded. Start editing to create a private draft.");
    }).catch(function () {
      setSiteContentStatus("Website text could not be loaded. Refresh and try again.", "error");
    });
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

  function videoSignature(value) { return JSON.stringify(value || []); }

  function updateVideoHistoryControls() {
    if (undoVideoButton) undoVideoButton.disabled = videoHistoryIndex <= 0;
    if (redoVideoButton) redoVideoButton.disabled = videoHistoryIndex < 0 || videoHistoryIndex >= videoHistory.length - 1;
  }

  function updateVideoSaveState(state) {
    if (!videoSaveState) return;
    var effective = state || (videoSignature(videos) === videoSignature(repositoryVideos) ? "live" : "draft");
    var labels = { loading: "Loading", live: "Live version", draft: "Draft saved", publishing: "Publishing" };
    videoSaveState.dataset.state = effective;
    videoSaveState.querySelector("span").textContent = labels[effective] || labels.draft;
    if (publishButton && effective !== "publishing") publishButton.disabled = effective === "live";
  }

  function seedVideoHistory() {
    var liveSnapshot = videoSignature(repositoryVideos);
    var currentSnapshot = videoSignature(videos);
    videoHistory = liveSnapshot !== currentSnapshot ? [liveSnapshot, currentSnapshot] : [currentSnapshot];
    videoHistoryIndex = videoHistory.length - 1;
    videoHistoryKey = "";
    updateVideoHistoryControls();
    updateVideoSaveState();
  }

  function recordVideoHistory(key) {
    var snapshot = videoSignature(videos);
    if (videoHistory[videoHistoryIndex] === snapshot) return;
    var now = Date.now();
    if (key && key === videoHistoryKey && now - videoHistoryTime < 900 && videoHistoryIndex >= 0) {
      videoHistory[videoHistoryIndex] = snapshot;
    } else {
      videoHistory = videoHistory.slice(0, videoHistoryIndex + 1);
      videoHistory.push(snapshot);
      videoHistoryIndex = videoHistory.length - 1;
    }
    videoHistoryKey = key || "";
    videoHistoryTime = now;
    updateVideoHistoryControls();
  }

  function restoreVideoHistory(nextIndex) {
    if (nextIndex < 0 || nextIndex >= videoHistory.length) return;
    videoHistoryIndex = nextIndex;
    videos = JSON.parse(videoHistory[videoHistoryIndex]);
    render();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(videos));
    updateVideoHistoryControls();
    updateVideoSaveState();
    setStatus("Draft history restored.", "draft");
  }

  function normalizeVideo(video, index) {
    var rawId = typeof video.id === "string" && video.id ? video.id : "video-" + Date.now() + "-" + index;
    var id = rawId === "shoulder-reset" ? "ankle-sprain-rehabilitation" : rawId;
    var legacyIds = Array.isArray(video.legacyIds) ? video.legacyIds.filter(function (legacyId) {
      return typeof legacyId === "string" && legacyId && legacyId !== id;
    }) : [];
    if (rawId === "shoulder-reset" && legacyIds.indexOf(rawId) === -1) legacyIds.push(rawId);
    return {
      id: id,
      legacyIds: legacyIds,
      level: typeof video.level === "string" ? video.level : "FOUNDATIONAL",
      moduleNumber: index + 1,
      title: typeof video.title === "string" ? video.title : "Untitled video",
      description: typeof video.description === "string" ? video.description : "",
      landingEyebrow: typeof video.landingEyebrow === "string" ? video.landingEyebrow : "",
      landingHeadline: typeof video.landingHeadline === "string" ? video.landingHeadline : "",
      landingSummary: typeof video.landingSummary === "string" ? video.landingSummary : "",
      landingBenefit1: typeof video.landingBenefit1 === "string" ? video.landingBenefit1 : "",
      landingBenefit2: typeof video.landingBenefit2 === "string" ? video.landingBenefit2 : "",
      landingBenefit3: typeof video.landingBenefit3 === "string" ? video.landingBenefit3 : "",
      landingAudience: typeof video.landingAudience === "string" ? video.landingAudience : "",
      landingReassurance: typeof video.landingReassurance === "string" ? video.landingReassurance : "",
      relatedMuscleGroupIds: normalizeRelatedMuscleGroupIds(video.relatedMuscleGroupIds),
      relatedMuscleIds: normalizeRelatedMuscleIds(video.relatedMuscleIds),
      durationMinutes: Number.isFinite(Number(video.durationMinutes)) ? Number(video.durationMinutes) : 1,
      equipment: typeof video.equipment === "string" ? video.equipment : "Bodyweight",
      price: Number.isFinite(Number(video.price)) && video.price !== "" && video.price !== null && video.price !== undefined
        ? Math.round(Number(video.price) * 100) / 100
        : null,
      programId: typeof video.programId === "string" && video.programId ? video.programId : "neck-shoulder-reset",
      streamVideoId: typeof video.streamVideoId === "string" ? video.streamVideoId : "",
      streamReady: video.streamReady === true,
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
    if (missingThumbnailCount) missingThumbnailCount.textContent = String(videos.filter(function (video) { return !safeThumbnailUrl(video.thumbnailUrl); }).length);
    if (streamNotReadyCount) streamNotReadyCount.textContent = String(videos.filter(function (video) { return !video.streamVideoId || video.streamReady !== true; }).length);
    if (unpublishedProgramCount) unpublishedProgramCount.textContent = String(videos.filter(function (video) { return video.published === false; }).length);
    var sidebarVideoCount = document.getElementById("sidebarVideoCount");
    if (sidebarVideoCount) sidebarVideoCount.textContent = String(videos.length);
  }

  function saveDraft(historyKey) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(videos));
    recordVideoHistory(historyKey);
    updateVideoSaveState();
    setStatus("Draft saved in this browser at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ".");
  }

  function renderVideoNavigator() {
    if (!videoNavigator) return;
    videoNavigator.replaceChildren();
    videos.forEach(function (video) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "video-session-jump";
      button.dataset.mediaState = video.streamVideoId && video.streamReady ? "ready" : video.streamVideoId ? "processing" : "missing";
      var visual = document.createElement("span");
      visual.className = "video-session-jump-visual";
      if (video.thumbnailUrl) {
        var image = document.createElement("img");
        image.src = video.thumbnailUrl;
        image.alt = "";
        image.loading = "lazy";
        image.addEventListener("error", function () { visual.classList.add("is-empty"); image.remove(); });
        visual.appendChild(image);
      } else visual.classList.add("is-empty");
      var copy = document.createElement("span");
      copy.className = "video-session-jump-copy";
      var label = document.createElement("small");
      label.textContent = "MODULE " + String(video.moduleNumber).padStart(2, "0") + (video.published ? " · LIVE" : " · DRAFT");
      var title = document.createElement("strong");
      title.textContent = video.title || "Untitled session";
      var media = document.createElement("em");
      media.textContent = button.dataset.mediaState === "ready" ? "Video ready" : button.dataset.mediaState === "processing" ? "Processing" : "Needs video";
      copy.append(label, title, media);
      button.append(visual, copy);
      button.addEventListener("click", function () {
        var editor = list.querySelector('[data-video-id="' + CSS.escape(video.id) + '"]');
        if (editor) editor.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      videoNavigator.appendChild(button);
    });
  }

  function readEditor(editor, index, historyKey) {
    var video = videos[index];
    editor.querySelectorAll("[name]").forEach(function (field) {
      if (field.name === "published") {
        video.published = field.checked;
      } else if (field.name === "durationMinutes") {
        video.durationMinutes = Math.max(1, Number(field.value) || 1);
      } else if (field.name === "price") {
        var trimmedPrice = field.value.trim();
        video.price = trimmedPrice === "" ? null : Math.max(0, Math.min(999, Number(trimmedPrice) || 0));
      } else {
        video[field.name] = field.value.trim();
      }
    });
    editor.querySelector(".editor-title").textContent = video.title || "Untitled video";
    updateThumbnailPreview(editor, video);
    updateSalesPagePreview(editor, video);
    updateSummary();
    renderVideoNavigator();
    saveDraft(historyKey);
  }

  function normalizeRelatedMuscleIds(value) {
    if (!Array.isArray(value)) return [];
    return value.map(function (id) { return typeof id === "string" ? id.trim() : ""; })
      .filter(function (id, index, values) {
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && values.indexOf(id) === index;
      })
      .slice(0, 8);
  }

  function normalizeRelatedMuscleGroupIds(value) {
    if (!Array.isArray(value)) return [];
    return value.map(function (id) { return typeof id === "string" ? id.trim() : ""; })
      .filter(function (id, index, values) {
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && values.indexOf(id) === index;
      })
      .slice(0, 4);
  }

  function muscleGroupId(value) {
    return String(value || "").toLowerCase().trim()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function muscleGroupLabel(muscle) {
    return muscle && (muscle.family || muscle.group) ? (muscle.family || muscle.group) : "";
  }

  function muscleGroupCatalog() {
    var groups = new Map();
    muscleCatalog.forEach(function (muscle) {
      var label = muscleGroupLabel(muscle);
      var id = muscleGroupId(label);
      if (!id) return;
      if (!groups.has(id)) groups.set(id, { id: id, label: label, muscles: [] });
      groups.get(id).muscles.push(muscle);
    });
    return Array.from(groups.values()).sort(function (left, right) {
      return left.label.localeCompare(right.label);
    });
  }

  function muscleById(id) {
    return muscleCatalog.find(function (muscle) { return muscle.id === id; });
  }

  function muscleLabel(muscle) {
    return muscle && (muscle.title || muscle.name) ? (muscle.title || muscle.name) : "Unknown muscle";
  }

  function renderMuscleSelector(editor, video) {
    var selector = editor.querySelector(".sales-muscle-selector");
    if (!selector) return;
    var search = selector.querySelector(".sales-muscle-search");
    var groupOptions = selector.querySelector(".sales-muscle-group-options");
    var options = selector.querySelector(".sales-muscle-options");
    var count = selector.querySelector(".sales-muscle-count");
    var groupCount = selector.querySelector(".sales-muscle-group-count");

    function drawOptions() {
      var query = search.value.trim().toLowerCase();
      var selectedGroupIds = normalizeRelatedMuscleGroupIds(video.relatedMuscleGroupIds);
      var selectedIds = normalizeRelatedMuscleIds(video.relatedMuscleIds);
      video.relatedMuscleGroupIds = selectedGroupIds;
      video.relatedMuscleIds = selectedIds;
      groupCount.textContent = selectedGroupIds.length + " / 4 groups";
      count.textContent = selectedIds.length + " / 8 muscles";
      groupOptions.replaceChildren();
      options.replaceChildren();

      if (!muscleCatalog.length) {
        groupOptions.appendChild(createMuscleSelectorMessage("Muscle groups unavailable. Your existing selections are still saved."));
        options.appendChild(createMuscleSelectorMessage("Muscle library unavailable. Your existing selections are still saved."));
        return;
      }

      var groups = muscleGroupCatalog().filter(function (group) {
        var searchable = [group.label].concat(group.muscles.map(muscleLabel)).join(" ").toLowerCase();
        return !query || searchable.indexOf(query) !== -1;
      }).sort(function (left, right) {
        var leftSelected = selectedGroupIds.indexOf(left.id) !== -1;
        var rightSelected = selectedGroupIds.indexOf(right.id) !== -1;
        if (leftSelected !== rightSelected) return leftSelected ? -1 : 1;
        return left.label.localeCompare(right.label);
      });

      if (!groups.length) {
        groupOptions.appendChild(createMuscleSelectorMessage("No muscle groups match this search."));
      } else {
        groups.forEach(function (group) {
          var row = document.createElement("label");
          row.className = "sales-muscle-option sales-muscle-group-option";
          var checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = selectedGroupIds.indexOf(group.id) !== -1;
          checkbox.setAttribute("aria-label", "Feature " + group.label + " muscle group");
          var copy = document.createElement("span");
          var title = document.createElement("strong");
          title.textContent = group.label;
          var meta = document.createElement("small");
          meta.textContent = group.muscles.length + (group.muscles.length === 1 ? " muscle" : " muscles");
          copy.append(title, meta);
          row.append(checkbox, copy);
          checkbox.addEventListener("change", function (event) {
            event.stopPropagation();
            var nextIds = normalizeRelatedMuscleGroupIds(video.relatedMuscleGroupIds);
            if (checkbox.checked) {
              if (nextIds.length >= 4) {
                checkbox.checked = false;
                setStatus("Choose up to 4 muscle groups for one sales page.", "error");
                return;
              }
              if (nextIds.indexOf(group.id) === -1) nextIds.push(group.id);
            } else {
              nextIds = nextIds.filter(function (id) { return id !== group.id; });
            }
            video.relatedMuscleGroupIds = nextIds;
            updateSalesPagePreview(editor, video);
            saveDraft();
            drawOptions();
          });
          groupOptions.appendChild(row);
        });
      }

      var matches = muscleCatalog.filter(function (muscle) {
        var searchable = [muscleLabel(muscle), muscle.group, muscle.family, muscle.actions].join(" ").toLowerCase();
        return !query || searchable.indexOf(query) !== -1;
      }).sort(function (left, right) {
        var leftSelected = selectedIds.indexOf(left.id) !== -1;
        var rightSelected = selectedIds.indexOf(right.id) !== -1;
        if (leftSelected !== rightSelected) return leftSelected ? -1 : 1;
        return muscleLabel(left).localeCompare(muscleLabel(right));
      });

      if (!matches.length) {
        options.appendChild(createMuscleSelectorMessage("No muscles match this search."));
        return;
      }

      matches.forEach(function (muscle) {
        var row = document.createElement("label");
        row.className = "sales-muscle-option";
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = selectedIds.indexOf(muscle.id) !== -1;
        checkbox.setAttribute("aria-label", "Feature " + muscleLabel(muscle));
        var copy = document.createElement("span");
        var title = document.createElement("strong");
        title.textContent = muscleLabel(muscle);
        var meta = document.createElement("small");
        meta.textContent = [muscle.group, muscle.family].filter(Boolean).join(" · ") || "Muscle dictionary";
        copy.append(title, meta);
        row.append(checkbox, copy);
        checkbox.addEventListener("change", function (event) {
          event.stopPropagation();
          var nextIds = normalizeRelatedMuscleIds(video.relatedMuscleIds);
          if (checkbox.checked) {
            if (nextIds.length >= 8) {
              checkbox.checked = false;
              setStatus("Choose up to 8 muscles for one sales page.", "error");
              return;
            }
            if (nextIds.indexOf(muscle.id) === -1) nextIds.push(muscle.id);
          } else {
            nextIds = nextIds.filter(function (id) { return id !== muscle.id; });
          }
          video.relatedMuscleIds = nextIds;
          updateSalesPagePreview(editor, video);
          saveDraft();
          drawOptions();
        });
        options.appendChild(row);
      });
    }

    search.addEventListener("input", function (event) {
      event.stopPropagation();
      drawOptions();
    });
    drawOptions();
  }

  function createMuscleSelectorMessage(message) {
    var node = document.createElement("p");
    node.className = "sales-muscle-empty";
    node.textContent = message;
    return node;
  }

  function setAccessGrantStatus(message, state) {
    accessGrantStatus.textContent = message;
    if (state) accessGrantStatus.dataset.state = state;
    else delete accessGrantStatus.dataset.state;
  }

  function updateStreamStatus(editor, video) {
    var message = editor.querySelector(".stream-status");
    if (!message) return;
    if (video.streamReady && video.streamVideoId) {
      message.textContent = "Protected Stream video is ready for buyers.";
      message.dataset.state = "success";
    } else if (video.streamVideoId) {
      message.textContent = "Cloudflare is preparing this protected video. Check processing when it is ready.";
      message.dataset.state = "pending";
    } else {
      message.textContent = "No protected Stream video has been uploaded yet.";
      delete message.dataset.state;
    }
    updateStreamPreviewAvailability(editor, video);
  }

  function safeThumbnailUrl(value) {
    try {
      var url = new URL(String(value || ""), window.location.href);
      return url.protocol === "https:" ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function safeStreamPlayerUrl(value) {
    try {
      var url = new URL(String(value || ""));
      return url.protocol === "https:" && /\.cloudflarestream\.com$/i.test(url.hostname) && /\/iframe\/?$/i.test(url.pathname)
        ? url.href
        : "";
    } catch (error) {
      return "";
    }
  }

  function updateThumbnailPreview(editor, video) {
    var image = editor.querySelector(".thumbnail-preview-image");
    var empty = editor.querySelector(".thumbnail-preview-empty");
    var url = safeThumbnailUrl(video.thumbnailUrl);
    image.alt = (video.title || "Movement session") + " thumbnail";
    if (!url) {
      image.hidden = true;
      image.removeAttribute("src");
      empty.hidden = false;
      return;
    }
    image.src = url;
    image.hidden = false;
    empty.hidden = true;
  }

  function salesPageHref(video) {
    return "video.html?id=" + encodeURIComponent(String(video.id || ""));
  }

  function updateSalesPagePreview(editor, video) {
    var preview = editor.querySelector(".sales-page-preview-card");
    if (!preview) return;

    var thumbnail = safeThumbnailUrl(video.thumbnailUrl);
    var image = preview.querySelector(".sales-preview-image");
    var imageEmpty = preview.querySelector(".sales-preview-image-empty");
    image.alt = (video.title || "Movement session") + " sales page thumbnail";
    if (thumbnail) {
      image.src = thumbnail;
      image.hidden = false;
      imageEmpty.hidden = true;
    } else {
      image.hidden = true;
      image.removeAttribute("src");
      imageEmpty.hidden = false;
    }

    preview.querySelector(".sales-preview-eyebrow").textContent = video.landingEyebrow || "Movement session";
    preview.querySelector(".sales-preview-headline").textContent = video.landingHeadline || video.title || "Untitled session";
    preview.querySelector(".sales-preview-summary").textContent = video.landingSummary || video.description || "Add a short summary that explains the outcome of this session.";

    var benefits = [video.landingBenefit1, video.landingBenefit2, video.landingBenefit3].filter(Boolean);
    var list = preview.querySelector(".sales-preview-benefits");
    list.replaceChildren();
    benefits.forEach(function (benefit) {
      var item = document.createElement("li");
      item.textContent = benefit;
      list.appendChild(item);
    });
    list.hidden = benefits.length === 0;

    var selectedGroupIds = normalizeRelatedMuscleGroupIds(video.relatedMuscleGroupIds);
    var groupsById = muscleGroupCatalog().reduce(function (index, group) { index[group.id] = group; return index; }, {});
    var selectedGroups = selectedGroupIds.map(function (id) { return groupsById[id]; }).filter(Boolean);
    var muscles = normalizeRelatedMuscleIds(video.relatedMuscleIds).map(muscleById).filter(function (muscle) {
      return muscle && selectedGroupIds.indexOf(muscleGroupId(muscleGroupLabel(muscle))) === -1;
    });
    var muscleSection = preview.querySelector(".sales-preview-muscles");
    var muscleList = preview.querySelector(".sales-preview-muscle-list");
    muscleList.replaceChildren();
    selectedGroups.forEach(function (group) {
      var chip = document.createElement("span");
      chip.textContent = group.label + " group";
      chip.dataset.kind = "group";
      muscleList.appendChild(chip);
    });
    muscles.forEach(function (muscle) {
      var chip = document.createElement("span");
      chip.textContent = muscleLabel(muscle);
      muscleList.appendChild(chip);
    });
    muscleSection.hidden = selectedGroups.length + muscles.length === 0;

    preview.querySelector(".sales-preview-price").textContent = video.price == null
      ? "Included in package"
      : "$" + Number(video.price).toFixed(2) + " USD";
    editor.querySelector(".preview-sales-page").href = salesPageHref(video);
  }

  function showEditorPanel(editor, panelName) {
    editor.querySelectorAll("[data-editor-tab]").forEach(function (button) {
      var isActive = button.dataset.editorTab === panelName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    editor.querySelectorAll("[data-editor-panel]").forEach(function (panel) {
      panel.hidden = panel.dataset.editorPanel !== panelName;
    });
  }

  function closeStreamPreview(editor) {
    var frame = editor.querySelector(".stream-preview-player");
    var empty = editor.querySelector(".stream-preview-empty");
    frame.hidden = true;
    frame.removeAttribute("src");
    empty.hidden = false;
    editor.querySelector(".close-stream-preview").hidden = true;
  }

  function updateStreamPreviewAvailability(editor, video) {
    var button = editor.querySelector(".preview-stream-video");
    var message = editor.querySelector(".stream-preview-empty");
    var statusMessage = editor.querySelector(".stream-preview-status");
    var card = editor.querySelector(".stream-media-card");
    var badge = editor.querySelector(".stream-media-badge");
    var isReady = video.streamReady === true && Boolean(video.streamVideoId);
    button.disabled = !isReady;
    if (!video.streamVideoId) {
      card.dataset.streamState = "empty";
      badge.dataset.state = "empty";
      badge.textContent = "Not uploaded";
      button.textContent = "No video uploaded";
      message.textContent = "Upload a protected video to preview it here.";
      statusMessage.textContent = "The player opens only when requested.";
    } else if (!video.streamReady) {
      card.dataset.streamState = "processing";
      badge.dataset.state = "processing";
      badge.textContent = "Processing";
      button.textContent = "Video processing";
      message.textContent = "Cloudflare is still preparing this video.";
      statusMessage.textContent = "Click Check processing before trying to play it.";
    } else {
      card.dataset.streamState = "ready";
      badge.dataset.state = "ready";
      badge.textContent = "Uploaded · Ready";
      button.textContent = "Play uploaded video";
      message.textContent = "Video uploaded successfully. It is ready to play.";
      statusMessage.textContent = "Playback uses a short-lived, non-downloadable viewing link.";
    }
    if (editor.dataset.previewVideoId && editor.dataset.previewVideoId !== video.streamVideoId) {
      delete editor.dataset.previewVideoId;
      closeStreamPreview(editor);
    }
  }

  function previewStreamVideo(editor, index) {
    var video = videos[index];
    var button = editor.querySelector(".preview-stream-video");
    var frame = editor.querySelector(".stream-preview-player");
    var empty = editor.querySelector(".stream-preview-empty");
    var closeButton = editor.querySelector(".close-stream-preview");
    var statusMessage = editor.querySelector(".stream-preview-status");
    if (!video.streamReady || !video.streamVideoId) {
      setStatus("Wait until Cloudflare Stream finishes processing this video.", "error");
      return;
    }

    button.disabled = true;
    button.textContent = "Opening video...";
    statusMessage.textContent = "Creating a secure admin preview...";
    requestJson(STREAM_PLAYBACK_URL + "&streamVideoId=" + encodeURIComponent(video.streamVideoId), {
      method: "GET",
      credentials: "same-origin"
    }).then(function (details) {
      var playerUrl = safeStreamPlayerUrl(details.playerUrl);
      if (!playerUrl) throw new Error("invalid_stream_player_url");
      frame.title = (video.title || "Movement session") + " protected video preview";
      frame.src = playerUrl;
      frame.hidden = false;
      empty.hidden = true;
      closeButton.hidden = false;
      editor.dataset.previewVideoId = video.streamVideoId;
      statusMessage.textContent = "Secure preview ready. The viewing link expires automatically.";
      setStatus("Protected video preview opened.", "success");
    }).catch(function (error) {
      if (error.status === 401) {
        showLogin("Your session expired. Sign in again, then reopen the preview.", "error");
      } else if (error.code === "stream_video_not_ready") {
        video.streamReady = false;
        updateStreamStatus(editor, video);
        saveDraft();
        setStatus("Cloudflare is still preparing this video. Check processing again shortly.", "error");
      } else {
        statusMessage.textContent = "The protected preview could not be opened.";
        setStatus("Video preview is unavailable right now. Please try again.", "error");
      }
    }).finally(function () {
      button.disabled = !(video.streamReady && video.streamVideoId);
      button.textContent = video.streamReady && video.streamVideoId ? "Play uploaded video" : "Video unavailable";
    });
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

      editor.querySelectorAll("[data-editor-tab]").forEach(function (button) {
        button.addEventListener("click", function () {
          showEditorPanel(editor, button.dataset.editorTab);
        });
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

      editor.querySelector(".upload-stream-video").addEventListener("click", function () {
        uploadStreamVideo(editor, index);
      });
      editor.querySelector(".check-stream-status").addEventListener("click", function () {
        checkStreamStatus(editor, index);
      });
      editor.querySelector(".preview-stream-video").addEventListener("click", function () {
        previewStreamVideo(editor, index);
      });
      editor.querySelector(".close-stream-preview").addEventListener("click", function () {
        delete editor.dataset.previewVideoId;
        closeStreamPreview(editor);
      });
      editor.querySelector(".upload-thumbnail").addEventListener("click", function () {
        uploadThumbnail(editor, index);
      });
      editor.querySelector(".thumbnail-preview-image").addEventListener("error", function (event) {
        event.currentTarget.hidden = true;
        event.currentTarget.removeAttribute("src");
        editor.querySelector(".thumbnail-preview-empty").textContent = "This thumbnail could not be loaded. Check its URL or upload another image.";
        editor.querySelector(".thumbnail-preview-empty").hidden = false;
      });
      editor.querySelector(".sales-preview-image").addEventListener("error", function (event) {
        event.currentTarget.hidden = true;
        event.currentTarget.removeAttribute("src");
        editor.querySelector(".sales-preview-image-empty").hidden = false;
      });
      editor.addEventListener("input", function (event) { readEditor(editor, index, video.id + ":" + (event.target.name || "field")); });
      editor.addEventListener("change", function (event) { readEditor(editor, index, video.id + ":" + (event.target.name || "field")); });
      updateThumbnailPreview(editor, video);
      renderMuscleSelector(editor, video);
      updateSalesPagePreview(editor, video);
      updateStreamStatus(editor, video);
      list.appendChild(editor);
    });

    list.setAttribute("aria-busy", "false");
    updateSummary();
    renderVideoNavigator();
  }

  function makeId(title) {
    var slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return (slug || "video") + "-" + Date.now();
  }

  function uploadContentType(file) {
    var type = String(file.type || "").toLowerCase();
    if (["video/mp4", "video/webm", "video/quicktime"].indexOf(type) !== -1) return type;

    var name = String(file.name || "").toLowerCase();
    if (/\.mp4$/.test(name)) return "video/mp4";
    if (/\.webm$/.test(name)) return "video/webm";
    if (/\.mov$/.test(name)) return "video/quicktime";
    return "";
  }

  function thumbnailContentType(file) {
    var type = String(file.type || "").toLowerCase();
    if (["image/jpeg", "image/png", "image/webp"].indexOf(type) !== -1) return type;

    var name = String(file.name || "").toLowerCase();
    if (/\.(jpg|jpeg)$/.test(name)) return "image/jpeg";
    if (/\.png$/.test(name)) return "image/png";
    if (/\.webp$/.test(name)) return "image/webp";
    return "";
  }

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
    return (bytes / (1024 * 1024)).toFixed(bytes >= 1024 * 1024 * 1024 ? 0 : 1) + " MB";
  }

  function uploadAsset(editor, index, options) {
    var fileInput = editor.querySelector(options.fileInputSelector);
    var uploadButton = editor.querySelector(options.buttonSelector);
    var file = fileInput.files && fileInput.files[0];
    if (!file) {
      setStatus(options.chooseMessage, "error");
      return;
    }

    var contentType = options.contentType(file);
    if (!contentType) {
      setStatus(options.invalidMessage, "error");
      return;
    }

    uploadButton.disabled = true;
    activeUploads += 1;
    setStatus("Preparing a secure " + options.label + " upload for " + file.name + "…");

    var uploadDetails;
    requestJson(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        fileName: file.name,
        contentType: contentType,
        size: file.size,
        kind: options.kind
      })
    }).then(function (details) {
      uploadDetails = details;
      setStatus("Uploading " + options.label + " " + file.name + " (" + formatFileSize(file.size) + ") directly to R2…");
      return fetch(uploadDetails.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": uploadDetails.contentType },
        body: file
      });
    }).then(function (response) {
      if (!response.ok) throw new Error("R2 rejected the upload.");

      videos[index][options.urlField] = uploadDetails.assetUrl || uploadDetails.videoUrl;
      editor.querySelector('[name="' + options.urlField + '"]').value = videos[index][options.urlField];
      fileInput.value = "";
      readEditor(editor, index);
      setStatus(options.completeMessage, "success");
    }).catch(function (error) {
      if (error.status === 401) {
        showLogin("Your session expired. Sign in again, then retry the upload.", "error");
      } else if (error.code === "uploads_disabled_in_preview") {
        setStatus("Uploads are disabled on preview deployments. Use the production admin page.", "error");
      } else if (error.code === "unsupported_video_type" || error.code === "invalid_file_size" ||
          error.code === "unsupported_thumbnail_type" || error.code === "invalid_thumbnail_size") {
        setStatus(options.invalidMessage, "error");
      } else if (error instanceof TypeError) {
        setStatus("The upload was blocked. Check the R2 CORS policy, then try again.", "error");
      } else {
        setStatus("Upload failed. Your browser draft is still safe; please try again.", "error");
      }
    }).finally(function () {
      activeUploads -= 1;
      uploadButton.disabled = false;
    });
  }


  function uploadTusFile(file, uploadUrl, progress) {
    var chunkSize = 50 * 1024 * 1024;
    var headers = { "Tus-Resumable": "1.0.0" };

    return fetch(uploadUrl, { method: "HEAD", headers: headers }).then(function (response) {
      if (!response.ok) throw new Error("Cloudflare Stream could not resume the upload.");
      var offset = Number(response.headers.get("Upload-Offset"));
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > file.size) {
        throw new Error("Cloudflare Stream returned an invalid upload position.");
      }

      function uploadNext() {
        if (offset >= file.size) return Promise.resolve();
        var end = Math.min(offset + chunkSize, file.size);
        var chunk = file.slice(offset, end);
        progress(end, file.size);
        return fetch(uploadUrl, {
          method: "PATCH",
          headers: {
            "Tus-Resumable": "1.0.0",
            "Upload-Offset": String(offset),
            "Content-Type": "application/offset+octet-stream"
          },
          body: chunk
        }).then(function (response) {
          if (!response.ok) throw new Error("Cloudflare Stream rejected the upload.");
          var nextOffset = Number(response.headers.get("Upload-Offset"));
          if (!Number.isSafeInteger(nextOffset) || nextOffset <= offset || nextOffset > file.size) {
            throw new Error("Cloudflare Stream did not confirm the uploaded chunk.");
          }
          offset = nextOffset;
          return uploadNext();
        });
      }

      return uploadNext();
    });
  }

  function uploadToStream(file, uploadDetails) {
    if (uploadDetails.protocol === "tus") {
      return uploadTusFile(file, uploadDetails.uploadUrl, function (uploaded, total) {
        setStatus("Uploading protected video " + file.name + " (" + Math.round(uploaded / total * 100) + "%)...");
      });
    }

    var form = new FormData();
    form.append("file", file, file.name);
    return fetch(uploadDetails.uploadUrl, { method: "POST", body: form }).then(function (response) {
      if (!response.ok) throw new Error("Cloudflare Stream rejected the upload.");
    });
  }

  function streamErrorMessage(error) {
    if (error.status === 401) {
      showLogin("Your session expired. Sign in again, then retry the upload.", "error");
      return "";
    }
    if (error.code === "stream_upload_not_configured") {
      var details = Array.isArray(error.details) && error.details.length ? " Check: " + error.details.join(", ") + "." : "";
      return "Cloudflare Stream is not configured yet." + details;
    }
    if (error.code === "uploads_disabled_in_preview") {
      return "Uploads are disabled on preview deployments. Use the production admin page.";
    }
    if (error.code === "invalid_upload_size") {
      return "This video file is too large or empty. Choose a video smaller than 30 GB.";
    }
    if (error instanceof TypeError) {
      return "The protected upload was blocked. Check your connection and try again.";
    }
    return "Protected video upload failed. Your browser draft is still safe; please try again.";
  }

  function uploadStreamVideo(editor, index) {
    var fileInput = editor.querySelector(".stream-video-file");
    var uploadButton = editor.querySelector(".upload-stream-video");
    var file = fileInput.files && fileInput.files[0];
    if (!file) {
      setStatus("Choose an MP4, WebM, or MOV video file before uploading.", "error");
      return;
    }

    var contentType = uploadContentType(file);
    if (!contentType) {
      setStatus("This video file is not supported. Use MP4, WebM, or MOV.", "error");
      return;
    }

    uploadButton.disabled = true;
    activeUploads += 1;
    setStatus("Preparing a protected Stream upload for " + file.name + "...");

    var uploadDetails;
    requestJson(STREAM_UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ fileName: file.name, contentType: contentType, size: file.size })
    }).then(function (details) {
      uploadDetails = details;
      setStatus("Uploading protected video " + file.name + " (" + formatFileSize(file.size) + ") to Cloudflare Stream...");
      return uploadToStream(file, uploadDetails);
    }).then(function () {
      videos[index].streamVideoId = uploadDetails.streamVideoId;
      videos[index].streamReady = false;
      fileInput.value = "";
      updateStreamStatus(editor, videos[index]);
      saveDraft();
      setStatus("Upload received. Cloudflare is preparing the protected video. Click Check processing until it is ready.", "success");
    }).catch(function (error) {
      var message = streamErrorMessage(error);
      if (message) setStatus(message, "error");
    }).finally(function () {
      activeUploads -= 1;
      uploadButton.disabled = false;
    });
  }

  function checkStreamStatus(editor, index) {
    var video = videos[index];
    var button = editor.querySelector(".check-stream-status");
    if (!video.streamVideoId) {
      setStatus("Upload a protected Stream video before checking its processing status.", "error");
      return;
    }

    button.disabled = true;
    requestJson(STREAM_STATUS_URL + "&streamVideoId=" + encodeURIComponent(video.streamVideoId), {
      method: "GET",
      credentials: "same-origin"
    }).then(function (details) {
      video.streamReady = details.ready === true;
      updateStreamStatus(editor, video);
      saveDraft();
      if (video.streamReady) {
        setStatus("Protected video is ready. Click Publish changes when you want buyers to see it.", "success");
      } else {
        setStatus("Cloudflare is still processing this video (" + (details.state || "pending") + "). Try again shortly.");
      }
    }).catch(function (error) {
      var message = streamErrorMessage(error);
      if (message) setStatus(message, "error");
    }).finally(function () {
      button.disabled = false;
    });
  }

  function uploadThumbnail(editor, index) {
    uploadAsset(editor, index, {
      kind: "thumbnail",
      label: "thumbnail",
      fileInputSelector: ".thumbnail-file",
      buttonSelector: ".upload-thumbnail",
      urlField: "thumbnailUrl",
      contentType: thumbnailContentType,
      chooseMessage: "Choose a JPG, PNG, or WebP thumbnail image before uploading.",
      invalidMessage: "This thumbnail is not supported. Use JPG, PNG, or WebP files up to 10 MB.",
      completeMessage: "Thumbnail upload complete. Review the thumbnail URL, then click Publish changes to update the live website."
    });
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
    videos = JSON.parse(JSON.stringify(repositoryVideos));
    render();
    seedVideoHistory();
    setStatus("Draft discarded. Live video data restored.", "success");
  });

  if (undoVideoButton) undoVideoButton.addEventListener("click", function () { restoreVideoHistory(videoHistoryIndex - 1); });
  if (redoVideoButton) redoVideoButton.addEventListener("click", function () { restoreVideoHistory(videoHistoryIndex + 1); });

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

  accessGrantForm.addEventListener("submit", function (event) {
    event.preventDefault();
    accessGrantButton.disabled = true;
    setAccessGrantStatus("Granting library access...");

    requestJson(ACCESS_GRANT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "grant-access",
        email: accessGrantEmail.value,
        programId: accessGrantProgram.value
      })
    }).then(function (data) {
      accessGrantEmail.value = "";
      setAccessGrantStatus("Access granted to " + data.email + ". They can now sign in to the library.", "success");
    }).catch(function (error) {
      if (error.status === 401) {
        showLogin("Your session expired. Sign in again, then retry the access grant.", "error");
      } else if (error.code === "access_grants_disabled_in_preview") {
        setAccessGrantStatus("Access grants are disabled on preview deployments. Use the production admin page.", "error");
      } else if (error.code === "invalid_access_grant" || error.code === "unknown_program") {
        setAccessGrantStatus("Enter a valid email address and program.", "error");
      } else if (error.code === "access_service_not_configured") {
        setAccessGrantStatus("Buyer access is not configured on this deployment yet.", "error");
      } else {
        setAccessGrantStatus("Access could not be granted. Please try again.", "error");
      }
    }).finally(function () {
      accessGrantButton.disabled = false;
    });
  });

  publishButton.addEventListener("click", function () {
    renumber();
    if (activeUploads > 0) {
      setStatus("Wait for the current video upload to finish before publishing.", "error");
      return;
    }
    if (!window.confirm("Publish these changes to the live website? Vercel will redeploy automatically.")) return;

    publishButton.disabled = true;
    updateVideoSaveState("publishing");
    setStatus("Publishing changes…");

    requestJson(PUBLISH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ videos: videos })
    }).then(function (data) {
      localStorage.removeItem(DRAFT_KEY);
      repositoryVideos = JSON.parse(JSON.stringify(videos));
      seedVideoHistory();
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
      updateVideoSaveState();
    });
  });

  if (!window.LegitSiteEditor) {
  document.getElementById("previewSiteContent").addEventListener("click", function () {
    if (!siteContent) {
      setSiteContentStatus("Website text is still loading.", "error");
      return;
    }
    localStorage.setItem(SITE_PREVIEW_KEY, JSON.stringify(siteContent));
    window.open("index.html?content-preview=1", "_blank");
    setSiteContentStatus("Preview opened in a new tab. Only this browser can see that draft.", "success");
  });

  document.getElementById("resetSiteContent").addEventListener("click", function () {
    localStorage.removeItem(SITE_DRAFT_KEY);
    localStorage.removeItem(SITE_PREVIEW_KEY);
    setSiteContentStatus("Reloading the current live website text…");
    fetchSiteContent().then(function (content) {
      siteContent = content;
      renderSiteContent();
      setSiteContentStatus("Text draft cleared. Live website text restored.", "success");
    }).catch(function () {
      setSiteContentStatus("Website text could not be reloaded. Refresh and try again.", "error");
    });
  });

  publishSiteContentButton.addEventListener("click", function () {
    if (!siteContent || !siteContentForm.reportValidity()) return;
    publishSiteContentButton.disabled = true;
    setSiteContentStatus("Publishing website text…");

    requestJson(PUBLISH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "publish-site-content", content: siteContent })
    }).then(function (data) {
      localStorage.removeItem(SITE_DRAFT_KEY);
      localStorage.removeItem(SITE_PREVIEW_KEY);
      if (data.unchanged) {
        setSiteContentStatus("The live website already uses this text.", "success");
        return;
      }
      var shortSha = typeof data.commitSha === "string" ? data.commitSha.slice(0, 7) : "created";
      setSiteContentStatus("Published as commit " + shortSha + ". Vercel is updating the live website.", "success");
    }).catch(function (error) {
      if (error.status === 401) {
        showLogin("Your session expired. Sign in again, then publish the saved text draft.", "error");
      } else if (error.code === "publishing_disabled_in_preview") {
        setSiteContentStatus("Publishing is disabled on preview deployments. Use the production admin page.", "error");
      } else if (error.code === "invalid_site_content") {
        setSiteContentStatus(error.details[0] || "Please correct the website text and try again.", "error");
      } else if (error.code === "github_publishing_not_configured") {
        setSiteContentStatus("GitHub publishing is not configured yet.", "error");
      } else {
        setSiteContentStatus("Publishing failed. Your browser draft is still safe; please try again.", "error");
      }
    }).finally(function () {
      publishSiteContentButton.disabled = false;
    });
  });
  }

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

  emailVerificationForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var email = emailInput.value.trim().toLowerCase();
    if (!email || !emailInput.checkValidity()) {
      setAuthStatus("Enter a valid administrator email address.", "error");
      emailInput.focus();
      return;
    }

    emailVerificationButton.disabled = true;
    setAuthStatus("Sending a secure verification link…");
    initializeEmailVerification().then(function () {
      return supabaseClient.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin + "/admin.html",
          shouldCreateUser: false
        }
      });
    }).then(function (result) {
      if (result.error) throw result.error;
      setAuthStatus("If this address is authorized, a verification link will arrive shortly.");
    }).catch(function (error) {
      console.error("Admin email verification failed:", error && error.message ? error.message : error);
      setAuthStatus("The verification request could not be completed. Please try again shortly.", "error");
    }).finally(function () {
      emailVerificationButton.disabled = false;
    });
  });

  changeAdminEmail.addEventListener("click", function () {
    changeAdminEmail.disabled = true;
    signOutVerifiedEmail().finally(function () {
      changeAdminEmail.disabled = false;
      passwordInput.value = "";
      showLogin("Verification is required to continue.");
    });
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    loginButton.disabled = true;
    setAuthStatus("Confirming both security checks…");

    getVerifiedAdminSession().then(function (session) {
      return requestJson(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + session.access_token
        },
        credentials: "same-origin",
        body: JSON.stringify({ password: passwordInput.value })
      });
    }).then(function () {
      passwordInput.value = "";
      showEditor();
    }).catch(function (error) {
      if (error.status === 401) showLogin("Email verification or administrator password is invalid.", "error");
      else if (error.status === 503) showLogin("Admin login is not configured on this deployment yet.", "error");
      else showLogin("The login service is unavailable. Please try again.", "error");
      passwordInput.select();
    }).finally(function () {
      loginButton.disabled = false;
    });
  });

  logoutButton.addEventListener("click", function () {
    logoutButton.disabled = true;
    Promise.all([requestStatus(LOGOUT_URL, {
      method: "POST",
      credentials: "same-origin"
    }).catch(function () {
      return null;
    }), signOutVerifiedEmail()]).finally(function () {
      logoutButton.disabled = false;
      showLogin("You have signed out.");
    });
  });

  function load() {
    var draft = localStorage.getItem(DRAFT_KEY);
    var draftVideos = null;
    if (draft) try {
      draftVideos = JSON.parse(draft);
      if (!Array.isArray(draftVideos)) throw new Error("Invalid browser draft");
    } catch (error) {
      localStorage.removeItem(DRAFT_KEY);
    }

    Promise.all([
      fetch(DATA_URL, { cache: "no-cache" }).then(function (response) {
        if (!response.ok) throw new Error("Unable to load video data");
        return response.json();
      }),
      fetch(KNOWLEDGE_DATA_URL, { cache: "no-cache" }).then(function (response) {
        if (!response.ok) return { muscles: [] };
        return response.json();
      }).catch(function () { return { muscles: [] }; })
    ])
      .then(function (results) {
        var data = results[0];
        var knowledge = results[1];
        if (!Array.isArray(data)) throw new Error("Invalid video data");
        muscleCatalog = knowledge && Array.isArray(knowledge.muscles)
          ? knowledge.muscles.filter(function (muscle) { return muscle && muscle.published !== false && muscle.id; })
          : [];
        repositoryVideos = data.map(normalizeVideo);
        if (draftVideos && window.LegitAdminVideoDraft) {
          var reconciled = window.LegitAdminVideoDraft.reconcile(repositoryVideos, draftVideos);
          videos = reconciled.videos.map(normalizeVideo);
          localStorage.setItem(DRAFT_KEY, JSON.stringify(videos));
          render();
          seedVideoHistory();
          setStatus(reconciled.recovered > 0
            ? "Browser draft restored and synced with the saved protected video."
            : "Browser draft restored. Reset it to reload all repository data.");
          return;
        }
        videos = repositoryVideos;
        render();
        seedVideoHistory();
        setStatus("Repository data loaded. Start editing to create a browser draft.");
      })
      .catch(function () {
        if (draftVideos) {
          videos = draftVideos;
          repositoryVideos = JSON.parse(JSON.stringify(draftVideos));
          render();
          seedVideoHistory();
          setStatus("Browser draft restored. Saved repository data could not be checked.", "error");
          return;
        }
        list.setAttribute("aria-busy", "false");
        setStatus("Video data could not be loaded. Open this page through a local web server.");
      });
  }

  var localDesignPreview = ["127.0.0.1", "localhost"].indexOf(window.location.hostname) !== -1 &&
    new URLSearchParams(window.location.search).get("design-preview") === "1";

  if (localDesignPreview) {
    showEditor();
    return;
  }

  requestStatus(SESSION_URL, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store"
  }).then(function () {
    showEditor();
  }).catch(function (error) {
    if (error.status === 401) {
      initializeEmailVerification().then(function (session) {
        showLogin(session ? "Email verified. Enter your administrator password." : null);
      }).catch(function () {
        showLogin("The email verification service is unavailable. Please try again.", "error");
      });
    }
    else if (error.status === 503) showLogin("Admin login is not configured on this deployment yet.", "error");
    else showLogin("The login service is unavailable. Please try again.", "error");
  });
})();
