import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { muscleFromRow, MUSCLE_COLUMNS, type MuscleRow } from "@/lib/muscles";
import { DIRECTORY_FUNCTIONS } from "@/lib/muscle-directory-config";

export const Route = createFileRoute("/api/public/muscle-directory")({
  server: { handlers: { GET: async () => {
    const headers = { "Cache-Control": "no-store" };
    const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) return Response.json({ error: "Muscle directory is not configured." }, { status: 503, headers });
    // Anonymous client + published filter: never expose drafts or bypass RLS.
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.from("muscles")
      .select(`${MUSCLE_COLUMNS},directory_config`).eq("published", true).order("id").limit(1000);
    if (error) {
      console.error("Public muscle directory read failed:", error.code);
      return Response.json({ error: "Muscle directory is temporarily unavailable." }, { status: 503, headers });
    }
    const muscles = ((data ?? []) as unknown as MuscleRow[]).map(row => {
      const muscle = muscleFromRow(row);
      // Historical imports may store prose in functions; keep the legacy inference in that case.
      const roles = muscle.functionalRoles?.filter(role => (DIRECTORY_FUNCTIONS as readonly string[]).includes(role));
      return { ...muscle, functionalRoles: roles?.length ? roles : undefined };
    });
    return Response.json({ muscles }, { headers });
  } } },
});
