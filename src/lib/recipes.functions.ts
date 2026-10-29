import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { normalizeRecipeBlocks } from "@/lib/recipe-blocks";
import { RECIPE_MUSCLE_COLUMNS, type RecipeMuscleEntry } from "@/lib/recipe-muscle-dictionary";
import { recipeSectionMuscles } from "@/lib/recipe-muscle-sections";
import { forwardLeanSlug, forwardLeanConnections, selectForwardLeanConnections } from "@/data/recipe-pattern-connections";

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
  available: boolean;
};

const CANONICAL_RECIPE_MUSCLES: Record<string, Array<{ id: string; name: string; group: string; role: RecipeMuscleLink["role"] }>> = {
  "feet-turn-out": [
    { id: "gastrocnemius", name: "Gastrocnemius", group: "Posterior lower leg", role: "tight" },
    { id: "biceps-femoris", name: "Biceps femoris", group: "Posterior thigh", role: "tight" },
    { id: "semimembranosus", name: "Semimembranosus", group: "Posterior thigh", role: "weak" },
    { id: "semitendinosus", name: "Semitendinosus", group: "Posterior thigh", role: "weak" },
    { id: "gastrocnemius", name: "Gastrocnemius", group: "Posterior lower leg", role: "weak" },
  ],
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

    let muscles: RecipeMuscleLink[] = (linkRows ?? [])
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
          available: true,
        };
      })
      .filter((row): row is RecipeMuscleLink => row !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    const canonical = CANONICAL_RECIPE_MUSCLES[input.slug] ?? [];
    if (canonical.length) {
      const canonicalNames = [...new Set(canonical.map((item) => item.name))];
      const { data: canonicalRows, error: canonicalError } = await supabase
        .from("muscles")
        .select("id,name,anatomical_group")
        .eq("published", true)
        .in("name", canonicalNames);
      if (canonicalError) {
        console.error("canonical recipe muscles read failed:", canonicalError.message);
      } else {
        const byName = new Map((canonicalRows ?? []).map((muscle) => [muscle.name.toLowerCase(), muscle]));
        const fallbackLinks = canonical.map((item) => {
          const muscle = byName.get(item.name.toLowerCase());
          return {
            id: muscle?.id ?? item.id,
            name: muscle?.name ?? item.name,
            group: muscle?.anatomical_group ?? item.group,
            role: item.role,
            available: Boolean(muscle),
          };
        });
        muscles = [...new Map([...muscles, ...fallbackLinks].map((muscle) => [`${muscle.id}:${muscle.role}`, muscle])).values()]
          .sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    const { slug, ...rest } = data;
    const dictionaryIds = [...new Set(normalizeRecipeBlocks(data.content_blocks).flatMap((block) => block.type === "toggle" ? block.muscleIds ?? [] : []))];
    // Public reads never expose draft dictionary content, including to logged-in admins.
    const dictionaryResult = dictionaryIds.length
      ? await supabase.from("muscles").select(RECIPE_MUSCLE_COLUMNS).eq("published", true).in("id", dictionaryIds)
      : { data: [], error: null };
    if (dictionaryResult.error) console.error("recipe dictionary read failed:", dictionaryResult.error.message);
    const sections = recipeSectionMuscles(normalizeRecipeBlocks(data.content_blocks));
    if (sections.managedRoles.size) {
      const entries = (dictionaryResult.data ?? []) as unknown as RecipeMuscleEntry[];
      muscles = [...muscles.filter((entry) => !sections.managedRoles.has(entry.role)), ...sections.links.flatMap((link) => {
        const entry = entries.find((candidate) => candidate.id === link.muscle_id);
        return entry ? [{id: entry.id, name: entry.name, group: entry.anatomical_group, role: link.role, available: true}] : [];
      })];
    }

    // Editorial links are resolved against published records only, never invented routes.
    const relatedResult = input.slug === forwardLeanSlug
      ? await supabase.from("recipes")
        .select("slug,title,image_url,image_alt")
        .eq("published", true)
        .in("slug", forwardLeanConnections.map((connection) => connection.slug))
        .abortSignal(AbortSignal.timeout(5000))
      : { data: [], error: null };
    if (relatedResult.error) console.error("related recipe read failed:", relatedResult.error.message);

    return {
      ...rest,
      slug,
      relatedRecipes: selectForwardLeanConnections(relatedResult.data ?? []),
      muscleDictionary: (dictionaryResult.data ?? []) as unknown as RecipeMuscleEntry[],
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
