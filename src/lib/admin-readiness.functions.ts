import { createServerFn } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type Program = Database["public"]["Tables"]["programs"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
type Customer = Database["public"]["Tables"]["customer_profiles"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

export type IntegrationReadiness = {
  supabase: boolean;
  paddleCheckout: boolean;
  paddleWebhook: boolean;
  streamUpload: boolean;
  streamPlayback: boolean;
  streamWebhook: boolean;
};

function integrationReadiness(): IntegrationReadiness {
  return {
    supabase: Boolean(
      process.env["SUPABASE_URL"] &&
      (process.env["SUPABASE_SECRET_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"]),
    ),
    paddleCheckout: Boolean(process.env["PADDLE_CLIENT_TOKEN"] && process.env["PADDLE_API_KEY"]),
    paddleWebhook: Boolean(process.env["PADDLE_NOTIFICATION_WEBHOOK_SECRET"]),
    streamUpload: Boolean(
      process.env["CLOUDFLARE_STREAM_ACCOUNT_ID"] && process.env["CLOUDFLARE_STREAM_API_TOKEN"],
    ),
    streamPlayback: Boolean(process.env["CLOUDFLARE_STREAM_CUSTOMER_CODE"]),
    streamWebhook: Boolean(process.env["CLOUDFLARE_STREAM_WEBHOOK_SECRET"]),
  };
}

export const getIntegrationReadiness = createServerFn({ method: "GET" }).handler(
  async (): Promise<IntegrationReadiness> => integrationReadiness(),
);

export type AdminDashboardData = {
  programs: Program[];
  lessons: Lesson[];
  customers: Customer[];
  orders: Order[];
  integrations: IntegrationReadiness;
};

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return adminClaims.app_metadata?.is_admin === true &&
    adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}

export const getAdminDashboardData = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminDashboardData> => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [programResult, lessonResult, customerResult, orderResult, integrations] =
      await Promise.all([
        supabaseAdmin
          .from("programs")
          .select("*")
          .order("featured_rank", { ascending: true, nullsFirst: false }),
        supabaseAdmin.from("lessons").select("*").order("position"),
        supabaseAdmin
          .from("customer_profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
        Promise.resolve(integrationReadiness()),
      ]);

    const error =
      programResult.error ?? lessonResult.error ?? customerResult.error ?? orderResult.error;
    if (error) throw new Error(error.message);

    return {
      programs: programResult.data ?? [],
      lessons: lessonResult.data ?? [],
      customers: customerResult.data ?? [],
      orders: orderResult.data ?? [],
      integrations,
    };
  });
