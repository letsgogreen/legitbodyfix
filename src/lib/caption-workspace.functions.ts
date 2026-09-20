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

export type CaptionGlossaryEntry = {
  sourceTerm: string;
  targetTerm: string;
  note: string;
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

function parseVtt(vtt: string) {
  const blocks = vtt.replace(/\r/g, "").split(/\n{2,}/);
  return blocks.flatMap((block, blockIndex) => {
    const lines = block.split("\n");
    const timingIndex = lines.findIndex((line) => line.includes(" --> "));
    if (timingIndex < 0) return [];
    return [{ blockIndex, text: lines.slice(timingIndex + 1).join("\n") }];
  });
}

function replaceCueText(vtt: string, translated: Array<{ blockIndex: number; text: string }>) {
  const replacement = new Map(translated.map((item) => [item.blockIndex, item.text]));
  return vtt.replace(/\r/g, "").split(/\n{2,}/).map((block, blockIndex) => {
    const next = replacement.get(blockIndex);
    if (next === undefined) return block;
    const lines = block.split("\n");
    const timingIndex = lines.findIndex((line) => line.includes(" --> "));
    return [...lines.slice(0, timingIndex + 1), next].join("\n");
  }).join("\n\n");
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
    const [{ data: rows, error }, { data: glossary, error: glossaryError }] = await Promise.all([
      (context.supabase as any).from("caption_workspaces").select("language,vtt,status,updated_at").eq("stream_uid", data.streamUid),
      (context.supabase as any).from("caption_glossary").select("source_term,target_term,note").order("source_term"),
    ]);
    if (error) throw new Error(error.message);
    if (glossaryError) throw new Error(glossaryError.message);
    return {
      workspaces: (rows ?? []).map((row: any) => ({ language: row.language, vtt: row.vtt, status: row.status, updatedAt: row.updated_at })) as CaptionWorkspace[],
      glossary: (glossary ?? []).map((row: any) => ({ sourceTerm: row.source_term, targetTerm: row.target_term, note: row.note })) as CaptionGlossaryEntry[],
      openAiConfigured: Boolean(process.env["OPENAI_API_KEY"]),
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

export const saveCaptionGlossary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ entries: z.array(z.object({ sourceTerm: z.string().min(1).max(120), targetTerm: z.string().min(1).max(120), note: z.string().max(300) })).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    const table = (context.supabase as any).from("caption_glossary");
    const { error: deleteError } = await table.delete().neq("id", 0);
    if (deleteError) throw new Error(deleteError.message);
    if (data.entries.length) {
      const { error } = await table.insert(data.entries.map((entry) => ({ source_term: entry.sourceTerm, target_term: entry.targetTerm, note: entry.note })));
      if (error) throw new Error(error.message);
    }
    return data.entries;
  });

export const translateCaptionWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ streamUid: uid, englishVtt: z.string().min(6).max(1_000_000) }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured on the server.");
    const cues = parseVtt(data.englishVtt);
    if (!cues.length) throw new Error("No WebVTT cues were found.");
    const { data: glossary, error } = await (context.supabase as any).from("caption_glossary").select("source_term,target_term,note").order("source_term");
    if (error) throw new Error(error.message);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env["OPENAI_TRANSLATION_MODEL"] || "gpt-5-mini",
        store: false,
        instructions: "Translate exercise and anatomy captions from English to natural Korean. Preserve meaning, keep each cue concise, apply the glossary exactly, and return one translation for every supplied blockIndex.",
        input: JSON.stringify({ glossary: glossary ?? [], cues }),
        text: { format: { type: "json_schema", name: "caption_translation", strict: true, schema: { type: "object", additionalProperties: false, properties: { translations: { type: "array", items: { type: "object", additionalProperties: false, properties: { blockIndex: { type: "integer" }, text: { type: "string" } }, required: ["blockIndex", "text"] } } }, required: ["translations"] } } },
      }),
    });
    const payload = await response.json() as any;
    if (!response.ok) throw new Error(payload?.error?.message || `OpenAI translation failed (${response.status}).`);
    const outputText = payload.output?.flatMap((item: any) => item.content ?? []).find((item: any) => item.type === "output_text")?.text;
    if (!outputText) throw new Error("OpenAI returned no translation.");
    const parsed = z.object({ translations: z.array(z.object({ blockIndex: z.number().int(), text: z.string() })) }).parse(JSON.parse(outputText));
    const vtt = replaceCueText(data.englishVtt, parsed.translations);
    await saveWorkspace(context.supabase, data.streamUid, "ko", vtt, "draft");
    return { language: "ko" as const, vtt, status: "draft" as const, updatedAt: new Date().toISOString() };
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
