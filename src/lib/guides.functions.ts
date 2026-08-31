import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type GuideMuscleLink = { id: string; name: string; group: string | null; role: string | null };
export type GuideRecipeLink = {
  slug: string;
  title: string;
  goal: string | null;
  summary: string | null;
  image_url: string | null;
  image_alt: string | null;
};
export type GuideProgramLink = { slug: string; name: string; outcome: string | null; published: boolean };

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Guide data is not configured.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Published guides only. */
export const getPublishedGuide = createServerFn({ method: "GET" })
  .validator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = publicClient();

    const { data: guide, error } = await supabase
      .from("guides")
      .select("id,slug,title,pattern_summary,common_regions,self_check,watch_for")
      .eq("slug", input.slug)
      .eq("published", true)
      .maybeSingle();

    if (error) console.error("getPublishedGuide failed:", error.message);
    if (!guide) return null;

    const [recipeRows, muscleRows, programRows] = await Promise.all([
      supabase
        .from("guide_recipes")
        .select("recipes(slug,title,goal,summary,image_url,image_alt,published)")
        .eq("guide_id", guide.id),
      supabase
        .from("guide_muscles")
        .select("role,muscles(id,name,anatomical_group,published)")
        .eq("guide_id", guide.id),
      supabase
        .from("guide_programs")
        .select("programs(slug,name,outcome,published)")
        .eq("guide_id", guide.id),
    ]);

    const recipes: GuideRecipeLink[] = (recipeRows.data ?? [])
      .map((row) => row.recipes as unknown as (GuideRecipeLink & { published: boolean }) | null)
      .filter((r): r is GuideRecipeLink & { published: boolean } => !!r && r.published)
      .map(({ published: _published, ...recipe }) => recipe);

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
  .validator((input) => z.object({ recipeSlug: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = publicClient();

    const { data, error } = await supabase
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
