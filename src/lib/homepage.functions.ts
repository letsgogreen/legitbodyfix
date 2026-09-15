import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { bodyRegions } from "@/data/body-regions";
import { homepageCopyDefaults, normalizeHomepageCopyValue, type HomepageCopy, type HomepageCopyKey } from "@/data/homepage-copy";
import type { Database } from "@/integrations/supabase/types";

export type HomepageMediaOverride = { image_url: string; image_alt: string };
export type HomepageRegionCounts = { recipes: number; programs: number };
export type HomepageRegionData = {
  media: Record<string, HomepageMediaOverride>;
  counts: Record<string, HomepageRegionCounts>;
  copy: HomepageCopy;
};

const regionAliases: Record<string, string[]> = {
  "spine-rib-cage": ["spine-rib-cage", "spine-ribs"],
};

function belongsToRegion(regions: string[] | null, slug: string) {
  const accepted = regionAliases[slug] ?? [slug];
  return (regions ?? []).some((region) => accepted.includes(region));
}

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Homepage resource data is not configured.");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const getHomepageRegionData = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageRegionData> => {
    const supabase = publicClient();
    const [mediaResult, recipeResult, programResult, copyResult] = await Promise.all([
      supabase.from("site_media").select("key,image_url,image_alt").like("key", "body-region:%").abortSignal(AbortSignal.timeout(10000)),
      supabase.from("recipes").select("regions").eq("published", true).abortSignal(AbortSignal.timeout(10000)),
      supabase.from("programs").select("regions").eq("published", true).abortSignal(AbortSignal.timeout(10000)),
      supabase.from("site_copy").select("key,value").abortSignal(AbortSignal.timeout(10000)),
    ]);

    const error = mediaResult.error || recipeResult.error || programResult.error;
    if (error) throw new Error(error.message);

    const copy = { ...homepageCopyDefaults } as HomepageCopy;
    if (!copyResult.error) {
      for (const item of copyResult.data ?? []) {
        if (item.key in copy && item.value.trim()) {
          const key = item.key as HomepageCopyKey;
          copy[key] = normalizeHomepageCopyValue(key, item.value);
        }
      }
    }

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
      copy,
    };
  },
);
