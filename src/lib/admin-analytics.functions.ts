import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return (
    adminClaims.app_metadata?.is_admin === true &&
    adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com"
  );
}

type AnalyticsView = {
  id: string;
  created_at: string;
  session_id: string;
  visitor_id: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  device_type: string;
  country_code: string | null;
  region_code: string | null;
  city: string | null;
};

const SPLIT_IDENTITY_INCIDENT_START = Date.parse("2026-10-02T00:00:00.000Z");
const SPLIT_IDENTITY_INCIDENT_END = Date.parse("2026-10-03T00:00:00.000Z");
const SESSION_WINDOW_MS = 30 * 60 * 1000;

function repairHistoricalSplitIdentities<T extends AnalyticsView>(views: T[]) {
  const candidates = views
    .filter((view) => {
      const time = Date.parse(view.created_at);
      return (
        time >= SPLIT_IDENTITY_INCIDENT_START &&
        time < SPLIT_IDENTITY_INCIDENT_END &&
        view.country_code === "US" &&
        view.region_code === "CO" &&
        view.city === "Denver" &&
        view.device_type === "desktop" &&
        !view.referrer_host &&
        !view.utm_source
      );
    })
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

  const repaired = new Map<string, { visitorId: string | null; sessionId: string }>();
  let cluster: T[] = [];
  const commitCluster = () => {
    if (cluster.length < 2 || new Set(cluster.map((view) => view.visitor_id)).size < 2) return;
    const first = cluster[0];
    cluster.forEach((view) =>
      repaired.set(view.id, { visitorId: first.visitor_id, sessionId: first.session_id }),
    );
  };

  candidates.forEach((view) => {
    const previous = cluster.at(-1);
    if (
      previous &&
      Date.parse(view.created_at) - Date.parse(previous.created_at) >= SESSION_WINDOW_MS
    ) {
      commitCluster();
      cluster = [];
    }
    cluster.push(view);
  });
  commitCluster();

  return views.map((view) => {
    const identity = repaired.get(view.id);
    return identity
      ? { ...view, visitor_id: identity.visitorId, session_id: identity.sessionId }
      : view;
  });
}

export const getAdminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z.object({ range: z.union([z.literal(7), z.literal(30), z.literal(90)]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");

    const since = new Date(Date.now() - data.range * 2 * 86_400_000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const funnelRequest = supabaseAdmin
      .from("program_funnel_events")
      .select(
        "id,created_at,session_id,visitor_id,program_slug,program_name,event_type,source_path,device_type,is_internal",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);
    const enriched = await supabaseAdmin
      .from("page_views")
      .select(
        "id,created_at,session_id,visitor_id,path,referrer_host,utm_source,utm_medium,utm_campaign,device_type,country_code,region_code,city,administrative_area,network_hash,is_internal",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (!enriched.error) {
      const funnel = await funnelRequest;
      if (!funnel.error)
        return {
          views: repairHistoricalSplitIdentities(enriched.data ?? []),
          funnelEvents: funnel.data ?? [],
        };

      const legacyFunnel = await supabaseAdmin
        .from("program_funnel_events")
        .select(
          "id,created_at,session_id,visitor_id,program_slug,program_name,event_type,source_path,device_type",
        )
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);
      return {
        views: repairHistoricalSplitIdentities(enriched.data ?? []),
        funnelEvents: (legacyFunnel.data ?? []).map((event) => ({
          ...event,
          is_internal: false,
        })),
      };
    }

    const legacy = await supabaseAdmin
      .from("page_views")
      .select(
        "id,created_at,session_id,path,referrer_host,utm_source,utm_medium,utm_campaign,device_type,country_code,region_code",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (legacy.error) {
      console.error("Admin analytics query failed", {
        message: legacy.error.message,
        range: data.range,
      });
      throw new Error(`Analytics query failed: ${legacy.error.message}`);
    }
    const funnel = await supabaseAdmin
      .from("program_funnel_events")
      .select(
        "id,created_at,session_id,visitor_id,program_slug,program_name,event_type,source_path,device_type",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);
    if (funnel.error) console.warn("Program funnel analytics unavailable", funnel.error.message);
    return {
      views: (legacy.data ?? []).map((view) => ({
        ...view,
        visitor_id: null,
        city: null,
        administrative_area: null,
        network_hash: null,
        is_internal: false,
      })),
      funnelEvents: (funnel.data ?? []).map((event) => ({ ...event, is_internal: false })),
    };
  });
