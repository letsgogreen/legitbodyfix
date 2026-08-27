import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { MUSCLE_COLUMNS, muscleFromRow, type MuscleRow } from "@/lib/muscles";

function publicClient() {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/** Published muscles only — the anon RLS policy also enforces this server-side. */
export const listPublishedMuscles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("muscles")
    .select(MUSCLE_COLUMNS)
    .eq("published", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("listPublishedMuscles failed:", error.message);
    return { muscles: [], error: "Muscle library is temporarily unavailable." };
  }

  return {
    muscles: ((data ?? []) as unknown as MuscleRow[]).map(muscleFromRow),
    error: null as string | null,
  };
});

export const getPublishedMuscle = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data: input }) => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("muscles")
      .select(MUSCLE_COLUMNS)
      .eq("id", input.id)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error("getPublishedMuscle failed:", error.message);
      return null;
    }

    if (!data) return null;

    const [recipeResult, guideResult] = await Promise.all([
      supabase
        .from("recipe_muscles")
        .select("role,recipes(id,slug,title,goal,summary,image_url,image_alt,published)")
        .eq("muscle_id", input.id),
      supabase
        .from("guide_muscles")
        .select("role,guides(id,slug,title,pattern_summary,published)")
        .eq("muscle_id", input.id),
    ]);

    if (recipeResult.error) {
      console.error("muscle recipe links failed:", recipeResult.error.message);
    }
    if (guideResult.error) {
      console.error("muscle guide links failed:", guideResult.error.message);
    }

    const recipes = (recipeResult.data ?? []).flatMap((row) => {
      const recipe = row.recipes as unknown as {
        id: string;
        slug: string;
        title: string;
        goal: string | null;
        summary: string | null;
        image_url: string | null;
        image_alt: string | null;
        published: boolean;
      } | null;
      return recipe?.published ? [{ ...recipe, role: row.role as "tight" | "weak" }] : [];
    });

    const guides = (guideResult.data ?? []).flatMap((row) => {
      const guide = row.guides as unknown as {
        id: string;
        slug: string;
        title: string;
        pattern_summary: string | null;
        published: boolean;
      } | null;
      return guide?.published ? [{ ...guide, role: row.role as "tight" | "weak" | null }] : [];
    });

    const [recipePrograms, guidePrograms] = await Promise.all([
      recipes.length
        ? supabase
            .from("program_recipes")
            .select("programs(slug,name,outcome,published)")
            .in(
              "recipe_id",
              recipes.map((recipe) => recipe.id),
            )
        : Promise.resolve({ data: [], error: null }),
      guides.length
        ? supabase
            .from("guide_programs")
            .select("programs(slug,name,outcome,published)")
            .in(
              "guide_id",
              guides.map((guide) => guide.id),
            )
        : Promise.resolve({ data: [], error: null }),
    ]);

    const programMap = new Map<
      string,
      { slug: string; name: string; outcome: string | null; published: boolean }
    >();
    for (const row of [...(recipePrograms.data ?? []), ...(guidePrograms.data ?? [])]) {
      const program = row.programs as unknown as {
        slug: string;
        name: string;
        outcome: string | null;
        published: boolean;
      } | null;
      if (program?.published) programMap.set(program.slug, program);
    }

    return {
      ...muscleFromRow(data as unknown as MuscleRow),
      recipes,
      guides,
      programs: [...programMap.values()],
    };
  });
