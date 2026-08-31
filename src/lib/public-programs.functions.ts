import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { fetchPaddlePrices } from "@/lib/paddle.functions";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

type ProgramClient = ReturnType<typeof publicClient>;

async function loadProgramDetail(
  client: ProgramClient,
  slug: string,
  publishedOnly: boolean,
): Promise<PublicProgramDetail | null> {
    let programQuery = client
      .from("programs")
      .select("id,slug,name,outcome,format,duration_label,level,regions,goals,who_its_for,image_url,image_alt,paddle_price_id")
      .eq("slug", slug);
    if (publishedOnly) programQuery = programQuery.eq("published", true);

    const { data: row, error } = await programQuery.maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    let modulesQuery = client.from("program_modules").select("id,title,position").eq("program_id", row.id);
    let lessonsQuery = client.from("lessons").select("id,module_id,title,summary,duration_seconds,preview_free,thumbnail_url,stream_thumbnail_url,position").eq("program_id", row.id);
    if (publishedOnly) {
      modulesQuery = modulesQuery.eq("published", true);
      lessonsQuery = lessonsQuery.eq("published", true);
    }

    const [{ data: modules, error: modulesError }, { data: lessons, error: lessonsError }] = await Promise.all([
      modulesQuery.order("position"),
      lessonsQuery.order("position"),
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
}

export const getPublicProgramDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => loadProgramDetail(publicClient(), data.slug, true));

export const getAdminProgramPreview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data, context }) => {
    const claims = context.claims as { email?: string; app_metadata?: { is_admin?: boolean } };
    const isAdmin = claims.app_metadata?.is_admin === true
      && claims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
    if (!isAdmin) throw new Error("Administrator access required.");
    return loadProgramDetail(context.supabase as ProgramClient, data.slug, false);
  });
