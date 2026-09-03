import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { bodyRegions } from "@/data/body-regions";
import { supabase } from "@/integrations/supabase/client";

type MediaOverride = { image_url: string; image_alt: string };
type RegionCounts = { recipes: number; programs: number };

const regionAliases: Record<string, string[]> = {
  "spine-rib-cage": ["spine-rib-cage", "spine-ribs"],
};

function belongsToRegion(regions: string[] | null, slug: string) {
  const accepted = regionAliases[slug] ?? [slug];
  return (regions ?? []).some((region) => accepted.includes(region));
}

export function BodyRegionGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [media, setMedia] = useState<Record<string, MediaOverride>>({});
  const [counts, setCounts] = useState<Record<string, RegionCounts>>({});
  const activeRegion = bodyRegions[activeIndex] ?? bodyRegions[0]!;

  useEffect(() => {
    let active = true;

    void Promise.all([
      supabase.from("site_media").select("key,image_url,image_alt").like("key", "body-region:%"),
      supabase.from("recipes").select("regions").eq("published", true),
      supabase.from("programs").select("regions").eq("published", true),
    ]).then(([mediaResult, recipeResult, programResult]) => {
      if (!active) return;

      if (mediaResult.data) {
        setMedia(Object.fromEntries(mediaResult.data.map((item) => [item.key, item])));
      }

      setCounts(
        Object.fromEntries(
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
      );
    });

    return () => {
      active = false;
    };
  }, []);

  const activeMedia = media[`body-region:${activeRegion.slug}`];
  const imageUrl = activeMedia?.image_url || activeRegion.imageUrl;
  const imageAlt = activeMedia?.image_alt || activeRegion.imageAlt;
  const activeCounts = counts[activeRegion.slug] ?? { recipes: 0, programs: 0 };

  const rows = useMemo(
    () =>
      bodyRegions.map((region, index) => ({
        region,
        index,
        active: index === activeIndex,
        counts: counts[region.slug] ?? { recipes: 0, programs: 0 },
      })),
    [activeIndex, counts],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)]">
      <ul className="border-t border-border">
        {rows.map(({ region, index, active, counts: regionCounts }) => (
          <li key={region.slug} className="border-b border-border">
            <Link
              to="/movement-check"
              search={{ region: region.slug }}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              className={`group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 px-4 py-6 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:px-5 ${active ? "bg-ink text-ink-foreground" : "bg-background hover:bg-secondary/60"}`}
            >
              <RegionRowContent
                index={index}
                region={region}
                counts={regionCounts}
                active={active}
              />
            </Link>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="aspect-[4/3] overflow-hidden border-b border-border bg-white">
            <img
              src={imageUrl}
              alt={imageAlt}
              width={1024}
              height={768}
              loading="lazy"
              className="size-full object-contain p-4"
            />
          </div>
          <div className="p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Selected · {activeRegion.title}
            </p>
            <h3 className="mt-3 text-2xl font-extrabold uppercase leading-none">
              {activeRegion.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {activeRegion.intro}
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {activeCounts.recipes} recipes · {activeCounts.programs} programs
            </p>
            <Link
              to="/movement-check"
              search={{ region: activeRegion.slug }}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-5 py-3.5 text-sm font-bold text-accent-foreground"
            >
              Check this region
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function RegionRowContent({
  index,
  region,
  counts,
  active,
}: {
  index: number;
  region: (typeof bodyRegions)[number];
  counts: RegionCounts;
  active: boolean;
}) {
  return (
    <>
      <span
        className={`font-mono text-[11px] tracking-[0.18em] ${active ? "text-accent" : "text-muted-foreground"}`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-extrabold uppercase leading-none sm:text-3xl">
          {region.title}
        </span>
        <span
          className={`mt-2 block font-mono text-[10px] uppercase tracking-[0.18em] ${active ? "text-ink-foreground/65" : "text-muted-foreground"}`}
        >
          {counts.recipes} recipes · {counts.programs} programs
        </span>
      </span>
      <ArrowUpRight
        className={`h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${active ? "text-accent" : "text-muted-foreground"}`}
        aria-hidden="true"
      />
    </>
  );
}
