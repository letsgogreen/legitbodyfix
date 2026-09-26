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
        "id,created_at,session_id,visitor_id,program_slug,program_name,event_type,source_path,device_type",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);
    const enriched = await supabaseAdmin
      .from("page_views")
      .select(
        "id,created_at,session_id,visitor_id,path,referrer_host,utm_source,utm_medium,utm_campaign,device_type,country_code,region_code,city,administrative_area,network_hash",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (!enriched.error) {
      const funnel = await funnelRequest;
      if (funnel.error) console.warn("Program funnel analytics unavailable", funnel.error.message);
      return { views: enriched.data ?? [], funnelEvents: funnel.data ?? [] };
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
    const funnel = await funnelRequest;
    if (funnel.error) console.warn("Program funnel analytics unavailable", funnel.error.message);
    return {
      views: (legacy.data ?? []).map((view) => ({
        ...view,
        visitor_id: null,
        city: null,
        administrative_area: null,
        network_hash: null,
      })),
      funnelEvents: funnel.data ?? [],
    };
  });
