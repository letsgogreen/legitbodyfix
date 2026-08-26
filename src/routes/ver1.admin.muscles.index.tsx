import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, FileUp, Search } from "lucide-react";
import { PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import {
  filterMuscleList,
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
  const rows = useMemo(() => filterMuscleList(all, query, group), [all, query, group]);
  const publishedCount = all.filter((muscle) => muscle.published).length;
  const unpublishedCount = all.length - publishedCount;

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

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Database records" value={all.length} />
        <Stat label="Published" value={publishedCount} />
        <Stat label="Needs review" value={unpublishedCount} />
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
      </Panel>

      <Panel className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr>
              <Th>Image</Th>
              <Th>Muscle</Th>
              <Th>Group</Th>
              <Th>Family</Th>
              <Th>Status</Th>
              <Th>Sources</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((muscle) => (
              <tr key={muscle.id} className="hover:bg-secondary/50">
                <Td>
                  <div className="h-14 w-20 overflow-hidden rounded-sm border border-border bg-secondary">
                    <img
                      src={muscle.imageUrl}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </Td>
                <Td>
                  <p className="font-bold">{muscle.title}</p>
                  <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                    {muscle.actions}
                  </p>
                </Td>
                <Td>{muscle.group}</Td>
                <Td className="text-muted-foreground">{muscle.family || "—"}</Td>
                <Td>
                  <Tag tone={muscle.published ? "accent" : "muted"}>
                    {muscle.published ? "Published" : "Draft"}
                  </Tag>
                </Td>
                <Td>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Anatomy + image
                  </span>
                </Td>
                <Td className="text-right">
                  <Link
                    to="/ver1/admin/muscles/$muscleId"
                    params={{ muscleId: muscle.id }}
                    className="inline-flex min-h-10 items-center rounded-sm border border-border px-3 py-2 text-xs font-bold"
                  >
                    Edit
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No muscle records match this filter.
          </p>
        )}
      </Panel>
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

