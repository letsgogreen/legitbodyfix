(function () {
  "use strict";

  var shell = document.getElementById("main");
  if (!shell) return;

  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-workspace-panel]"));
  var navigation = Array.prototype.slice.call(document.querySelectorAll("[data-workspace-target]"));
  var currentName = document.getElementById("currentWorkspaceName");
  var labels = {
    overview: "Dashboard",
    "site-copy": "Website",
    "buyer-access": "Customers",
    "video-library": "Videos"
  };
  var scrollPositions = {};
  var activeWorkspace = "overview";

  function workspaceFromHash(hash) {
    var target = String(hash || "").replace(/^#/, "");
    if (labels[target]) return target;
    if (target.indexOf("site-editor-") === 0) return "site-copy";
    return "overview";
  }

  function showWorkspace(target, options) {
    options = options || {};
    if (!labels[target]) target = "overview";
    scrollPositions[activeWorkspace] = window.scrollY;
    activeWorkspace = target;

    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.workspacePanel !== target;
    });

    navigation.forEach(function (item) {
      var selected = item.dataset.workspaceTarget === target;
      item.classList.toggle("is-active", selected);
      if (selected) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });

    shell.dataset.activeWorkspace = target;
    if (currentName) currentName.textContent = labels[target];

    if (options.updateHash !== false) {
      history.replaceState(null, "", "#" + target);
    }

    window.requestAnimationFrame(function () {
      var nextScroll = options.preserveScroll ? (scrollPositions[target] || 0) : 0;
      window.scrollTo({ top: nextScroll, behavior: options.instant ? "auto" : "smooth" });
      if (options.focusTarget) {
        var focusTarget = document.getElementById(options.focusTarget);
        if (focusTarget) focusTarget.focus({ preventScroll: true });
      }
    });
  }

  navigation.forEach(function (item) {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      showWorkspace(item.dataset.workspaceTarget, { preserveScroll: true });
    });
  });

  document.querySelectorAll("[data-workspace-open]").forEach(function (button) {
    button.addEventListener("click", function () {
      showWorkspace(button.dataset.workspaceOpen, { focusTarget: button.dataset.focusTarget || "" });
    });
  });

  window.addEventListener("hashchange", function () {
    showWorkspace(workspaceFromHash(window.location.hash), { updateHash: false, instant: true });
  });

  var search = document.getElementById("videoSearch");
  var editorList = document.getElementById("editorList");

  function filterVideos() {
    if (!search || !editorList) return;
    var query = search.value.trim().toLowerCase();
    editorList.querySelectorAll(".video-editor").forEach(function (editor) {
      var title = editor.querySelector(".editor-title");
      var matches = !query || (title && title.textContent.toLowerCase().indexOf(query) !== -1);
      editor.hidden = !matches;
    });
  }

  if (search && editorList) {
    var addVideoButton = document.getElementById("addVideo");
    if (addVideoButton) {
      addVideoButton.addEventListener("click", function () {
        search.value = "";
        filterVideos();
      });
    }
    search.addEventListener("input", filterVideos);
    search.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && search.value) {
        search.value = "";
        filterVideos();
      }
    });
    new MutationObserver(filterVideos).observe(editorList, { childList: true, subtree: true, characterData: true });
  }

  showWorkspace(workspaceFromHash(window.location.hash), { updateHash: false, instant: true });
  window.addEventListener("load", function () {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, { once: true });
}());
