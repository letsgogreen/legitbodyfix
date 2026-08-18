import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

var client;
var activeSession;
var loadingPanel = document.getElementById("loadingPanel");
var authPanel = document.getElementById("authPanel");
var libraryPanel = document.getElementById("libraryPanel");
var form = document.getElementById("magicLinkForm");
var emailInput = document.getElementById("email");
var authMessage = document.getElementById("authMessage");
var buyerEmail = document.getElementById("buyerEmail");
var programGrid = document.getElementById("programGrid");
var sessionSection = document.getElementById("sessionSection");
var sessionGrid = document.getElementById("sessionGrid");
var playbackPanel = document.getElementById("playbackPanel");
var playbackTitle = document.getElementById("playbackTitle");
var playerFrame = document.getElementById("playerFrame");
var closePlayerButton = document.getElementById("closePlayerButton");
var libraryStatus = document.getElementById("libraryStatus");
var signOutButton = document.getElementById("signOutButton");
var accountTabs = Array.from(document.querySelectorAll("[data-account-tab]"));
var libraryView = document.getElementById("libraryView");
var profileView = document.getElementById("profileView");
var profileEmail = document.getElementById("profileEmail");
var activeProgramCount = document.getElementById("activeProgramCount");
var purchaseCount = document.getElementById("purchaseCount");
var purchaseList = document.getElementById("purchaseList");

function libraryRedirectUrl() {
  var localHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return localHost ? window.location.origin + "/library.html" : "https://www.legitbodyfix.com/library.html";
}

function setVisible(panel) {
  loadingPanel.hidden = panel !== loadingPanel;
  authPanel.hidden = panel !== authPanel;
  libraryPanel.hidden = panel !== libraryPanel;
}

function setAuthMessage(message, isError) {
  authMessage.textContent = message || "";
  authMessage.classList.toggle("error", Boolean(isError));
}

function setLibraryStatus(message, isError) {
  libraryStatus.textContent = message || "";
  libraryStatus.classList.toggle("error", Boolean(isError));
}

function createElement(tagName, className, text) {
  var element = document.createElement(tagName);
  if (className) element.className = className;
  if (typeof text === "string") element.textContent = text;
  return element;
}

function displayPrice(program) {
  if (!Number.isFinite(program.price)) return "Lifetime access";
  return displayMoney(program.price, program.currency) + " paid";
}

function displayMoney(amount, currency) {
  if (!Number.isFinite(amount)) return "Amount unavailable";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    return amount + " " + (currency || "USD");
  }
}

