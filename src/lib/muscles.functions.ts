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
    const { data, error } = await publicClient()
      .from("muscles")
      .select(MUSCLE_COLUMNS)
      .eq("id", input.id)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error("getPublishedMuscle failed:", error.message);
      return null;
    }

    return data ? muscleFromRow(data as unknown as MuscleRow) : null;
  });
