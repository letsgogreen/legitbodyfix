import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function assertAdmin(claims: unknown) {
  const value = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  if (value.app_metadata?.is_admin !== true || value.email?.trim().toLowerCase() !== "thriveinside@protonmail.com") throw new Error("Administrator access required.");
}

export const setAdminContentPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ type: z.enum(["recipes", "muscles", "conditions"]), published: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    if (data.type === "conditions") {
      const { data: drafts, error: draftError } = await context.supabase.from("condition_drafts").select("slug");
      if (draftError) throw new Error(draftError.message);
      const rows = (drafts ?? []).map((row) => ({ slug: row.slug, published: data.published }));
      if (rows.length) {
        const { error } = await context.supabase.from("condition_publications").upsert(rows, { onConflict: "slug" });
        if (error) throw new Error(error.message);
      }
      return { ok: true, count: rows.length };
    }
    const table = data.type === "recipes" ? "recipes" : "muscles";
    const { data: rows, error } = await context.supabase.from(table).update({ published: data.published }).not("id", "is", null).select("id");
    if (error) throw new Error(error.message);
    return { ok: true, count: rows?.length ?? 0 };
  });
