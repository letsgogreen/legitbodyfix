import { createServerFn } from "@tanstack/react-start";

export type IntegrationReadiness = {
  supabase: boolean;
  stripeCheckout: boolean;
  stripeWebhook: boolean;
  streamUpload: boolean;
  streamPlayback: boolean;
  streamWebhook: boolean;
};

export const getIntegrationReadiness = createServerFn({ method: "GET" }).handler(
  async (): Promise<IntegrationReadiness> => ({
    supabase: Boolean(
      process.env["SUPABASE_URL"] &&
      (process.env["SUPABASE_SECRET_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"]),
    ),
    stripeCheckout: Boolean(process.env["STRIPE_API_KEY"] || process.env["STRIPE_SANDBOX_API_KEY"]),
    stripeWebhook: Boolean(process.env["STRIPE_WEBHOOK_SECRET"]),
    streamUpload: Boolean(
      process.env["CLOUDFLARE_STREAM_ACCOUNT_ID"] && process.env["CLOUDFLARE_STREAM_API_TOKEN"],
    ),
    streamPlayback: Boolean(process.env["CLOUDFLARE_STREAM_CUSTOMER_CODE"]),
    streamWebhook: Boolean(process.env["CLOUDFLARE_STREAM_WEBHOOK_SECRET"]),
  }),
);
