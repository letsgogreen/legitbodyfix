const SESSION_KEY = "lbf_analytics_session";
const SESSION_ACTIVITY_KEY = "lbf_analytics_session_activity";
const VISITOR_KEY = "lbf_analytics_visitor";

export const ANALYTICS_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function storedUuid(storage: Storage, key: string) {
  let value = storage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    storage.setItem(key, value);
  }
  return value;
}

export function isAnalyticsSessionExpired(now = Date.now()) {
  const sessionId = window.sessionStorage.getItem(SESSION_KEY);
  const lastActivity = Number(window.sessionStorage.getItem(SESSION_ACTIVITY_KEY));
  return (
    !sessionId ||
    !Number.isFinite(lastActivity) ||
    lastActivity <= 0 ||
    now - lastActivity >= ANALYTICS_SESSION_TIMEOUT_MS
  );
}

export function getAnalyticsSessionId(now = Date.now()) {
  if (isAnalyticsSessionExpired(now)) {
    window.sessionStorage.setItem(SESSION_KEY, crypto.randomUUID());
  }
  window.sessionStorage.setItem(SESSION_ACTIVITY_KEY, String(now));
  return window.sessionStorage.getItem(SESSION_KEY)!;
}

export function getAnalyticsVisitorId() {
  return storedUuid(window.localStorage, VISITOR_KEY);
}
