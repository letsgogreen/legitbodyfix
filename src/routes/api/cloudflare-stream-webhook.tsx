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
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let thumbnailUrl = payload.thumbnail || null;
        let lessonId: string | null = null;
        let existingThumbnailUrl: string | null = null;
        if (payload.readyToStream) {
          const { data: lesson } = await supabaseAdmin
            .from("lessons")
            .select("id,thumbnail_url")
            .eq("stream_uid", payload.uid)
            .limit(1)
            .maybeSingle();
          if (lesson) {
            lessonId = lesson.id;
            existingThumbnailUrl = lesson.thumbnail_url;
            try {
              const { rehostStreamThumbnail } = await import("@/lib/stream.functions");
              thumbnailUrl = await rehostStreamThumbnail(supabaseAdmin, lesson.id, payload.uid);
            } catch (cause) {
              console.error("Cloudflare Stream thumbnail rehosting failed:", cause);
            }
          }
        }
        const update = {
          stream_status: state,
          stream_error: payload.status?.errorReasonText || null,
          stream_thumbnail_url: thumbnailUrl,
          ...(!existingThumbnailUrl || existingThumbnailUrl.includes(".cloudflarestream.com")
            ? { thumbnail_url: thumbnailUrl }
            : {}),
          ...(payload.duration ? { duration_seconds: Math.max(1, Math.round(payload.duration)) } : {}),
        };
        const query = supabaseAdmin.from("lessons").update(update);
        const { error } = lessonId
          ? await query.eq("id", lessonId)
          : await query.eq("stream_uid", payload.uid);
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
