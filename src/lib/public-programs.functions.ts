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
  fallbackImageUrl: string | null;
  imageAlt: string | null;
  price: string | null;
  paddlePriceId: string | null;
};

type PublicProgramRow = Pick<
  Database["public"]["Tables"]["programs"]["Row"],
  "id" | "slug" | "name" | "outcome" | "format" | "duration_label" | "level" | "regions" | "goals" | "who_its_for" | "image_url" | "image_alt" | "paddle_price_id" | "featured_rank"
>;

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Public program data is not configured.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const getPublicPrograms = createServerFn({ method: "GET" }).handler(async (): Promise<PublicProgram[]> => {
  const selectPrograms = (client: ReturnType<typeof publicClient>) => client
    .from("programs")
    .select("id,slug,name,outcome,format,duration_label,level,regions,goals,who_its_for,image_url,image_alt,paddle_price_id,featured_rank")
    .eq("published", true)
    .order("featured_rank", { ascending: true, nullsFirst: false })
    .order("name");

  let rows: PublicProgramRow[] = [];
  const lessonThumbnailByProgram = new Map<string, string>();
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let result = await selectPrograms(supabaseAdmin as ReturnType<typeof publicClient>);
    if (result.error) result = await selectPrograms(supabaseAdmin as ReturnType<typeof publicClient>);
    if (result.error) throw new Error(result.error.message);
    rows = (result.data ?? []) as PublicProgramRow[];

    const programIds = rows.map((row) => row.id);
    const { data: lessons, error: lessonsError } = programIds.length
      ? await supabaseAdmin
        .from("lessons")
        .select("program_id,thumbnail_url,stream_thumbnail_url,position")
        .in("program_id", programIds)
        .order("position")
      : { data: [], error: null };
    if (lessonsError) console.error("Program lesson thumbnails unavailable:", lessonsError.message);
    for (const lesson of lessons ?? []) {
      const thumbnail = lesson.thumbnail_url || lesson.stream_thumbnail_url;
      if (thumbnail && !lessonThumbnailByProgram.has(lesson.program_id)) {
        lessonThumbnailByProgram.set(lesson.program_id, thumbnail);
      }
    }
  } catch (primaryError) {
    console.error("Primary public program query failed; using anonymous fallback:", primaryError);
    const fallback = await selectPrograms(publicClient());
    if (fallback.error) throw new Error(fallback.error.message);
    rows = (fallback.data ?? []) as PublicProgramRow[];
  }
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
    imageUrl: row.image_url || lessonThumbnailByProgram.get(row.id) || null,
    fallbackImageUrl: lessonThumbnailByProgram.get(row.id) || null,
    imageAlt: row.image_alt || (lessonThumbnailByProgram.has(row.id) ? `${row.name} session thumbnail` : null),
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
    const coverLessonsQuery = client.from("lessons").select("thumbnail_url,stream_thumbnail_url,position").eq("program_id", row.id).order("position");
    if (publishedOnly) {
      modulesQuery = modulesQuery.eq("published", true);
      lessonsQuery = lessonsQuery.eq("published", true);
    }

    const [{ data: modules, error: modulesError }, { data: lessons, error: lessonsError }, { data: coverLessons, error: coverLessonsError }] = await Promise.all([
      modulesQuery.order("position"),
      lessonsQuery.order("position"),
      coverLessonsQuery,
    ]);
    if (modulesError || lessonsError || coverLessonsError) throw new Error(modulesError?.message || lessonsError?.message || coverLessonsError?.message || "Curriculum could not be loaded.");
    const prices = await fetchPaddlePrices(row.paddle_price_id ? [row.paddle_price_id] : []);

    const publicLessons = (lessons ?? []).map((lesson) => ({
      id: lesson.id,
      moduleId: lesson.module_id,
      title: lesson.title,
      summary: lesson.summary,
      durationSeconds: lesson.duration_seconds,
      previewFree: lesson.preview_free,
      thumbnailUrl: lesson.thumbnail_url || lesson.stream_thumbnail_url,
      position: lesson.position,
    }));
    const fallbackThumbnail = (coverLessons ?? []).map((lesson) => lesson.thumbnail_url || lesson.stream_thumbnail_url).find(Boolean) ?? null;

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
      imageUrl: row.image_url || fallbackThumbnail,
      fallbackImageUrl: fallbackThumbnail,
      imageAlt: row.image_alt || (fallbackThumbnail ? `${row.name} session thumbnail` : null),
      price: row.paddle_price_id ? prices[row.paddle_price_id] ?? null : null,
      paddlePriceId: row.paddle_price_id,
      modules: (modules ?? []).map((module) => ({ id: module.id, title: module.title, position: module.position })),
      lessons: publicLessons,
    };
}

export const getPublicProgramDetail = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    // Curriculum tables intentionally have no anonymous SELECT policy. Read through the
    // server-only client, while loadProgramDetail still enforces published program/module/lesson
    // filters and returns only the small set of sales-page metadata declared above.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return loadProgramDetail(supabaseAdmin as ProgramClient, data.slug, true);
  });

export const getAdminProgramPreview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { slug: string }) => data)
  .handler(async ({ data, context }) => {
    const claims = context.claims as { email?: string; app_metadata?: { is_admin?: boolean } };
    const isAdmin = claims.app_metadata?.is_admin === true
      && claims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
    if (!isAdmin) throw new Error("Administrator access required.");
    return loadProgramDetail(context.supabase as ProgramClient, data.slug, false);
  });
