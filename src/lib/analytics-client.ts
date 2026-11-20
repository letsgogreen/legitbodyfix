const SESSION_KEY = "lbf_analytics_session";
const VISITOR_KEY = "lbf_analytics_visitor";

function storedUuid(storage: Storage, key: string) {
  let value = storage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    storage.setItem(key, value);
  }
  return value;
}

export function getAnalyticsSessionId() {
  return storedUuid(window.sessionStorage, SESSION_KEY);
}

export function getAnalyticsVisitorId() {
  return storedUuid(window.localStorage, VISITOR_KEY);
}
