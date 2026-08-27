import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, FileUp, ImageOff, Search } from "lucide-react";
import { PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import {
  filterMuscleList,
  getMuscleReadiness,
  groupsOf,
  MUSCLE_COLUMNS,
  muscleFromRow,
  warnOnFixtureMismatch,
  type Muscle,
  type MuscleRow,
} from "@/lib/muscles";
import { getSupabaseClient } from "@/lib/supabase";

export const Route = createFileRoute("/ver1/admin/muscles/")({
  head: () => ({
    meta: [
      { title: "Muscle library — LegitBodyFix Admin" },
      {
        name: "description",
        content: "Review authoritative muscle records, images and publication status.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminMuscles,
});

function AdminMuscles() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [all, setAll] = useState<Muscle[]>([]);
  const [loadState, setLoadState] = useState("Loading records from the database…");

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setLoadState("Database is not configured.");
      return;
    }

    void client
      .from("muscles")
      .select(MUSCLE_COLUMNS)
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setLoadState(`Could not load records: ${error.message}`);
          return;
        }
        const list = ((data ?? []) as unknown as MuscleRow[]).map(muscleFromRow);
        setAll(list);
        warnOnFixtureMismatch(
          "/ver1/admin/muscles",
          list.map((muscle) => muscle.id),
        );
        setLoadState(`${list.length} records loaded from the database.`);
      });
  }, []);

  const muscleGroups = useMemo(() => groupsOf(all), [all]);
  const rows = useMemo(
    () =>
      filterMuscleList(all, query, group).filter(
        (muscle) => statusFilter === "all" || getMuscleReadiness(muscle).key === statusFilter,
      ),
    [all, group, query, statusFilter],
  );
  const publishedCount = all.filter((muscle) => muscle.published).length;
  const readyCount = all.filter((muscle) => getMuscleReadiness(muscle).key === "ready").length;
  const imageReviewCount = all.filter(
    (muscle) => getMuscleReadiness(muscle).key === "image",
  ).length;
  const anatomyReviewCount = all.filter(
    (muscle) => getMuscleReadiness(muscle).key === "anatomy",
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead
        title="Muscle library"
        meta={`${all.length} records · ${publishedCount} published · live from database`}
        actions={
          <>
            <Link
              to="/ver1/admin/muscles/import"
              className="inline-flex min-h-10 items-center gap-2 rounded-sm bg-ink px-3 py-2 text-xs font-bold text-ink-foreground"
            >
              Bulk import <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              to="/muscles"
              target="_blank"
              className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-xs font-bold"
            >
              Public library <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Database records" value={all.length} />
        <Stat label="Published" value={publishedCount} />
        <Stat label="Ready to publish" value={readyCount} />
        <Stat label="Image review" value={imageReviewCount} />
        <Stat label="Anatomy review" value={anatomyReviewCount} />
      </div>

      <Panel className="mt-5 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.35fr)]">
          <label>
            <span className="sr-only">Search muscles</span>
            <span className="flex min-h-11 items-center gap-2 rounded-sm border border-border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, action, origin, or insertion"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
              />
            </span>
          </label>
          <label>
            <span className="sr-only">Filter by anatomical group</span>
            <select
              value={group}
              onChange={(event) => setGroup(event.target.value)}
              className="min-h-11 w-full rounded-sm border border-border bg-background px-3 text-sm"
            >
              <option value="all">All anatomical groups</option>
              {muscleGroups.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {loadState} · publishing stays a separate manual step
        </p>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by review status">
          {[
            ["all", "All", all.length],
            ["live", "Live", publishedCount],
            ["ready", "Ready", readyCount],
            ["image", "Image review", imageReviewCount],
            ["anatomy", "Anatomy review", anatomyReviewCount],
          ].map(([value, label, count]) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={statusFilter === value}
              onClick={() => setStatusFilter(String(value))}
              className={`min-h-10 rounded-sm border px-3 text-xs font-bold ${
                statusFilter === value
                  ? "border-ink bg-ink text-ink-foreground"
                  : "border-border bg-background"
              }`}
            >
              {label} <span className="font-mono text-[10px]">{count}</span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((muscle) => {
          const readiness = getMuscleReadiness(muscle);
          const tone = readiness.key === "live" || readiness.key === "ready" ? "accent" : "muted";

          return (
            <Panel key={muscle.id} className="overflow-hidden">
              <div className="relative grid h-64 place-items-center border-b border-border bg-white p-4">
                {muscle.imageUrl ? (
                  <img
                    src={muscle.imageUrl}
                    alt={muscle.imageAlt || ""}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="grid place-items-center gap-2 text-center text-muted-foreground">
                    <ImageOff className="h-8 w-8" aria-hidden="true" />
                    <span className="text-xs font-bold">No image</span>
                  </div>
                )}
                <span className="absolute left-3 top-3">
                  <Tag tone={tone}>{readiness.label}</Tag>
                </span>
              </div>
              <div className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {muscle.group} {muscle.family ? `· ${muscle.family}` : ""}
                </p>
                <h2 className="mt-2 text-xl font-extrabold tracking-tight">{muscle.title}</h2>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                  {muscle.actions || "No function summary yet."}
                </p>
                {readiness.issues.length > 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Fix next: {readiness.issues.slice(0, 3).join(", ")}
                    {readiness.issues.length > 3 ? ` +${readiness.issues.length - 3}` : ""}
                  </p>
                ) : (
                  <p className="mt-3 text-xs font-bold">Ready for final review.</p>
                )}
                <Link
                  to="/ver1/admin/muscles/$muscleId"
                  params={{ muscleId: muscle.id }}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-sm border border-border px-3 py-2 text-xs font-bold"
                >
                  Review muscle
                </Link>
              </div>
            </Panel>
          );
        })}
      </div>
      {rows.length === 0 && (
        <Panel className="mt-5 p-8 text-center text-sm text-muted-foreground">
          No muscle records match this filter.
        </Panel>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Panel className="p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
    </Panel>
  );
}
