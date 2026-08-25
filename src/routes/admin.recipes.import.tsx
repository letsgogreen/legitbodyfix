import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowLeft, Download, Loader2, Undo2 } from "lucide-react";
import { Btn, PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { supabase } from "@/integrations/supabase/client";
import { previewNotionRecipes, rehostRecipeCovers } from "@/lib/notion.functions";
import type { RecipePreviewRow } from "@/lib/recipe-import";

export const Route = createFileRoute("/admin/recipes/import")({
  head: () => ({
    meta: [
      { title: "Notion recipe import — LegitBodyFix Admin" },
      {
        name: "description",
        content:
          "Preview the Corrective Exercise Recipe Library from Notion, review every field-level change, then commit as drafts.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecipeImport,
});

type Phase = "idle" | "loading" | "previewed" | "committing" | "committed";

type BatchRow = {
  id: string;
  source_filename: string | null;
  status: string;
  total_rows: number;
  new_count: number;
  updated_count: number;
  affected_muscle_ids: string[];
  created_at: string;
  committed_at: string | null;
  rolled_back_at: string | null;
};

const outcomeTone = {
  new: "accent",
  updated: "ink",
  unchanged: "muted",
  invalid: "warn",
} as const;

function short(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  const text = Array.isArray(value) ? value.join(" · ") : String(value);
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}

function RecipeImport() {
  const runPreview = useServerFn(previewNotionRecipes);
  const runRehost = useServerFn(rehostRecipeCovers);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<RecipePreviewRow[]>([]);
  const [limit, setLimit] = useState(5);
  const [filter, setFilter] = useState<"all" | RecipePreviewRow["outcome"]>("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [rollingBack, setRollingBack] = useState("");

  const counts = useMemo(() => {
    const base = { new: 0, updated: 0, unchanged: 0, invalid: 0 };
    for (const row of rows) base[row.outcome] += 1;
    return base;
  }, [rows]);

  const applicable = useMemo(
    () => rows.filter((row) => row.outcome === "new" || row.outcome === "updated"),
    [rows],
  );
  const selected = useMemo(() => applicable.slice(0, limit), [applicable, limit]);
  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => row.outcome === filter)).slice(0, 200),
    [rows, filter],
  );

  const loadBatches = useCallback(async () => {
    const { data } = await supabase
      .from("import_batches")
      .select(
        "id, source_filename, status, total_rows, new_count, updated_count, affected_muscle_ids, created_at, committed_at, rolled_back_at",
      )
      .eq("source_format", "notion-recipes")
      .order("created_at", { ascending: false })
      .limit(10);
    setBatches((data ?? []) as BatchRow[]);
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  async function preview() {
    setPhase("loading");
    setError("");
    setResult("");
    setExpanded(null);
    try {
      const payload = await runPreview({});
      if (payload.error) throw new Error(payload.error);
      setRows(payload.rows);
      setPhase("previewed");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPhase("idle");
    }
  }

  async function commit() {
    if (!selected.length) return;
    setPhase("committing");
    setError("");

    try {
      const { data: existingRows, error: existingError } = await supabase
        .from("recipes")
        .select("*")
        .in(
          "notion_page_id",
          selected.map((row) => row.record.notion_page_id),
        );
      if (existingError) throw existingError;
      const existing = new Map(
        (existingRows ?? []).map((row) => [row.notion_page_id as string, row]),
      );

      const { data: batch, error: batchError } = await supabase
        .from("import_batches")
        .insert({
          source_filename: "Notion · Corrective Exercise Recipe Library",
          source_format: "notion-recipes",
          status: "previewed",
          total_rows: rows.length,
          new_count: counts.new,
          updated_count: counts.updated,
          unchanged_count: counts.unchanged,
          invalid_count: counts.invalid,
          // Generic text[] column, reused here for the affected recipe slugs.
          affected_muscle_ids: selected.map((row) => row.record.slug),
        })
        .select("id")
        .single();
      if (batchError) throw batchError;

      const payload = selected.map((row) => ({
        ...row.record,
        review_status: "needs_data_review" as const,
        last_synced_at: new Date().toISOString(),
      }));

      const { data: written, error: upsertError } = await supabase
        .from("recipes")
        .upsert(payload as never, { onConflict: "notion_page_id" })
        .select("id, notion_page_id");
      if (upsertError) throw upsertError;

      const idByPage = new Map((written ?? []).map((row) => [row.notion_page_id as string, row.id]));

      // Rewrite muscle links only for the recipes we just wrote, confident matches only.
      const recipeIds = [...idByPage.values()];
      if (recipeIds.length) {
        const { error: clearError } = await supabase
          .from("recipe_muscles")
          .delete()
          .in("recipe_id", recipeIds);
        if (clearError) throw clearError;
      }

      const links = selected.flatMap((row) => {
        const recipeId = idByPage.get(row.record.notion_page_id);
        if (!recipeId) return [];
        return row.muscleLinks
          .filter((link) => link.muscleId && link.matchedBy !== "fuzzy")
          .map((link) => ({
            recipe_id: recipeId,
            muscle_id: link.muscleId as string,
            role: link.role,
          }));
      });

      const uniqueLinks = [
        ...new Map(
          links.map((link) => [`${link.recipe_id}:${link.muscle_id}:${link.role}`, link]),
        ).values(),
      ];

      if (uniqueLinks.length) {
        const { error: linkError } = await supabase.from("recipe_muscles").insert(uniqueLinks);
        if (linkError) throw linkError;
      }

      const { error: rowsError } = await supabase.from("import_rows").insert(
        rows.map((row) => ({
          batch_id: batch.id,
          row_number: row.rowNumber,
          outcome: row.outcome,
          matched_by: "notion_page_id",
          raw_data: row.raw as never,
          parsed_data: row.record as never,
          diff: row.diff as never,
          issues: row.issues as never,
          applied: selected.some((entry) => entry.rowNumber === row.rowNumber),
          previous_snapshot: (existing.get(row.record.notion_page_id) ?? null) as never,
        })),
      );
      if (rowsError) throw rowsError;

      await supabase
        .from("import_batches")
        .update({ status: "committed", committed_at: new Date().toISOString() })
        .eq("id", batch.id);

      // Notion cover URLs expire in ~1h, so copy the bytes into our own storage right away.
      const rehost = await runRehost({
        data: { notionPageIds: selected.map((row) => row.record.notion_page_id) },
      });
      const imageNote = rehost.error
        ? ` Image re-hosting failed: ${rehost.error}`
        : ` ${rehost.results.length} cover image(s) re-hosted into storage${rehost.skipped.length ? `, ${rehost.skipped.length} without a Notion cover` : ""}.`;

      setResult(
        `${selected.length} recipe(s) written as drafts, ${uniqueLinks.length} muscle link(s) attached. Nothing was published.${imageNote}`,
      );
      setPhase("committed");
      void loadBatches();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPhase("previewed");
    }
  }

  async function rollback(batchId: string) {
    setRollingBack(batchId);
    setError("");
    try {
      const { data, error: readError } = await supabase
        .from("import_rows")
        .select("parsed_data, previous_snapshot")
        .eq("batch_id", batchId)
        .eq("applied", true);
      if (readError) throw readError;

      const restore = (data ?? []).filter((row) => row.previous_snapshot);
      const remove = (data ?? [])
        .filter((row) => !row.previous_snapshot)
        .map((row) => (row.parsed_data as { notion_page_id?: string }).notion_page_id)
        .filter((id): id is string => Boolean(id));

      for (const row of restore) {
        const snapshot = row.previous_snapshot as Record<string, unknown>;
        const { error: restoreError } = await supabase
          .from("recipes")
          .upsert(snapshot as never, { onConflict: "id" });
        if (restoreError) throw restoreError;
      }

      if (remove.length) {
        const { error: deleteError } = await supabase
          .from("recipes")
          .delete()
          .in("notion_page_id", remove);
        if (deleteError) throw deleteError;
      }

      const { error: batchError } = await supabase
        .from("import_batches")
        .update({ status: "rolled_back", rolled_back_at: new Date().toISOString() })
        .eq("id", batchId);
      if (batchError) throw batchError;

      setResult(
        `Rolled back: ${remove.length} recipe(s) removed, ${restore.length} restored to their previous values.`,
      );
      void loadBatches();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRollingBack("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead
        title="Notion recipe import"
        meta="Fetch → preview every row → commit a sample → review before publishing"
        actions={
          <Link
            to="/admin/muscles"
            className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-xs font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Muscle library
          </Link>
        }
      />

      <Panel className="mt-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Btn variant="ink" onClick={() => void preview()} disabled={phase === "loading"}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Fetch &amp; preview from Notion
          </Btn>
          {phase === "loading" && (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Reading Notion
              pages, page bodies and muscle relations…
            </span>
          )}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground">
          Imports always land as unpublished drafts. Fuzzy muscle matches are never linked
          automatically. Notion cover images are downloaded and re-hosted in our own storage on
          commit, because Notion&rsquo;s image URLs expire within about an hour.
        </p>
        {error && (
          <p className="mt-3 flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        {result && <p className="mt-3 text-sm font-medium">{result}</p>}
      </Panel>

      {rows.length > 0 && (
        <>
          <Panel className="mt-4 flex flex-wrap items-center gap-3 p-4">
            {(["all", "new", "updated", "unchanged", "invalid"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-sm border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                  filter === key ? "border-ink bg-ink text-ink-foreground" : "border-border"
                }`}
              >
                {key} ({key === "all" ? rows.length : counts[key]})
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Commit first
              </label>
              <input
                type="number"
                min={1}
                max={applicable.length || 1}
                value={limit}
                onChange={(event) => setLimit(Math.max(1, Number(event.target.value) || 1))}
                className="w-20 rounded-sm border border-border bg-background px-2 py-1.5 text-xs"
              />
              <Btn onClick={() => setLimit(applicable.length || 1)}>
                All {applicable.length} applicable
              </Btn>
              <Btn
                variant="accent"
                onClick={() => void commit()}
                disabled={phase === "committing" || !selected.length}
              >
                {phase === "committing" ? "Committing…" : `Commit ${selected.length} as drafts`}
              </Btn>
            </div>
          </Panel>

          <Panel className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr>
                  <Th className="w-12">#</Th>
                  <Th>Recipe</Th>
                  <Th>Outcome</Th>
                  <Th>Regions</Th>
                  <Th>Level</Th>
                  <Th>Muscle links</Th>
                  <Th>Issues</Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const matched = row.muscleLinks.filter(
                    (link) => link.muscleId && link.matchedBy !== "fuzzy",
                  ).length;
                  const isOpen = expanded === row.rowNumber;
                  return (
                    <Fragment key={row.rowNumber}>
                      <tr
                        className="cursor-pointer hover:bg-secondary/50"
                        onClick={() => setExpanded(isOpen ? null : row.rowNumber)}
                      >
                        <Td className="font-mono text-xs text-muted-foreground">{row.rowNumber}</Td>
                        <Td>
                          <span className="font-semibold">{row.record.title}</span>
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                            {row.record.slug}
                          </span>
                        </Td>
                        <Td>
                          <Tag tone={outcomeTone[row.outcome]}>{row.outcome}</Tag>
                        </Td>
                        <Td className="text-xs">{short(row.record.regions)}</Td>
                        <Td className="text-xs">{short(row.record.progression_level)}</Td>
                        <Td className="text-xs">
                          {matched}/{row.muscleLinks.length}
                        </Td>
                        <Td className="text-xs">
                          {row.issues.length ? (
                            <span
                              className={
                                row.issues.some((issue) => issue.level === "error")
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }
                            >
                              {row.issues.length}
                            </span>
                          ) : (
                            "—"
                          )}
                        </Td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <Td colSpan={7} className="bg-secondary/40">
                            <div className="grid gap-4 py-2 lg:grid-cols-2">
                              <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                  Field-level diff
                                </p>
                                {Object.keys(row.diff).length ? (
                                  <ul className="mt-2 space-y-1.5 text-xs">
                                    {Object.entries(row.diff).map(([field, change]) => (
                                      <li key={field}>
                                        <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
                                          {field}
                                        </span>
                                        <div className="text-muted-foreground line-through">
                                          {short(change.from)}
                                        </div>
                                        <div>{short(change.to)}</div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {row.outcome === "new"
                                      ? "New record — nothing to compare against."
                                      : "No field changes."}
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                  Muscle relations
                                </p>
                                <ul className="mt-2 space-y-1 text-xs">
                                  {row.muscleLinks.length ? (
                                    row.muscleLinks.map((link) => (
                                      <li key={`${link.role}-${link.notionPageId}`}>
                                        <Tag tone={link.role === "tight" ? "ink" : "muted"}>
                                          {link.role}
                                        </Tag>{" "}
                                        {link.candidateName} →{" "}
                                        {link.muscleId ? (
                                          <span
                                            className={
                                              link.matchedBy === "fuzzy" ? "text-destructive" : ""
                                            }
                                          >
                                            {link.muscleId} ({link.matchedBy}
                                            {link.score !== null ? ` ${link.score}` : ""})
                                          </span>
                                        ) : (
                                          <span className="text-destructive">no match</span>
                                        )}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-muted-foreground">No relations.</li>
                                  )}
                                </ul>

                                {row.issues.length > 0 && (
                                  <>
                                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                      Issues
                                    </p>
                                    <ul className="mt-2 space-y-1 text-xs">
                                      {row.issues.map((issue, index) => (
                                        <li
                                          key={index}
                                          className={
                                            issue.level === "error"
                                              ? "text-destructive"
                                              : "text-muted-foreground"
                                          }
                                        >
                                          {issue.level}: {issue.message}
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              </div>
                            </div>
                          </Td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </>
      )}

      <Panel className="mt-6 overflow-x-auto">
        <div className="border-b border-border px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Recent recipe batches
          </p>
        </div>
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr>
              <Th>Created</Th>
              <Th>Status</Th>
              <Th>Rows</Th>
              <Th>New / updated</Th>
              <Th>Applied slugs</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {batches.length ? (
              batches.map((batch) => (
                <tr key={batch.id}>
                  <Td className="font-mono text-xs">
                    {new Date(batch.created_at).toLocaleString()}
                  </Td>
                  <Td>
                    <Tag tone={batch.status === "committed" ? "accent" : "muted"}>
                      {batch.status}
                    </Tag>
                  </Td>
                  <Td className="text-xs">{batch.total_rows}</Td>
                  <Td className="text-xs">
                    {batch.new_count} / {batch.updated_count}
                  </Td>
                  <Td className="text-xs">{short(batch.affected_muscle_ids)}</Td>
                  <Td>
                    <Btn
                      onClick={() => void rollback(batch.id)}
                      disabled={batch.status !== "committed" || rollingBack === batch.id}
                    >
                      <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {rollingBack === batch.id ? "Rolling back…" : "Roll back"}
                    </Btn>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan={6} className="text-xs text-muted-foreground">
                  No recipe imports yet.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
