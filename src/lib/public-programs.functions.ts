import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { fetchPaddlePrices } from "@/lib/paddle.functions";
import type { Database } from "@/integrations/supabase/types";

export type PublicProgram = {
  id: string;
  slug: string;
  name: string;
  outcome: string | null;
  format: string | null;
  duration: string | null;
  level: string | null;
  regions: string[];
  goals: string[];
  whoItsFor: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  price: string | null;
  paddlePriceId: string | null;
};

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Public program data is not configured.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const getPublicPrograms = createServerFn({ method: "GET" }).handler(async (): Promise<PublicProgram[]> => {
  const { data, error } = await publicClient()
    .from("programs")
    .select("id,slug,name,outcome,format,duration_label,level,regions,goals,who_its_for,image_url,image_alt,paddle_price_id,featured_rank")
    .eq("published", true)
    .order("featured_rank", { ascending: true, nullsFirst: false })
    .order("name");
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const prices = await fetchPaddlePrices(
    rows.map((row) => row.paddle_price_id).filter((id): id is string => Boolean(id)),
  );
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    outcome: row.outcome,
    format: row.format,
    duration: row.duration_label,
    level: row.level,
    regions: row.regions ?? [],
    goals: row.goals ?? [],
    whoItsFor: row.who_its_for,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    price: row.paddle_price_id ? prices[row.paddle_price_id] ?? null : null,
    paddlePriceId: row.paddle_price_id,
  }));
});

export type PublicProgramDetail = PublicProgram & {
  modules: Array<{ id: string; title: string; position: number }>;
  lessons: Array<{ id: string; moduleId: string | null; title: string; summary: string | null; durationSeconds: number | null; previewFree: boolean; thumbnailUrl: string | null; position: number }>;
};

export const getPublicProgramDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<PublicProgramDetail | null> => {
    const client = publicClient();
    const { data: row, error } = await client
      .from("programs")
      .select("id,slug,name,outcome,format,duration_label,level,regions,goals,who_its_for,image_url,image_alt,paddle_price_id")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    const [{ data: modules, error: modulesError }, { data: lessons, error: lessonsError }] = await Promise.all([
      client.from("program_modules").select("id,title,position").eq("program_id", row.id).eq("published", true).order("position"),
      client.from("lessons").select("id,module_id,title,summary,duration_seconds,preview_free,thumbnail_url,stream_thumbnail_url,position").eq("program_id", row.id).eq("published", true).order("position"),
    ]);
    if (modulesError || lessonsError) throw new Error(modulesError?.message || lessonsError?.message || "Curriculum could not be loaded.");
    const prices = await fetchPaddlePrices(row.paddle_price_id ? [row.paddle_price_id] : []);

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      outcome: row.outcome,
      format: row.format,
      duration: row.duration_label,
      level: row.level,
      regions: row.regions ?? [],
      goals: row.goals ?? [],
      whoItsFor: row.who_its_for,
      imageUrl: row.image_url,
      imageAlt: row.image_alt,
      price: row.paddle_price_id ? prices[row.paddle_price_id] ?? null : null,
      paddlePriceId: row.paddle_price_id,
      modules: (modules ?? []).map((module) => ({ id: module.id, title: module.title, position: module.position })),
      lessons: (lessons ?? []).map((lesson) => ({
        id: lesson.id,
        moduleId: lesson.module_id,
        title: lesson.title,
        summary: lesson.summary,
        durationSeconds: lesson.duration_seconds,
        previewFree: lesson.preview_free,
        thumbnailUrl: lesson.thumbnail_url || lesson.stream_thumbnail_url,
        position: lesson.position,
      })),
    };
  });
