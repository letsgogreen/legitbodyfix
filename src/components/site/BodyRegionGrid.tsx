import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { bodyRegions, resolveBodyRegionMedia } from "@/data/body-regions";
import type { HomepageRegionCounts, HomepageRegionData } from "@/lib/homepage.functions";

export function BodyRegionGrid({
  initialData,
  loadFailed = false,
}: {
  initialData: HomepageRegionData | null;
  loadFailed?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const media = initialData?.media ?? {};
  const counts = initialData?.counts ?? {};
  const activeRegion = bodyRegions[activeIndex] ?? bodyRegions[0]!;

  const activeMedia = media[`body-region:${activeRegion.slug}`];
  const { imageUrl, imageAlt } = resolveBodyRegionMedia(activeRegion, activeMedia);
  const activeCounts = counts[activeRegion.slug] ?? null;

  const rows = useMemo(
    () => bodyRegions.map((region, index) => ({
      region,
      index,
      active: index === activeIndex,
      counts: counts[region.slug] ?? null,
    })),
    [activeIndex, counts],
  );

  return (
    <div>
      {loadFailed && (
        <p role="status" className="mb-5 border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Resource totals are temporarily unavailable. You can still explore every body region.
        </p>
      )}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)]">
      <ul className="border-t border-border">
        {rows.map(({ region, index, active, counts: regionCounts }) => (
          <li key={region.slug} className="border-b border-border">
            {active ? (
              <Link
                to="/movement-check"
                search={{ region: region.slug }}
                className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 bg-ink px-4 py-6 text-left text-ink-foreground transition-colors sm:px-5"
              >
                <RegionRowContent index={index} region={region} counts={regionCounts} active />
              </Link>
            ) : (
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                aria-pressed={false}
                className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 bg-background px-4 py-6 text-left transition-colors hover:bg-secondary/60 sm:px-5"
              >
                <RegionRowContent index={index} region={region} counts={regionCounts} active={false} />
              </button>
            )}
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="aspect-[4/3] overflow-hidden border-b border-border bg-white">
            <img src={imageUrl} alt={imageAlt} width={1024} height={768} loading="lazy" className="size-full object-contain p-4" />
          </div>
          <div className="p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Selected · {activeRegion.title}
            </p>
            <h3 className="mt-3 text-2xl font-extrabold uppercase leading-none">{activeRegion.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{activeRegion.intro}</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {formatCounts(activeCounts)}
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
  counts: HomepageRegionCounts | null;
  active: boolean;
}) {
  return (
    <>
      <span className={`font-mono text-[11px] tracking-[0.18em] ${active ? "text-accent" : "text-muted-foreground"}`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-extrabold uppercase leading-none sm:text-3xl">
          {region.title}
        </span>
        <span className={`mt-2 block font-mono text-[10px] uppercase tracking-[0.18em] ${active ? "text-ink-foreground/65" : "text-muted-foreground"}`}>
          {formatCounts(counts)}
        </span>
      </span>
      <ArrowUpRight className={`h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${active ? "text-accent" : "text-muted-foreground"}`} aria-hidden="true" />
    </>
  );
}

function formatCounts(counts: HomepageRegionCounts | null) {
  return counts ? `${counts.recipes} recipes · ${counts.programs} programs` : "Resource totals unavailable";
}
