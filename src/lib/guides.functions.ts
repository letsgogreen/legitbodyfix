import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type GuideMuscleLink = { id: string; name: string; group: string | null; role: string | null };
export type GuideRecipeLink = { slug: string; title: string; goal: string | null };
export type GuideProgramLink = { slug: string; name: string; outcome: string | null; published: boolean };

/**
 * Published guides only. Uses the admin client so the related program can be shown even while
 * it is still unpublished ("Coming soon") — only non-sensitive marketing fields are returned.
 */
export const getPublishedGuide = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: guide, error } = await supabaseAdmin
      .from("guides")
      .select("id,slug,title,pattern_summary,common_regions,self_check,watch_for")
      .eq("slug", input.slug)
      .eq("published", true)
      .maybeSingle();

    if (error) console.error("getPublishedGuide failed:", error.message);
    if (!guide) return null;

    const [recipeRows, muscleRows, programRows] = await Promise.all([
      supabaseAdmin
        .from("guide_recipes")
        .select("recipes(slug,title,goal,published)")
        .eq("guide_id", guide.id),
      supabaseAdmin
        .from("guide_muscles")
        .select("role,muscles(id,name,anatomical_group,published)")
        .eq("guide_id", guide.id),
      supabaseAdmin
        .from("guide_programs")
        .select("programs(slug,name,outcome,published)")
        .eq("guide_id", guide.id),
    ]);

    const recipes: GuideRecipeLink[] = (recipeRows.data ?? [])
      .map((row) => row.recipes as unknown as { slug: string; title: string; goal: string | null; published: boolean } | null)
      .filter((r): r is { slug: string; title: string; goal: string | null; published: boolean } => !!r && r.published)
      .map(({ slug, title, goal }) => ({ slug, title, goal }));

    const muscles: GuideMuscleLink[] = (muscleRows.data ?? [])
      .map((row) => {
        const m = row.muscles as unknown as {
          id: string;
          name: string;
          anatomical_group: string | null;
          published: boolean;
        } | null;
        if (!m || !m.published) return null;
        return { id: m.id, name: m.name, group: m.anatomical_group, role: row.role as string | null };
      })
      .filter((m): m is GuideMuscleLink => m !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    const programs: GuideProgramLink[] = (programRows.data ?? [])
      .map((row) => row.programs as unknown as GuideProgramLink | null)
      .filter((p): p is GuideProgramLink => p !== null);

    return { ...guide, recipes, muscles, programs };
  });

/** Guide (if any) that a given published recipe belongs to — used for the recipe page cross-link. */
export const getGuideForRecipe = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ recipeSlug: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("guide_recipes")
      .select("guides!inner(slug,title,published),recipes!inner(slug)")
      .eq("recipes.slug", input.recipeSlug)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("getGuideForRecipe failed:", error.message);
      return null;
    }
    const guide = data?.guides as unknown as { slug: string; title: string; published: boolean } | null;
    if (!guide?.published) return null;
    return { slug: guide.slug, title: guide.title };
  });
