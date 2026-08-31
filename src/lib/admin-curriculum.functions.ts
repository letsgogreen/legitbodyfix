import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type Program = Database["public"]["Tables"]["programs"]["Row"];
type Module = Database["public"]["Tables"]["program_modules"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return adminClaims.app_metadata?.is_admin === true && adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}

const lessonInput = z.object({
  id: z.string().uuid().optional(),
  programId: z.string().uuid(),
  moduleId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180),
  summary: z.string().trim().max(2000).nullable().optional(),
  durationSeconds: z.number().int().positive().nullable().optional(),
  videoPath: z.string().trim().max(500).nullable().optional(),
  thumbnailUrl: z.string().trim().max(1000).nullable().optional(),
  position: z.number().int().min(1).max(9999),
  published: z.boolean(),
  previewFree: z.boolean(),
});

export const getAdminCurriculum = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ programId: z.string().uuid().optional() }).parse(input))
  .handler(async ({ data, context }): Promise<{ programs: Program[]; modules: Module[]; lessons: Lesson[]; selectedProgramId: string }> => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const supabase = context.supabase;
    const { data: programs, error: programsError } = await supabase.from("programs").select("*").order("name");
    if (programsError) throw new Error(programsError.message);
    const selectedProgramId = (programs ?? []).some((program) => program.id === data.programId) ? data.programId! : programs?.[0]?.id ?? "";
    if (!selectedProgramId) return { programs: programs ?? [], modules: [], lessons: [], selectedProgramId };

    const [moduleResult, lessonResult] = await Promise.all([
      supabase.from("program_modules").select("*").eq("program_id", selectedProgramId).order("position"),
      supabase.from("lessons").select("*").eq("program_id", selectedProgramId).order("position"),
    ]);
    if (moduleResult.error || lessonResult.error) throw new Error(moduleResult.error?.message ?? lessonResult.error?.message ?? "Could not load curriculum.");
    return { programs: programs ?? [], modules: moduleResult.data ?? [], lessons: lessonResult.data ?? [], selectedProgramId };
  });

export const createAdminModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({
    programId: z.string().uuid(),
    title: z.string().trim().min(1).max(160),
    position: z.number().int().min(1).max(9999),
  }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const supabase = context.supabase;
    const { data: module, error } = await supabase
      .from("program_modules")
      .insert({ program_id: data.programId, title: data.title, position: data.position })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return module;
  });

export const saveAdminLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => lessonInput.parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const supabase = context.supabase;
    const payload = {
      program_id: data.programId,
      module_id: data.moduleId || null,
      title: data.title,
      slug: data.slug,
      summary: data.summary || null,
      duration_seconds: data.durationSeconds || null,
      video_path: data.videoPath || null,
      thumbnail_url: data.thumbnailUrl || null,
      position: data.position,
      published: data.published,
      preview_free: data.previewFree,
    };
    const query = data.id
      ? supabase.from("lessons").update(payload).eq("id", data.id)
      : supabase.from("lessons").insert(payload);
    const { data: lesson, error } = await query.select("*").single();
    if (error) throw new Error(error.message);
    return lesson;
  });
