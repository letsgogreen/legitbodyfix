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

const DASHBOARD_QUERY_TIMEOUT_MS = 6_000;

async function withQueryTimeout<T>(query: PromiseLike<T>, fallback: T, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<T>((resolve) => {
    timeout = setTimeout(() => {
      console.error(`[admin-dashboard] ${label} query timed out`);
      resolve(fallback);
    }, DASHBOARD_QUERY_TIMEOUT_MS);
  });
  try {
    return await Promise.race([Promise.resolve(query), timedOut]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export const getAdminDashboardData = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminDashboardData> => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [programResult, lessonResult, customerResult, orderResult, integrations] =
      await Promise.all([
        withQueryTimeout(
          supabaseAdmin.from("programs").select("*").order("featured_rank", { ascending: true, nullsFirst: false }),
          { data: [] as Program[], error: null }, "programs",
        ),
        withQueryTimeout(supabaseAdmin.from("lessons").select("*").order("position"), { data: [] as Lesson[], error: null }, "lessons"),
        withQueryTimeout(
          supabaseAdmin.from("customer_profiles").select("*").order("created_at", { ascending: false }),
          { data: [] as Customer[], error: null }, "customers",
        ),
        withQueryTimeout(
          supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
          { data: [] as Order[], error: null }, "orders",
        ),
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
