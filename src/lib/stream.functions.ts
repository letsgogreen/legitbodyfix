import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type CloudflareEnvelope<T> = { success: boolean; result?: T; errors?: { message?: string }[] };

function streamConfig() {
  const accountId = process.env["CLOUDFLARE_ACCOUNT_ID"] ?? process.env["CLOUDFLARE_STREAM_ACCOUNT_ID"];
  const apiToken = process.env["CLOUDFLARE_STREAM_API_TOKEN"];
  const customerCode = process.env["CLOUDFLARE_STREAM_CUSTOMER_CODE"];
  if (!accountId || !apiToken) throw new Error("Cloudflare Stream is not configured on the server.");
  return { accountId, apiToken, customerCode };
}

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function cloudflare<T>(path: string, init?: RequestInit): Promise<T> {
  const { accountId, apiToken } = streamConfig();
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json", ...init?.headers },
  });
  const payload = await response.json() as CloudflareEnvelope<T>;
  if (!response.ok || !payload.success || !payload.result) {
    throw new Error(payload.errors?.map((error) => error.message).filter(Boolean).join("; ") || `Cloudflare Stream request failed (${response.status}).`);
  }
  return payload.result;
}

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return adminClaims.app_metadata?.is_admin === true && adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}

export type StreamLibraryVideo = {
  uid: string;
  name: string;
  thumbnail: string | null;
  durationSeconds: number | null;
  ready: boolean;
  signed: boolean;
  created: string | null;
};

export const getStreamConfigurationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    return {
      accountId: Boolean(process.env["CLOUDFLARE_ACCOUNT_ID"]),
      apiToken: Boolean(process.env["CLOUDFLARE_STREAM_API_TOKEN"]),
      customerCode: Boolean(process.env["CLOUDFLARE_STREAM_CUSTOMER_CODE"]),
      webhookSecret: Boolean(process.env["CLOUDFLARE_STREAM_WEBHOOK_SECRET"]),
      webhookPath: "/api/cloudflare-stream-webhook",
    };
  });

export const listStreamVideos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StreamLibraryVideo[]> => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const result = await cloudflare<{ videos?: Array<{ uid: string; thumbnail?: string; duration?: number; readyToStream?: boolean; requireSignedURLs?: boolean; created?: string; meta?: { name?: string } }> }>("?limit=100&include_counts=true");
    return (result.videos ?? []).map((video) => ({
      uid: video.uid,
      name: video.meta?.name || "Untitled Stream video",
      thumbnail: video.thumbnail ?? null,
      durationSeconds: video.duration ? Math.round(video.duration) : null,
      ready: video.readyToStream === true,
      signed: video.requireSignedURLs === true,
      created: video.created ?? null,
    }));
  });

export const attachStreamVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ lessonId: z.string().uuid(), streamUid: z.string().regex(/^[a-f0-9]{32}$/) }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const video = await cloudflare<{ uid: string; readyToStream?: boolean; requireSignedURLs?: boolean; thumbnail?: string; duration?: number; status?: { state?: string; errorReasonText?: string } }>(`/${data.streamUid}`);
    if (!video.requireSignedURLs) throw new Error("This Stream video is public. Enable signed URLs before attaching it to paid content.");
    const state = video.status?.state === "error" ? "error" : video.readyToStream ? "ready" : "processing";
    const update = {
      stream_uid: video.uid,
      stream_status: state,
      stream_error: video.status?.errorReasonText || null,
      stream_thumbnail_url: video.thumbnail || null,
      ...(video.duration ? { duration_seconds: Math.round(video.duration) } : {}),
    };
    const { error } = await context.supabase.from("lessons").update(update).eq("id", data.lessonId);
    if (error) throw new Error(error.message);
    return { status: state, thumbnailUrl: video.thumbnail ?? null, durationSeconds: video.duration ? Math.round(video.duration) : null };
  });

export const createStreamUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ lessonId: z.string().uuid(), maxDurationSeconds: z.number().int().min(60).max(21600).default(7200) }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const upload = await cloudflare<{ uploadURL: string; uid: string }>("/direct_upload", {
      method: "POST",
      body: JSON.stringify({ maxDurationSeconds: data.maxDurationSeconds, requireSignedURLs: true, creator: context.userId, meta: { lessonId: data.lessonId } }),
    });
    const { error } = await context.supabase.from("lessons").update({ stream_uid: upload.uid, stream_status: "uploading", stream_error: null }).eq("id", data.lessonId);
    if (error) throw new Error(error.message);
    return upload;
  });

