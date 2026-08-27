import { ArrowUpRight, ImageIcon, RefreshCw, Search } from "lucide-react";
import { Btn, Panel, Tag } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export type GuideLibraryStatus = "all" | "draft" | "published" | "needs-review";

export type GuideLibraryItem = {
  id: string;
  slug: string;
  title: string;
  patternSummary: string | null;
  regions: string[];
  published: boolean;
  reviewStatus: string;
  imageUrl: string | null;
  imageAlt: string;
  recipeCount: number;
  muscleCount: number;
  programCount: number;
};

type GuideLibraryProps = {
  guides: GuideLibraryItem[];
  loading: boolean;
  error: string | null;
  query: string;
  status: GuideLibraryStatus;
  region: string;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: GuideLibraryStatus) => void;
  onRegionChange: (value: string) => void;
  onSelect: (guideId: string) => void;
  onCreate: () => void;
  onRetry: () => void;
};

const statusOptions: { value: GuideLibraryStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "needs-review", label: "Needs review" },
];

function needsReview(guide: GuideLibraryItem) {
  return guide.reviewStatus.startsWith("needs_");
}

export function GuideLibrary({
  guides,
  loading,
  error,
  query,
  status,
  region,
  onQueryChange,
  onStatusChange,
  onRegionChange,
  onSelect,
  onCreate,
  onRetry,
}: GuideLibraryProps) {
  const regions = Array.from(new Set(guides.flatMap((guide) => guide.regions))).sort((a, b) =>
    a.localeCompare(b),
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleGuides = guides.filter((guide) => {
    const matchesQuery =
      !normalizedQuery ||
      guide.title.toLocaleLowerCase().includes(normalizedQuery) ||
      guide.slug.toLocaleLowerCase().includes(normalizedQuery) ||
      guide.regions.some((item) => item.toLocaleLowerCase().includes(normalizedQuery));
    const matchesRegion = !region || guide.regions.includes(region);
    const matchesStatus =
      status === "all" ||
      (status === "published" && guide.published) ||
      (status === "draft" && !guide.published && !needsReview(guide)) ||
      (status === "needs-review" && needsReview(guide));
    return matchesQuery && matchesRegion && matchesStatus;
  });
  const publishedCount = guides.filter((guide) => guide.published).length;
  const needsReviewCount = guides.filter(needsReview).length;
  const draftCount = guides.filter((guide) => !guide.published && !needsReview(guide)).length;

  return (
    <section aria-labelledby="guide-library-title" className="mt-5">
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="All guides" value={guides.length} />
        <SummaryStat label="Published" value={publishedCount} />
        <SummaryStat label="Draft" value={draftCount} />
        <SummaryStat label="Needs review" value={needsReviewCount} />
      </div>

      <Panel className="mt-4 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Guide library
            </p>
            <h2 id="guide-library-title" className="mt-1 text-xl font-extrabold tracking-tight">
              Review and choose a guide
            </h2>
          </div>
          <label className="relative block min-w-0 xl:w-80">
            <span className="sr-only">Search guides</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search title, slug, or region"
              className="min-h-10 w-full rounded-sm border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ink"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2" aria-label="Filter by publication state">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusChange(option.value)}
                aria-pressed={status === option.value}
                className={cn(
                  "min-h-9 rounded-sm border px-3 py-1.5 text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink",
                  status === option.value
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-border bg-background hover:bg-secondary",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="ml-auto flex min-w-52 items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Region
            </span>
            <select
              value={region}
              onChange={(event) => onRegionChange(event.target.value)}
              className="min-h-9 min-w-0 flex-1 rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <option value="">All regions</option>
              {regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      {loading ? (
        <GuideLibrarySkeleton />
      ) : error ? (
        <GuideLibraryEmptyState
          title="Guide library could not load"
          description={error}
          action={
            <Btn variant="ink" onClick={onRetry}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </Btn>
          }
        />
      ) : guides.length === 0 ? (
        <GuideLibraryEmptyState
          title="No posture guides yet"
          description="Create the first guide, then connect recipes, muscles, and programs."
          action={
            <Btn variant="ink" onClick={onCreate}>
              Create guide
            </Btn>
          }
        />
      ) : visibleGuides.length === 0 ? (
        <GuideLibraryEmptyState
          title="No guides match these filters"
          description="Change the search phrase, publication state, or body region."
        />
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card px-4 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

export function GuideCard({
  guide,
  onSelect,
}: {
  guide: GuideLibraryItem;
  onSelect: (guideId: string) => void;
}) {
  const statusLabel = guide.published ? "Live" : needsReview(guide) ? "Needs review" : "Draft";
  const statusTone = guide.published ? "accent" : needsReview(guide) ? "warn" : "muted";

  return (
    <button
      type="button"
      onClick={() => onSelect(guide.id)}
      className="group flex min-w-0 flex-col overflow-hidden rounded-sm border border-border bg-card text-left outline-none transition-colors hover:border-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
      aria-label={`Edit ${guide.title}`}
    >
      <div className="relative grid h-52 place-items-center overflow-hidden border-b border-border bg-secondary/35 p-4">
        {guide.imageUrl ? (
          <img
            src={guide.imageUrl}
            alt={guide.imageAlt}
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid place-items-center gap-2 text-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              No guide image
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Tag tone={statusTone}>{statusLabel}</Tag>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {guide.regions.length ? guide.regions.join(" · ") : "Region not assigned"}
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-extrabold leading-tight tracking-tight">{guide.title}</h3>
            <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">
              /{guide.slug}
            </p>
          </div>
          <ArrowUpRight
            className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {guide.patternSummary || "Add a pattern summary to make this guide easier to review."}
        </p>
        <div className="mt-5 grid grid-cols-3 border-t border-border pt-4 text-center">
          <RelationshipCount label="Recipes" value={guide.recipeCount} />
          <RelationshipCount label="Muscles" value={guide.muscleCount} />
          <RelationshipCount label="Programs" value={guide.programCount} />
        </div>
        <span className="mt-5 inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide">
          Edit guide <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

function RelationshipCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l border-border first:border-l-0">
      <strong className="block text-base tabular-nums">{value}</strong>
      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function GuideLibraryEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Panel className="mt-4 grid min-h-60 place-items-center p-8 text-center">
      <div className="max-w-md">
        <h3 className="text-xl font-extrabold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    </Panel>
  );
}

function GuideLibrarySkeleton() {
  return (
    <div
      className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
      aria-label="Loading guides"
      aria-busy="true"
    >
      {[0, 1, 2].map((item) => (
        <div key={item} className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="h-52 animate-pulse border-b border-border bg-secondary" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-1/3 animate-pulse bg-secondary" />
            <div className="h-6 w-2/3 animate-pulse bg-secondary" />
            <div className="h-16 animate-pulse bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}
