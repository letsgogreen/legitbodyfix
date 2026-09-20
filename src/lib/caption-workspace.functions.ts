import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const language = z.enum(["en", "ko"]);
const workflowStatus = z.enum(["draft", "review", "published"]);
const uid = z.string().regex(/^[a-f0-9]{32}$/);

export type CaptionWorkspace = {
  language: "en" | "ko";
  vtt: string;
  status: "draft" | "review" | "published";
  updatedAt: string;
};

function assertAdmin(claims: unknown) {
  const value = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  if (
    value.app_metadata?.is_admin !== true ||
    value.email?.trim().toLowerCase() !== "thriveinside@protonmail.com"
  ) throw new Error("Administrator access required.");
}

function streamConfig() {
  const accountId = process.env["CLOUDFLARE_ACCOUNT_ID"] ?? process.env["CLOUDFLARE_STREAM_ACCOUNT_ID"];
  const apiToken = process.env["CLOUDFLARE_STREAM_API_TOKEN"];
  if (!accountId || !apiToken) throw new Error("Cloudflare Stream is not configured.");
  return { accountId, apiToken };
}

async function fetchStreamVtt(streamUid: string, lang: "en" | "ko") {
  const { accountId, apiToken } = streamConfig();
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${streamUid}/captions/${lang}/vtt`,
    { headers: { Authorization: `Bearer ${apiToken}` } },
  );
  if (!response.ok) throw new Error(`Could not fetch ${lang} captions (${response.status}).`);
  return response.text();
}

async function uploadStreamVtt(streamUid: string, lang: "en" | "ko", vtt: string) {
  const { accountId, apiToken } = streamConfig();
  const form = new FormData();
  form.append("file", new Blob([vtt], { type: "text/vtt" }), `${lang}.vtt`);
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${streamUid}/captions/${lang}`,
    { method: "PUT", headers: { Authorization: `Bearer ${apiToken}` }, body: form },
  );
  if (!response.ok) throw new Error(`Could not publish ${lang} captions (${response.status}).`);
}

async function saveWorkspace(supabase: any, streamUid: string, lang: "en" | "ko", vtt: string, status: "draft" | "review" | "published") {
  const { error } = await supabase.from("caption_workspaces").upsert(
    { stream_uid: streamUid, language: lang, vtt, status },
    { onConflict: "stream_uid,language" },
  );
  if (error) throw new Error(error.message);
}

export const getCaptionWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ streamUid: uid }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    const { data: rows, error } = await (context.supabase as any)
      .from("caption_workspaces")
      .select("language,vtt,status,updated_at")
      .eq("stream_uid", data.streamUid);
    if (error) throw new Error(error.message);
    return {
      workspaces: (rows ?? []).map((row: any) => ({ language: row.language, vtt: row.vtt, status: row.status, updatedAt: row.updated_at })) as CaptionWorkspace[],
    };
  });

export const importCaptionWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ streamUid: uid, language }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    const vtt = await fetchStreamVtt(data.streamUid, data.language);
    await saveWorkspace(context.supabase, data.streamUid, data.language, vtt, "draft");
    return { language: data.language, vtt, status: "draft" as const, updatedAt: new Date().toISOString() };
  });

export const saveCaptionWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ streamUid: uid, language, vtt: z.string().min(6).max(1_000_000), status: workflowStatus }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    if (!data.vtt.trimStart().startsWith("WEBVTT")) throw new Error("Caption text must be valid WebVTT.");
    await saveWorkspace(context.supabase, data.streamUid, data.language, data.vtt, data.status);
    return { ...data, updatedAt: new Date().toISOString() };
  });

export const publishCaptionWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ streamUid: uid, language, vtt: z.string().min(6).max(1_000_000) }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    if (!data.vtt.trimStart().startsWith("WEBVTT")) throw new Error("Caption text must be valid WebVTT.");
    await uploadStreamVtt(data.streamUid, data.language, data.vtt);
    await saveWorkspace(context.supabase, data.streamUid, data.language, data.vtt, "published");
    return { language: data.language, vtt: data.vtt, status: "published" as const, updatedAt: new Date().toISOString() };
  });
