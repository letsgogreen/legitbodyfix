import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return (
    adminClaims.app_metadata?.is_admin === true &&
    adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com"
  );
}

export const getSiteFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin
      .from("site_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(250);
    if (result.error) throw new Error(`Feedback query failed: ${result.error.message}`);
    return { feedback: result.data ?? [] };
  });
