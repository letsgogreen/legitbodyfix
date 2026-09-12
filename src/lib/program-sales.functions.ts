import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const step = z.object({ phase: z.string().trim().max(80), title: z.string().trim().max(180), description: z.string().trim().max(1000) });
const content = z.object({
  landingEyebrow: z.string().trim().max(120), landingHeadline: z.string().trim().max(240), landingSummary: z.string().trim().max(2000),
  landingWhyHeadline: z.string().trim().max(240), landingBenefit1: z.string().trim().max(1000), landingBenefit2: z.string().trim().max(1000), landingBenefit3: z.string().trim().max(1000),
  landingAudience: z.string().trim().max(2000), landingReassurance: z.string().trim().max(1000),
  techniqueEyebrow: z.string().trim().max(120), techniqueHeadline: z.string().trim().max(240), techniqueBody: z.string().trim().max(2000),
  curriculum: z.array(step).length(3), finalHeadline: z.string().trim().max(240),
  previewStreamUid: z.string().regex(/^[a-f0-9]{32}$/).optional().or(z.literal("")),
  previewStreamStatus: z.enum(["not_uploaded", "uploading", "processing", "ready", "error"]).optional(),
  previewThumbnailUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
});

function isAdmin(claims: unknown) {
  const c = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return c.app_metadata?.is_admin === true && c.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}

export const getAdminProgramSalesPages = createServerFn({ method: "GET" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const { data, error } = await context.supabase.from("program_sales_pages").select("video_id,content,updated_at");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveAdminProgramSalesPage = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .validator((input) => z.object({ videoId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), content }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const { data: saved, error } = await context.supabase.from("program_sales_pages")
      .upsert({ video_id: data.videoId, content: data.content }, { onConflict: "video_id" })
      .select("video_id,content,updated_at").single();
    if (error) throw new Error(error.message);
    return saved;
  });
