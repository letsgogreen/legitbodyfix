import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "lbf_analytics_session";
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

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
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

  useEffect(() => {
    if (location.pathname.startsWith("/admin") || navigator.webdriver) return;

    let referrerHost: string | null = null;
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      if (referrer && referrer.hostname !== window.location.hostname) referrerHost = referrer.hostname;
    } catch {
      referrerHost = null;
    }

    const campaign = getCampaign(location.searchStr);
    void supabase.from("page_views").insert({
      session_id: getSessionId(),
      path: location.pathname.slice(0, 500),
      referrer_host: clean(referrerHost, 255),
      utm_source: campaign.source,
      utm_medium: campaign.medium,
      utm_campaign: campaign.campaign,
      device_type: deviceType(),
    });
  }, [location.pathname, location.searchStr]);

  return null;
}