function displayDate(value) {
  if (!value) return "Date unavailable";
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function selectAccountView(name) {
  var profileSelected = name === "profile";
  libraryView.hidden = profileSelected;
  profileView.hidden = !profileSelected;
  accountTabs.forEach(function (tab) {
    var selected = tab.dataset.accountTab === name;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  closePlayback();
}

function renderProfile(email, programs, purchases) {
  var safePrograms = Array.isArray(programs) ? programs : [];
  var safePurchases = Array.isArray(purchases) ? purchases : [];
  profileEmail.textContent = email || "";
  activeProgramCount.textContent = String(safePrograms.length);
  purchaseCount.textContent = String(safePurchases.length);
  purchaseList.replaceChildren();

  if (safePurchases.length === 0) {
    purchaseList.appendChild(createElement("p", "empty-state", "No completed payments are linked to this email yet."));
    return;
  }
  safePurchases.forEach(function (purchase) {
    var row = createElement("article", "purchase-row");
    var details = createElement("div", "purchase-copy");
    details.append(
      createElement("p", "eyebrow", "COMPLETED · " + displayDate(purchase.paidAt).toUpperCase()),
      createElement("h4", "", purchase.title || "LegitBodyFix program"),
      createElement("p", "purchase-order", purchase.orderId ? "Order " + purchase.orderId : "Verified purchase")
    );
    var amount = createElement("strong", "purchase-amount", displayMoney(purchase.amount, purchase.currency));
    row.append(details, amount);
    purchaseList.appendChild(row);
  });
}

function closePlayback() {
  playerFrame.removeAttribute("src");
  playbackPanel.hidden = true;
  playbackTitle.textContent = "";
}

function renderPrograms(programs) {
  programGrid.replaceChildren();
  if (!Array.isArray(programs) || programs.length === 0) {
    programGrid.appendChild(createElement(
      "p",
      "empty-state",
      "No purchased programs are linked to this email yet. After a verified payment, your program will appear here automatically."
    ));
    return;
  }

  programs.forEach(function (program) {
    var card = createElement("article", "program-card");
    var top = document.createElement("div");
    top.append(
      createElement("p", "eyebrow", "PURCHASED PROGRAM"),
      createElement("h2", "", program.title || "Your program"),
      createElement("p", "", "Your protected movement sessions are available below.")
    );
    var meta = createElement("div", "program-meta");
    meta.append(createElement("span", "", displayPrice(program)), createElement("span", "", "Access active"));
    card.append(top, meta);
    programGrid.appendChild(card);
  });
}

function sessionMeta(video) {
  var details = [];
  if (Number.isFinite(video.durationMinutes)) details.push(video.durationMinutes + " min");
  if (video.equipment) details.push(video.equipment);
  return details.join(" · ");
}

function renderSessions(videos) {
  sessionGrid.replaceChildren();
  sessionSection.hidden = !Array.isArray(videos) || videos.length === 0;
  if (sessionSection.hidden) return;

  videos.forEach(function (video) {
    var card = createElement("article", "session-card");
    if (video.thumbnailUrl) {
      var thumbnail = document.createElement("img");
      thumbnail.className = "session-thumbnail";
      thumbnail.src = video.thumbnailUrl;
      thumbnail.alt = "";
      thumbnail.loading = "lazy";
      card.appendChild(thumbnail);
    }

    var details = createElement("div", "session-details");
    details.append(
      createElement("p", "eyebrow", "SESSION"),
      createElement("h3", "", video.title || "Movement session"),
      createElement("p", "session-description", video.description || "A guided movement session."),
      createElement("p", "session-meta", sessionMeta(video))
    );

    var action = document.createElement("button");
    action.type = "button";
    action.className = "button button-dark session-button";
    if (!video.ready) {
      action.disabled = true;
      action.textContent = "Preparing video";
      action.title = "This session is being prepared for protected playback.";
    } else {
      action.textContent = "Watch session";
      action.addEventListener("click", function () { openPlayback(video, action); });
    }
    details.appendChild(action);
    card.appendChild(details);
    sessionGrid.appendChild(card);
  });
}

async function openPlayback(video, button) {
  if (!activeSession || !video || !video.id) return;
  closePlayback();
  button.disabled = true;
  setLibraryStatus("Opening your protected session…", false);

  try {
    var response = await fetch("/api/access/playback?videoId=" + encodeURIComponent(video.id), {
      cache: "no-store",
      headers: { "Authorization": "Bearer " + activeSession.access_token }
    });
    var payload = await response.json().catch(function () { return {}; });
    if (response.status === 401) {
      await client.auth.signOut({ scope: "local" });
      setVisible(authPanel);
      setAuthMessage("Your sign-in link has expired. Please request a new one.", true);
      return;
    }
    if (!response.ok || !payload.playerUrl) {
      throw new Error("This video is not available right now. Please try again shortly.");
    }

    playbackTitle.textContent = video.title || "Movement session";
    playerFrame.src = payload.playerUrl;
    playbackPanel.hidden = false;
    playbackPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    setLibraryStatus("", false);
  } catch (error) {
    console.error("Protected playback failed:", error && error.message ? error.message : error);
    setLibraryStatus(error && error.message ? error.message : "This video is not available right now. Please try again shortly.", true);
  } finally {
    button.disabled = false;
  }
}

async function getConfig() {
  var response = await fetch("/api/access/config", { cache: "no-store" });
  var payload = await response.json().catch(function () { return {}; });
  if (!response.ok || !payload.url || !payload.publishableKey) {
    throw new Error("The sign-in service is not configured yet.");
  }
  return payload;
}

async function loadLibrary(session) {
  setLibraryStatus("Loading your purchased programs…", false);
  programGrid.replaceChildren();
  sessionGrid.replaceChildren();
  sessionSection.hidden = true;
  closePlayback();

  var response = await fetch("/api/access/library", {
    cache: "no-store",
    headers: { "Authorization": "Bearer " + session.access_token }
  });
  var payload = await response.json().catch(function () { return {}; });

  if (response.status === 401) {
    await client.auth.signOut({ scope: "local" });
    setVisible(authPanel);
    setAuthMessage("Your sign-in link has expired. Please request a new one.", true);
    return;
  }
  if (!response.ok) throw new Error("We could not load your library. Please refresh and try again.");

  buyerEmail.textContent = payload.email || session.user.email || "";
  renderPrograms(payload.programs);
  renderSessions(payload.videos);
  renderProfile(payload.email || session.user.email || "", payload.programs, payload.purchases);
  setLibraryStatus("", false);
}

async function showSession(session) {
  if (!session) {
    setVisible(authPanel);
    emailInput.focus();
    return;
  }
  if (activeSession && activeSession.access_token === session.access_token && !libraryPanel.hidden) return;
  activeSession = session;
  setVisible(libraryPanel);
  buyerEmail.textContent = session.user.email || "";
  await loadLibrary(session);
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  var email = emailInput.value.trim().toLowerCase();
  if (!email || !emailInput.checkValidity()) {
    setAuthMessage("Enter a valid email address.", true);
    emailInput.focus();
    return;
  }

  var button = form.querySelector("button[type='submit']");
  button.disabled = true;
  setAuthMessage("Sending your secure sign-in link…", false);
  try {
    var result = await client.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: libraryRedirectUrl() }
    });
    if (result.error) throw result.error;
    setAuthMessage("Check your email and open the secure sign-in link. You can close this page after opening it.", false);
  } catch (error) {
    console.error("Magic-link request failed:", error && error.message ? error.message : error);
    setAuthMessage("We could not send the sign-in link. Please try again in a moment.", true);
  } finally {
    button.disabled = false;
  }
});

closePlayerButton.addEventListener("click", closePlayback);

accountTabs.forEach(function (tab) {
  tab.addEventListener("click", function () { selectAccountView(tab.dataset.accountTab); });
});

signOutButton.addEventListener("click", async function () {
  signOutButton.disabled = true;
  closePlayback();
  activeSession = null;
  await client.auth.signOut({ scope: "local" });
  programGrid.replaceChildren();
  sessionGrid.replaceChildren();
  purchaseList.replaceChildren();
  selectAccountView("library");
  setVisible(authPanel);
  setAuthMessage("You have been signed out.", false);
  signOutButton.disabled = false;
});

try {
  var config = await getConfig();
  client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
  });
  client.auth.onAuthStateChange(function (event, session) {
    if (event !== "SIGNED_IN" || !session) return;
    window.setTimeout(function () {
      showSession(session).catch(function (error) {
        setVisible(authPanel);
        setAuthMessage(error && error.message ? error.message : "We could not open your library. Please try again.", true);
      });
    }, 0);
  });
  var sessionResult = await client.auth.getSession();
  if (sessionResult.error) throw sessionResult.error;
  await showSession(sessionResult.data.session);
} catch (error) {
  setVisible(authPanel);
  setAuthMessage(error && error.message ? error.message : "The sign-in service is unavailable. Please try again.", true);
}
