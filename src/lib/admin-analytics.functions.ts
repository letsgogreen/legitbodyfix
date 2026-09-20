import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return adminClaims.app_metadata?.is_admin === true &&
    adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}

export const getAdminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ range: z.union([z.literal(7), z.literal(30), z.literal(90)]) }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");

    const since = new Date(Date.now() - data.range * 2 * 86_400_000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: views, error } = await supabaseAdmin
      .from("page_views")
      .select("id,created_at,session_id,path,referrer_host,utm_source,utm_medium,utm_campaign,device_type,country_code,region_code")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (error) {
      console.error("Admin analytics query failed", { message: error.message, range: data.range });
      throw new Error(`Analytics query failed: ${error.message}`);
    }
    return { views: views ?? [] };
  });
