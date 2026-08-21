(function () {
  "use strict";

  var shell = document.getElementById("main");
  if (!shell) return;

  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-workspace-panel]"));
  var navigation = Array.prototype.slice.call(document.querySelectorAll("[data-workspace-target]"));
  var currentName = document.getElementById("currentWorkspaceName");
  var sidebarVideoCount = document.getElementById("sidebarVideoCount");
  var dashboardVideoCount = document.getElementById("videoCount");
  var railCollapseButton = document.getElementById("railCollapseButton");
  var densityToggle = document.getElementById("densityToggle");
  var commandButton = document.getElementById("commandButton");
  var commandPalette = document.getElementById("commandPalette");
  var commandClose = document.getElementById("commandClose");
  var commandSearch = document.getElementById("commandSearch");
  var commandEmpty = document.getElementById("commandEmpty");
  var commandItems = Array.prototype.slice.call(document.querySelectorAll("[data-command-item]"));
  var labels = {
    overview: "Today",
    "site-copy": "Website",
    sales: "Customers",
    "buyer-access": "Settings",
    "video-library": "Programs",
    "knowledge-base": "Knowledge"
  };
  var scrollPositions = {};
  var activeWorkspace = "overview";
  var activeCommandIndex = 0;
  var RAIL_PREFERENCE_KEY = "legitbodyfix.adminRailCollapsed.v1";
  var DENSITY_PREFERENCE_KEY = "legitbodyfix.adminDensity.v1";

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

  function setRailCollapsed(collapsed) {
    shell.dataset.railCollapsed = collapsed ? "true" : "false";
    if (railCollapseButton) {
      railCollapseButton.setAttribute("aria-expanded", collapsed ? "false" : "true");
      railCollapseButton.setAttribute("aria-label", collapsed ? "Expand navigation" : "Collapse navigation");
    }
    try {
      window.localStorage.setItem(RAIL_PREFERENCE_KEY, collapsed ? "1" : "0");
    } catch (error) {
      // The preference is optional when browser storage is unavailable.
    }
  }

  if (railCollapseButton) {
    var savedRailPreference = "0";
    try {
      savedRailPreference = window.localStorage.getItem(RAIL_PREFERENCE_KEY) || "0";
    } catch (error) {
      savedRailPreference = "0";
    }
    setRailCollapsed(savedRailPreference === "1");
    railCollapseButton.addEventListener("click", function () {
      setRailCollapsed(shell.dataset.railCollapsed !== "true");
    });
  }

  function setCompactDensity(compact) {
    shell.dataset.density = compact ? "compact" : "comfortable";
    if (densityToggle) {
      densityToggle.setAttribute("aria-pressed", compact ? "true" : "false");
      var label = densityToggle.querySelector("b");
      if (label) label.textContent = compact ? "Comfortable" : "Compact";
    }
    try {
      window.localStorage.setItem(DENSITY_PREFERENCE_KEY, compact ? "compact" : "comfortable");
    } catch (error) {
      // Density preference is optional when browser storage is unavailable.
    }
  }

  if (densityToggle) {
    var savedDensity = "comfortable";
    try {
      savedDensity = window.localStorage.getItem(DENSITY_PREFERENCE_KEY) || "comfortable";
    } catch (error) {
      savedDensity = "comfortable";
    }
    setCompactDensity(savedDensity === "compact");
    densityToggle.addEventListener("click", function () {
      setCompactDensity(shell.dataset.density !== "compact");
    });
  }

  function visibleCommandItems() {
    return commandItems.filter(function (item) { return !item.hidden; });
  }

  function highlightCommandItem(index) {
    var visibleItems = visibleCommandItems();
    if (!visibleItems.length) return;
    activeCommandIndex = Math.max(0, Math.min(index, visibleItems.length - 1));
    commandItems.forEach(function (item) { item.classList.remove("is-command-active"); });
    visibleItems[activeCommandIndex].classList.add("is-command-active");
    visibleItems[activeCommandIndex].scrollIntoView({ block: "nearest" });
  }

  function filterCommandItems() {
    if (!commandSearch) return;
    var query = commandSearch.value.trim().toLowerCase();
    commandItems.forEach(function (item) {
      item.hidden = Boolean(query && item.textContent.toLowerCase().indexOf(query) === -1);
    });
    var visibleItems = visibleCommandItems();
    if (commandEmpty) commandEmpty.hidden = visibleItems.length !== 0;
    activeCommandIndex = 0;
    if (visibleItems.length) highlightCommandItem(0);
  }

  function openCommandPalette() {
    if (!commandPalette || !commandSearch) return;
    commandPalette.hidden = false;
    document.body.classList.add("has-command-open");
    commandSearch.value = "";
    filterCommandItems();
    window.requestAnimationFrame(function () { commandSearch.focus(); });
  }

  function closeCommandPalette() {
    if (!commandPalette || commandPalette.hidden) return;
    commandPalette.hidden = true;
    document.body.classList.remove("has-command-open");
    if (commandButton) commandButton.focus();
  }

  if (commandButton && commandPalette && commandSearch) {
    commandButton.addEventListener("click", openCommandPalette);
    if (commandClose) commandClose.addEventListener("click", closeCommandPalette);
    commandPalette.addEventListener("click", function (event) {
      if (event.target === commandPalette) closeCommandPalette();
    });
    commandSearch.addEventListener("input", filterCommandItems);

    commandItems.forEach(function (item) {
      item.addEventListener("click", function (event) {
        var workspaceTarget = item.dataset.commandWorkspace;
        if (workspaceTarget) {
          event.preventDefault();
          showWorkspace(workspaceTarget);
        }
        closeCommandPalette();
      });
    });

    document.addEventListener("keydown", function (event) {
      var typingTarget = event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (commandPalette.hidden) openCommandPalette();
        else closeCommandPalette();
        return;
      }
      if (event.key === "/" && commandPalette.hidden && !typingTarget) {
        event.preventDefault();
        openCommandPalette();
        return;
      }
      if (commandPalette.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeCommandPalette();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        highlightCommandItem(activeCommandIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        highlightCommandItem(activeCommandIndex - 1);
      } else if (event.key === "Enter") {
        var visibleItems = visibleCommandItems();
        if (visibleItems[activeCommandIndex]) {
          event.preventDefault();
          visibleItems[activeCommandIndex].click();
        }
      }
    });
  }

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
  }

  if (sidebarVideoCount && dashboardVideoCount) {
    function syncSidebarVideoCount() {
      sidebarVideoCount.textContent = dashboardVideoCount.textContent || "0";
    }
    syncSidebarVideoCount();
  }

  var sidebarKnowledgeCount = document.getElementById("sidebarKnowledgeCount");
  var dashboardKnowledgeCount = document.getElementById("dashboardKnowledgeCount");
  if (sidebarKnowledgeCount && dashboardKnowledgeCount) {
    function syncKnowledgeCount() {
      dashboardKnowledgeCount.textContent = sidebarKnowledgeCount.textContent || "0";
    }
    syncKnowledgeCount();
  }

  showWorkspace(workspaceFromHash(window.location.hash), { updateHash: false, instant: true });
  window.addEventListener("load", function () {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, { once: true });
}());
