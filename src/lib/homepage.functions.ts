import { createServerFn } from "@tanstack/react-start";
import { bodyRegions } from "@/data/body-regions";

export type HomepageMediaOverride = { image_url: string; image_alt: string };
export type HomepageRegionCounts = { recipes: number; programs: number };
export type HomepageRegionData = {
  media: Record<string, HomepageMediaOverride>;
  counts: Record<string, HomepageRegionCounts>;
};

const regionAliases: Record<string, string[]> = {
  "spine-rib-cage": ["spine-rib-cage", "spine-ribs"],
};

function belongsToRegion(regions: string[] | null, slug: string) {
  const accepted = regionAliases[slug] ?? [slug];
  return (regions ?? []).some((region) => accepted.includes(region));
}

export const getHomepageRegionData = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageRegionData> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [mediaResult, recipeResult, programResult] = await Promise.all([
      supabaseAdmin.from("site_media").select("key,image_url,image_alt").like("key", "body-region:%"),
      supabaseAdmin.from("recipes").select("regions").eq("published", true),
      supabaseAdmin.from("programs").select("regions").eq("published", true),
    ]);

    const error = mediaResult.error || recipeResult.error || programResult.error;
    if (error) throw new Error(error.message);

    return {
      media: Object.fromEntries(
        (mediaResult.data ?? []).map((item) => [
          item.key,
          { image_url: item.image_url, image_alt: item.image_alt },
        ]),
      ),
      counts: Object.fromEntries(
        bodyRegions.map((region) => [
          region.slug,
          {
            recipes: (recipeResult.data ?? []).filter((row) =>
              belongsToRegion(row.regions, region.slug),
            ).length,
            programs: (programResult.data ?? []).filter((row) =>
              belongsToRegion(row.regions, region.slug),
            ).length,
          },
        ]),
      ),
    };
  },
);
