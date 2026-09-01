import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { removeStoredContentImages } from "@/lib/content-images.functions";

type Program = Database["public"]["Tables"]["programs"]["Row"];

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return adminClaims.app_metadata?.is_admin === true && adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}

const programInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180),
  outcome: z.string().trim().max(2000).nullable().optional(),
  whoItsFor: z.string().trim().max(2000).nullable().optional(),
  format: z.string().trim().max(160).nullable().optional(),
  durationLabel: z.string().trim().max(120).nullable().optional(),
  level: z.string().trim().max(120).nullable().optional(),
  regions: z.array(z.string().trim().min(1).max(80)).max(12),
  goals: z.array(z.string().trim().min(1).max(120)).max(24),
  paddleProductId: z.string().trim().max(120).nullable().optional(),
  entitlementKey: z.string().trim().max(180).nullable().optional(),
  imageUrl: z.string().trim().max(1000).nullable().optional(),
  imageAlt: z.string().trim().max(300).nullable().optional(),
  featured: z.boolean(),
  featuredRank: z.number().int().min(1).max(9999).nullable().optional(),
  published: z.boolean(),
});

export const getAdminPrograms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Program[]> => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const { data, error } = await context.supabase
      .from("programs")
      .select("*")
      .order("featured_rank", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveAdminProgram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => programInput.parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const payload = {
      name: data.name,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
      outcome: data.outcome || null,
      who_its_for: data.whoItsFor || null,
      format: data.format || null,
      duration_label: data.durationLabel || null,
      level: data.level || null,
      regions: data.regions,
      goals: data.goals,
      paddle_product_id: data.paddleProductId || null,
      entitlement_key: data.entitlementKey || null,
      image_url: data.imageUrl || null,
      image_alt: data.imageAlt || null,
      featured: data.featured,
      featured_rank: data.featuredRank || null,
      published: data.published,
    };
    const query = data.id
      ? context.supabase.from("programs").update(payload).eq("id", data.id)
      : context.supabase.from("programs").insert(payload);
    const { data: program, error } = await query.select("*").single();
    if (error) throw new Error(error.message);
    return program;
  });

export const setAdminProgramPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({
    programId: z.string().uuid(),
    published: z.boolean(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const { data: program, error } = await context.supabase
      .from("programs")
      .update({ published: data.published })
      .eq("id", data.programId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return program;
  });

export const getProgramDeleteImpact = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ programId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const [orderResult, entitlementResult, lessonResult, moduleResult] = await Promise.all([
      context.supabase.from("orders").select("id", { count: "exact", head: true }).eq("program_id", data.programId),
      context.supabase.from("entitlements").select("id", { count: "exact", head: true }).eq("program_id", data.programId),
      context.supabase.from("lessons").select("id", { count: "exact", head: true }).eq("program_id", data.programId),
      context.supabase.from("program_modules").select("id", { count: "exact", head: true }).eq("program_id", data.programId),
    ]);
    const error = orderResult.error ?? entitlementResult.error ?? lessonResult.error ?? moduleResult.error;
    if (error) throw new Error(error.message);
    return {
      orders: orderResult.count ?? 0,
      entitlements: entitlementResult.count ?? 0,
      lessons: lessonResult.count ?? 0,
      modules: moduleResult.count ?? 0,
    };
  });

export const deleteAdminProgram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ programId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const [programResult, lessonResult] = await Promise.all([
      context.supabase.from("programs").select("image_url").eq("id", data.programId).maybeSingle(),
      context.supabase.from("lessons").select("thumbnail_url").eq("program_id", data.programId),
    ]);
    const lookupError = programResult.error ?? lessonResult.error;
    if (lookupError) throw new Error(lookupError.message);

    const { error } = await context.supabase.from("programs").delete().eq("id", data.programId);
    if (error) throw new Error(error.message);

    const cleanupErrors: string[] = [];
    await Promise.all([
      removeStoredContentImages(context.supabase, "program-images", [programResult.data?.image_url]).catch((cause) => {
        cleanupErrors.push(cause instanceof Error ? cause.message : String(cause));
      }),
      removeStoredContentImages(context.supabase, "lesson-images", (lessonResult.data ?? []).map((lesson) => lesson.thumbnail_url)).catch((cause) => {
        cleanupErrors.push(cause instanceof Error ? cause.message : String(cause));
      }),
    ]);
    return { ok: true, storageCleanupWarning: cleanupErrors.length ? cleanupErrors.join("; ") : null };
  });
