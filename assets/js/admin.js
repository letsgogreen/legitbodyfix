(function () {
  "use strict";

  var DATA_URL = "assets/data/videos.json";
  var DRAFT_KEY = "legitbodyfix.videoDraft.v1";
  var SITE_DATA_URL = "assets/data/site-content.json";
  var SITE_DRAFT_KEY = "legitbodyfix.siteContentDraft.v1";
  var SITE_PREVIEW_KEY = "legitbodyfix.siteContentPreview.v1";
  var SESSION_URL = "/api/admin/session";
  var LOGIN_URL = "/api/admin/login";
  var LOGOUT_URL = "/api/admin/logout";
  var PUBLISH_URL = "/api/admin/videos";
  var UPLOAD_URL = "/api/admin/uploads";
  var STREAM_UPLOAD_URL = "/api/admin/uploads?kind=stream";
  var STREAM_STATUS_URL = "/api/admin/uploads?kind=stream-status";
  var ACCESS_GRANT_URL = "/api/admin/videos";
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
  var accessGrantForm = document.getElementById("accessGrantForm");
  var accessGrantEmail = document.getElementById("accessGrantEmail");
  var accessGrantProgram = document.getElementById("accessGrantProgram");
  var accessGrantButton = document.getElementById("grantAccessButton");
  var accessGrantStatus = document.getElementById("accessGrantStatus");
  var siteContentForm = document.getElementById("siteContentForm");
  var siteContentStatus = document.getElementById("siteContentStatus");
  var publishSiteContentButton = document.getElementById("publishSiteContent");
  var videos = [];
  var siteContent = null;
  var editorStarted = false;
  var activeUploads = 0;

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
      ["method.steps.2.title", "Step 3 title", 50], ["method.steps.2.description", "Step 3 description", 220, true]
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
      if (window.LegitSiteEditor) window.LegitSiteEditor.start();
      else loadSiteContent();
    }
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

  function normalizeVideo(video, index) {
    return {
      id: typeof video.id === "string" && video.id ? video.id : "video-" + Date.now() + "-" + index,
      level: typeof video.level === "string" ? video.level : "FOUNDATIONAL",
      moduleNumber: index + 1,
      title: typeof video.title === "string" ? video.title : "Untitled video",
      description: typeof video.description === "string" ? video.description : "",
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
      } else if (field.name === "price") {
        var trimmedPrice = field.value.trim();
        video.price = trimmedPrice === "" ? null : Math.max(0, Math.min(999, Number(trimmedPrice) || 0));
      } else {
        video[field.name] = field.value.trim();
      }
    });
    editor.querySelector(".editor-title").textContent = video.title || "Untitled video";
    updateSummary();
    saveDraft();
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

      editor.querySelector(".upload-stream-video").addEventListener("click", function () {
        uploadStreamVideo(editor, index);
      });
      editor.querySelector(".check-stream-status").addEventListener("click", function () {
        checkStreamStatus(editor, index);
      });
      editor.querySelector(".upload-thumbnail").addEventListener("click", function () {
        uploadThumbnail(editor, index);
      });
      editor.addEventListener("input", function () { readEditor(editor, index); });
      editor.addEventListener("change", function () { readEditor(editor, index); });
      updateStreamStatus(editor, video);
      list.appendChild(editor);
    });

    list.setAttribute("aria-busy", "false");
    updateSummary();
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
    if (error.status === 401) showLogin();
    else if (error.status === 503) showLogin("Admin login is not configured on this deployment yet.", "error");
    else showLogin("The login service is unavailable. Please try again.", "error");
  });
})();