export const createStreamTusUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ lessonId: z.string().uuid(), fileName: z.string().min(1).max(200), fileSize: z.number().int().positive(), maxDurationSeconds: z.number().int().min(60).max(21600).default(7200) }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const { accountId, apiToken } = streamConfig();
    const metadata = [`name ${toBase64(data.fileName)}`, "requiresignedurls", `maxdurationseconds ${toBase64(String(data.maxDurationSeconds))}`].join(",");
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Tus-Resumable": "1.0.0", "Upload-Length": String(data.fileSize), "Upload-Creator": context.userId, "Upload-Metadata": metadata },
    });
    const uploadURL = response.headers.get("Location");
    const uid = response.headers.get("stream-media-id") || (uploadURL ? new URL(uploadURL).pathname.split("/").filter(Boolean).pop() : null);
    if (!response.ok || !uploadURL || !uid) throw new Error(`Could not create resumable Stream upload (${response.status}).`);
    const { error } = await context.supabase.from("lessons").update({ stream_uid: uid, stream_status: "uploading", stream_error: null }).eq("id", data.lessonId);
    if (error) throw new Error(error.message);
    return { uploadURL, uid };
  });

export const refreshStreamVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ lessonId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const { data: lesson, error } = await context.supabase.from("lessons").select("stream_uid").eq("id", data.lessonId).single();
    if (error || !lesson?.stream_uid) throw new Error(error?.message || "This lesson has no Stream video.");
    const video = await cloudflare<{ uid: string; readyToStream?: boolean; thumbnail?: string; duration?: number; status?: { state?: string; errorReasonText?: string } }>(`/${lesson.stream_uid}`);
    const state = video.status?.state === "error" ? "error" : video.readyToStream ? "ready" : "processing";
    const lessonUpdate: { stream_status: string; stream_error: string | null; stream_thumbnail_url: string | null; duration_seconds?: number } = {
      stream_status: state,
      stream_error: video.status?.errorReasonText || null,
      stream_thumbnail_url: video.thumbnail || null,
    };
    if (video.duration) lessonUpdate.duration_seconds = Math.round(video.duration);
    const { error: updateError } = await context.supabase.from("lessons").update(lessonUpdate).eq("id", data.lessonId);
    if (updateError) throw new Error(updateError.message);
    return { status: state, thumbnailUrl: video.thumbnail ?? null, durationSeconds: video.duration ? Math.round(video.duration) : null };
  });

export const setStreamThumbnailFrame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ lessonId: z.string().uuid(), timeSeconds: z.number().min(0) }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const { data: lesson, error } = await context.supabase.from("lessons").select("stream_uid,duration_seconds").eq("id", data.lessonId).single();
    if (error || !lesson?.stream_uid) throw new Error(error?.message || "This lesson has no Stream video.");
    let duration = lesson.duration_seconds ?? 0;
    if (!duration) {
      const current = await cloudflare<{ duration?: number }>(`/${lesson.stream_uid}`);
      duration = current.duration ?? 0;
    }
    if (!duration) throw new Error("Stream has not reported the video duration yet.");
    const thumbnailTimestampPct = Math.min(1, data.timeSeconds / duration);
    const video = await cloudflare<{ thumbnail?: string }>(`/${lesson.stream_uid}`, {
      method: "POST",
      body: JSON.stringify({ thumbnailTimestampPct }),
    });
    const thumbnailUrl = video.thumbnail ?? null;
    const { error: updateError } = await context.supabase.from("lessons").update({ thumbnail_url: thumbnailUrl, stream_thumbnail_url: thumbnailUrl }).eq("id", data.lessonId);
    if (updateError) throw new Error(updateError.message);
    return { thumbnailUrl, timeSeconds: Math.round(thumbnailTimestampPct * duration) };
  });

export const getStreamPlayback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ lessonId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // RLS permits this read only for an administrator or an active owner of the
    // program. Never accept a Stream UID directly from the browser.
    const { data: lesson, error } = await context.supabase.from("lessons").select("stream_uid,stream_status,title").eq("id", data.lessonId).single();
    if (error || !lesson) throw new Error("You do not have access to this lesson.");
    if (!lesson.stream_uid || lesson.stream_status !== "ready") throw new Error("This video is not ready to play yet.");
    const { customerCode } = streamConfig();
    if (!customerCode) throw new Error("Cloudflare Stream customer code is not configured.");
    const signed = await cloudflare<{ token: string }>(`/${lesson.stream_uid}/token`, { method: "POST" });
    return { title: lesson.title, iframeUrl: `https://customer-${customerCode}.cloudflarestream.com/${signed.token}/iframe` };
  });
