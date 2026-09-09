import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function publicClient() {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export type RecipeMuscleLink = {
  id: string;
  name: string;
  group: string | null;
  role: "tight" | "weak";
};

const RECIPE_COLUMNS =
  "id,slug,title,goal,summary,instructions,content_blocks,regions,movement_functions,symptoms_goals,progression_level,dosage,session_minutes,assessment_clues,safety_notes,evidence,equipment,image_url,image_alt,last_reviewed_at";

/** Region filtering happens before the limit, unlike the homepage's curated list. */
export const listRegionRecipes = createServerFn({ method: "GET" })
  .validator((input) => z.object({ region: z.enum(["head-neck", "shoulder-arm", "spine-rib-cage", "hip-pelvis", "knee", "ankle-foot"]) }).parse(input))
  .handler(async ({ data: input }) => {
    try {
      const regions = input.region === "spine-rib-cage" ? ["spine-rib-cage", "spine-ribs"] : [input.region];
      const { data, error } = await publicClient().from("recipes")
        .select("slug,title,summary,goal")
        .eq("published", true)
        .overlaps("regions", regions)
        .order("featured_rank", { ascending: true, nullsFirst: false })
        .order("title")
        .limit(24)
        .abortSignal(AbortSignal.timeout(10000));
      if (error) return { recipes: [], failed: true };
      return { recipes: data ?? [], failed: false };
    } catch {
      return { recipes: [], failed: true };
    }
  });

/** Published recipes only — the anon RLS policy enforces this server-side as well. */
export const getPublishedRecipe = createServerFn({ method: "GET" })
  .validator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = publicClient();

    const { data, error } = await supabase
      .from("recipes")
      .select(RECIPE_COLUMNS)
      .eq("slug", input.slug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error("getPublishedRecipe failed:", error.message);
      return null;
    }
    if (!data) return null;

    // Only links where BOTH the recipe and the muscle are published are visible to anon.
    const { data: linkRows, error: linkError } = await supabase
      .from("recipe_muscles")
      .select("role,muscle_id,muscles(id,name,anatomical_group,published)")
      .eq("recipe_id", data.id);

    if (linkError) console.error("recipe_muscles read failed:", linkError.message);

    const muscles: RecipeMuscleLink[] = (linkRows ?? [])
      .map((row) => {
        const muscle = row.muscles as unknown as {
          id: string;
          name: string;
          anatomical_group: string | null;
        } | null;
        if (!muscle) return null;
        return {
          id: muscle.id,
          name: muscle.name,
          group: muscle.anatomical_group,
          role: row.role as "tight" | "weak",
        };
      })
      .filter((row): row is RecipeMuscleLink => row !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    const { slug, ...rest } = data;

    return {
      ...rest,
      slug,
      tight: muscles.filter((m) => m.role === "tight"),
      weak: muscles.filter((m) => m.role === "weak"),
    };
  });

/** Published recipe cards for the complete posture library. */
export const listPublishedRecipes = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("recipes")
    .select("slug,title,goal,summary,regions,progression_level,image_url,image_alt")
    .eq("published", true)
    .order("featured_rank", { ascending: true, nullsFirst: false })
    .limit(100);

  if (error) {
    console.error("listPublishedRecipes failed:", error.message);
    return [];
  }
  return data ?? [];
});
