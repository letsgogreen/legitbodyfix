import type { PublicProgram } from "@/lib/public-programs.functions";

const SESSION_KEY = "lbf_analytics_session";
const VISITOR_KEY = "lbf_analytics_visitor";

export type ProgramFunnelEvent = "card_impression" | "card_click" | "sales_view" | "checkout_click";

function storedId(storage: Storage, key: string) {
  let value = storage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    storage.setItem(key, value);
  }
  return value;
}

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
        session_id: storedId(sessionStorage, SESSION_KEY),
        visitor_id: storedId(localStorage, VISITOR_KEY),
        program_slug: program.slug,
        program_name: program.name,
        event_type: eventType,
        source_path: `${window.location.pathname}${window.location.search}`.slice(0, 500),
        device_type: deviceType(),
      }),
    }).catch(() => undefined);
  } catch {
    // Analytics must never interrupt browsing or checkout.
  }
}
