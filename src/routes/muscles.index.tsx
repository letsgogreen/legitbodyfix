import { useMemo, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { MuscleCard } from "@/components/site/MuscleCard";
import { filterMuscleList, groupsOf, warnOnFixtureMismatch } from "@/lib/muscles";
import { listPublishedMuscles } from "@/lib/muscles.functions";

export const Route = createFileRoute("/muscles/")({
  beforeLoad: () => {
    // Only redirect the directory; /muscles/$muscleId remains available.
    throw redirect({ href: "/knowledge.html?type=muscles", reloadDocument: true });
  },
  loader: () => listPublishedMuscles(),
  errorComponent: () => (
    <main className="mx-auto max-w-3xl px-5 py-24">
      <h1 className="text-3xl font-extrabold">Muscle library unavailable</h1>
      <p className="mt-3 text-muted-foreground">Please try again in a moment.</p>
    </main>
  ),
  head: () => ({
    meta: [
      { title: "Muscle Library | LegitBodyFix" },
      {
        name: "description",
        content:
          "Explore muscle anatomy by region, attachment and action with source-linked illustrations.",
      },
    ],
  }),
  component: MuscleLibrary,
});

function MuscleLibrary() {
  const { muscles: published } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const muscleGroups = useMemo(() => groupsOf(published), [published]);
  const results = useMemo(
    () => filterMuscleList(published, query, group),
    [published, query, group],
  );

  warnOnFixtureMismatch(
    "/muscles",
    published.map((muscle) => muscle.id),
    "published",
  );

  return (
    <main>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Anatomy reference
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.55fr)] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-extrabold uppercase leading-[0.9] tracking-[-0.055em] sm:text-7xl">
                Muscle library.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Search {published.length} muscles by name, body region, attachment, or
                action. Each entry preserves its source and image credit.
              </p>
            </div>

            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Search the library
              </span>
              <span className="mt-2 flex min-h-12 items-center gap-3 rounded-sm border border-border bg-card px-4 focus-within:ring-2 focus-within:ring-ring">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try infraspinatus or shoulder rotation"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                />
              </span>
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex max-w-full gap-2 overflow-x-auto pb-1"
            aria-label="Filter by body region"
          >
            <FilterButton active={group === "all"} onClick={() => setGroup("all")}>
              All
            </FilterButton>
            {muscleGroups.map((item) => (
              <FilterButton key={item} active={group === item} onClick={() => setGroup(item)}>
                {item}
              </FilterButton>
            ))}
          </div>
          <p
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
            aria-live="polite"
          >
            {results.length} results
          </p>
        </div>

        {results.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((muscle) => (
              <MuscleCard key={muscle.id} muscle={muscle} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-sm border border-border bg-secondary p-8 text-center">
            <h2 className="text-xl font-extrabold">No muscles found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another name, action, or body region.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-sm border px-3 py-2 text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "border-ink bg-ink text-ink-foreground"
          : "border-border bg-background hover:border-foreground/40"
      }`}
    >
      {children}
    </button>
  );
}
