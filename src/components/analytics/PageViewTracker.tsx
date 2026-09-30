import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { isInternalAnalyticsBrowser } from "@/lib/internal-analytics";
import {
  getAnalyticsSessionId,
  getAnalyticsVisitorId,
  isAnalyticsSessionExpired,
} from "@/lib/analytics-client";

const CAMPAIGN_KEY = "lbf_analytics_campaign";

type Campaign = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
};

function clean(value: string | null, max: number) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function getCampaign(search: string): Campaign {
  const params = new URLSearchParams(search);
  const incoming = {
    source: clean(params.get("utm_source"), 120),
    medium: clean(params.get("utm_medium"), 120),
    campaign: clean(params.get("utm_campaign"), 180),
  };
  if (incoming.source || incoming.medium || incoming.campaign) {
    sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(incoming));
    return incoming;
  }
  try {
    return JSON.parse(sessionStorage.getItem(CAMPAIGN_KEY) || "null") || incoming;
  } catch {
    return incoming;
  }
}

function deviceType(): "desktop" | "tablet" | "mobile" {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

export function PageViewTracker() {
  const location = useRouterState({ select: (state) => state.location });

  function recordPageView() {
    if (location.pathname.startsWith("/admin") || navigator.webdriver) return;
    try {
      let referrerHost: string | null = null;
      try {
        const referrer = document.referrer ? new URL(document.referrer) : null;
        if (referrer && referrer.hostname !== window.location.hostname)
          referrerHost = referrer.hostname;
      } catch {
        referrerHost = null;
      }

      const campaign = getCampaign(window.location.search);
      const path = window.location.pathname.slice(0, 500);
      void fetch("/api/analytics/page-view", {
        method: "POST",
        headers: { "content-type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          session_id: getAnalyticsSessionId(),
          visitor_id: getAnalyticsVisitorId(),
          path,
          referrer_host: clean(referrerHost, 255),
          utm_source: campaign.source,
          utm_medium: campaign.medium,
          utm_campaign: campaign.campaign,
          device_type: deviceType(),
          is_internal: isInternalAnalyticsBrowser(),
        }),
      })
        .then((response) => {
          if (!response.ok) console.warn("Analytics page-view collection was skipped.");
        })
        .catch(() => console.warn("Analytics page-view collection was skipped."));
    } catch {
      console.warn("Analytics page-view collection is unavailable.");
    }
  }

  useEffect(() => {
    recordPageView();
  }, [location.pathname, location.searchStr]);

  useEffect(() => {
    const recordResumedSession = () => {
      if (document.visibilityState === "visible" && isAnalyticsSessionExpired()) recordPageView();
    };
    window.addEventListener("focus", recordResumedSession);
    document.addEventListener("visibilitychange", recordResumedSession);
    return () => {
      window.removeEventListener("focus", recordResumedSession);
      document.removeEventListener("visibilitychange", recordResumedSession);
    };
  }, [location.pathname, location.searchStr]);

  return null;
}
