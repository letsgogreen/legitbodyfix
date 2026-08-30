import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { fetchPaddlePrices } from "@/lib/paddle.functions";
import type { Database } from "@/integrations/supabase/types";

export type PublicProgram = {
  id: string;
  slug: string;
  name: string;
  outcome: string | null;
  format: string | null;
  duration: string | null;
  level: string | null;
  regions: string[];
  goals: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  price: string | null;
  paddlePriceId: string | null;
};

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Public program data is not configured.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const getPublicPrograms = createServerFn({ method: "GET" }).handler(async (): Promise<PublicProgram[]> => {
  const { data, error } = await publicClient()
    .from("programs")
    .select("id,slug,name,outcome,format,duration_label,level,regions,goals,image_url,image_alt,paddle_price_id,featured_rank")
    .eq("published", true)
    .order("featured_rank", { ascending: true, nullsFirst: false })
    .order("name");
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const prices = await fetchPaddlePrices(
    rows.map((row) => row.paddle_price_id).filter((id): id is string => Boolean(id)),
  );
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    outcome: row.outcome,
    format: row.format,
    duration: row.duration_label,
    level: row.level,
    regions: row.regions ?? [],
    goals: row.goals ?? [],
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    price: row.paddle_price_id ? prices[row.paddle_price_id] ?? null : null,
    paddlePriceId: row.paddle_price_id,
  }));
});
