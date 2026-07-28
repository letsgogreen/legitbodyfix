import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

var client;
var loadingPanel = document.getElementById("loadingPanel");
var authPanel = document.getElementById("authPanel");
var libraryPanel = document.getElementById("libraryPanel");
var form = document.getElementById("magicLinkForm");
var emailInput = document.getElementById("email");
var authMessage = document.getElementById("authMessage");
var buyerEmail = document.getElementById("buyerEmail");
var programGrid = document.getElementById("programGrid");
var libraryStatus = document.getElementById("libraryStatus");
var signOutButton = document.getElementById("signOutButton");

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
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: program.currency || "USD",
      maximumFractionDigits: 0
    }).format(program.price) + " paid";
  } catch (error) {
    return "Lifetime access";
  }
}

function renderPrograms(programs) {
  programGrid.replaceChildren();
  if (!Array.isArray(programs) || programs.length === 0) {
    var empty = createElement("p", "empty-state", "No purchased programs are linked to this email yet. After a verified payment, your program will appear here automatically.");
    programGrid.appendChild(empty);
    return;
  }

  programs.forEach(function (program) {
    var card = createElement("article", "program-card");
    var top = document.createElement("div");
    top.append(
      createElement("p", "eyebrow", "PURCHASED PROGRAM"),
      createElement("h2", "", program.title || "Your program"),
      createElement("p", "", "Your protected video library will appear here after purchase access is confirmed.")
    );
    var meta = createElement("div", "program-meta");
    meta.append(createElement("span", "", displayPrice(program)), createElement("span", "", "Access active"));
    card.append(top, meta);
    programGrid.appendChild(card);
  });
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
  setLibraryStatus("", false);
}

async function showSession(session) {
  if (!session) {
    setVisible(authPanel);
    emailInput.focus();
    return;
  }
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
      options: { emailRedirectTo: window.location.origin + "/library.html" }
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

signOutButton.addEventListener("click", async function () {
  signOutButton.disabled = true;
  await client.auth.signOut({ scope: "local" });
  programGrid.replaceChildren();
  setVisible(authPanel);
  setAuthMessage("You have been signed out.", false);
  signOutButton.disabled = false;
});

try {
  var config = await getConfig();
  client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
  });
  var sessionResult = await client.auth.getSession();
  if (sessionResult.error) throw sessionResult.error;
  await showSession(sessionResult.data.session);
} catch (error) {
  setVisible(authPanel);
  setAuthMessage(error && error.message ? error.message : "The sign-in service is unavailable. Please try again.", true);
}
