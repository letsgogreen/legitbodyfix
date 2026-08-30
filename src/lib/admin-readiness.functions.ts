import { createServerFn } from "@tanstack/react-start";

export type IntegrationReadiness = {
  supabase: boolean;
  paddleCheckout: boolean;
  paddleWebhook: boolean;
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
    paddleCheckout: Boolean(process.env["PADDLE_CLIENT_TOKEN"] && process.env["PADDLE_API_KEY"]),
    paddleWebhook: Boolean(process.env["PADDLE_NOTIFICATION_WEBHOOK_SECRET"]),
    streamUpload: Boolean(
      process.env["CLOUDFLARE_STREAM_ACCOUNT_ID"] && process.env["CLOUDFLARE_STREAM_API_TOKEN"],
    ),
    streamPlayback: Boolean(process.env["CLOUDFLARE_STREAM_CUSTOMER_CODE"]),
    streamWebhook: Boolean(process.env["CLOUDFLARE_STREAM_WEBHOOK_SECRET"]),
  }),
);
