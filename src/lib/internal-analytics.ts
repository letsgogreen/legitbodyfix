const INTERNAL_BROWSER_KEY = "lbf_internal_analytics_v1";

export function isInternalAnalyticsBrowser() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(INTERNAL_BROWSER_KEY) === "1";
}

export function markCurrentBrowserAsInternal() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INTERNAL_BROWSER_KEY, "1");
}
