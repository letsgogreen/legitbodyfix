import { createFileRoute } from "@tanstack/react-router";

type StreamWebhook = {
  uid?: string;
  readyToStream?: boolean;
  thumbnail?: string;
  duration?: number;
  status?: { state?: string; errorReasonText?: string };
};

export const Route = createFileRoute("/api/cloudflare-stream-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CLOUDFLARE_STREAM_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook is not configured", { status: 503 });

        const signature = request.headers.get("Webhook-Signature");
        const rawBody = await request.text();
        if (!signature || !(await verifySignature(signature, rawBody, secret))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: StreamWebhook;
        try { payload = JSON.parse(rawBody) as StreamWebhook; }
        catch { return new Response("Invalid JSON", { status: 400 }); }
        if (!payload.uid) return new Response("Missing video UID", { status: 400 });

        const state = payload.status?.state === "error" ? "error" : payload.readyToStream ? "ready" : "processing";
        const update = {
          stream_status: state,
          stream_error: payload.status?.errorReasonText || null,
          stream_thumbnail_url: payload.thumbnail || null,
          ...(payload.duration ? { duration_seconds: Math.round(payload.duration) } : {}),
        };
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("lessons").update(update).eq("stream_uid", payload.uid);
        if (error) {
          console.error("Cloudflare Stream webhook update failed:", error.message);
          return new Response("Database update failed", { status: 500 });
        }
        return Response.json({ received: true });
      },
    },
  },
});

async function verifySignature(header: string, body: string, secret: string) {
  const parts = Object.fromEntries(header.split(",").map((part) => part.trim().split("=", 2)));
  const timestamp = Number(parts["time"]);
  const actual = parts["sig1"];
  if (!timestamp || !actual || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${body}`)));
  const expected = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return timingSafeEqual(expected, actual);
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}
