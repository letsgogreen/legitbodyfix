import type { PublicProgram } from "@/lib/public-programs.functions";
import { isInternalAnalyticsBrowser } from "@/lib/internal-analytics";
import { getAnalyticsSessionId, getAnalyticsVisitorId } from "@/lib/analytics-client";

export type ProgramFunnelEvent = "card_impression" | "card_click" | "sales_view" | "checkout_click";

function deviceType(): "desktop" | "tablet" | "mobile" {
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1100) return "tablet";
  return "desktop";
}

export function trackProgramFunnel(
  eventType: ProgramFunnelEvent,
  program: Pick<PublicProgram, "slug" | "name">,
) {
  if (
    typeof window === "undefined" ||
    navigator.webdriver ||
    window.location.search.includes("preview=admin")
  )
    return;
  try {
    void fetch("/api/analytics/program-funnel", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        session_id: getAnalyticsSessionId(),
        visitor_id: getAnalyticsVisitorId(),
        program_slug: program.slug,
        program_name: program.name,
        event_type: eventType,
        source_path: `${window.location.pathname}${window.location.search}`.slice(0, 500),
        device_type: deviceType(),
        is_internal: isInternalAnalyticsBrowser(),
      }),
    }).catch(() => undefined);
  } catch {
    // Analytics must never interrupt browsing or checkout.
  }
}
