import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, FileUp, Loader2, Undo2 } from "lucide-react";
import { Btn, PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { supabase } from "@/integrations/supabase/client";
import {
  bundledKnowledgeBaseRows,
  buildPreview,
  parseFile,
  type PreviewRow,
} from "@/lib/muscle-import";

export const Route = createFileRoute("/admin/muscles/import")({
  head: () => ({
    meta: [
      { title: "Bulk import — LegitBodyFix Admin" },
      {
        name: "description",
        content: "Parse a CSV or JSON muscle file, review row-level changes, then commit.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BulkImport,
});

type Phase = "idle" | "parsing" | "previewed" | "committing" | "committed";

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

function BulkImport() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [existing, setExisting] = useState<Map<string, Record<string, unknown>>>(new Map());
  const [limit, setLimit] = useState(5);
  const [filter, setFilter] = useState<"all" | PreviewRow["outcome"]>("all");
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
      .order("created_at", { ascending: false })
      .limit(10);
    setBatches((data ?? []) as BatchRow[]);
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  async function preview(source: Record<string, unknown>[], label: string) {
    setPhase("parsing");
    setError("");
    setResult("");
    setExpanded(null);
    try {
      const { data, error: readError } = await supabase.from("muscles").select("*");
      if (readError) throw readError;
      const map = new Map(
        (data ?? []).map((record) => [record.id, record as unknown as Record<string, unknown>]),
      );
      setExisting(map);
      setRows(buildPreview(source, map));
      setFilename(label);
      setPhase("previewed");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPhase("idle");
    }
  }

  async function onFile(file: File) {
    try {
      const contents = await file.text();
      await preview(parseFile(file.name, contents), file.name);
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
      const { data: batch, error: batchError } = await supabase
        .from("import_batches")
        .insert({
          source_filename: filename,
          source_format: filename.toLowerCase().endsWith(".csv") ? "csv" : "json",
          status: "previewed",
          total_rows: rows.length,
          new_count: counts.new,
          updated_count: counts.updated,
          unchanged_count: counts.unchanged,
          invalid_count: counts.invalid,
          affected_muscle_ids: selected.map((row) => row.record.id),
        })
        .select("id")
        .single();
      if (batchError) throw batchError;

      const payload = selected.map((row) => ({
        ...row.record,
        review_status: "needs_data_review" as const,
        last_import_batch_id: batch.id,
        last_imported_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from("muscles")
        .upsert(payload, { onConflict: "id" });
      if (upsertError) throw upsertError;

      const { error: rowsError } = await supabase.from("import_rows").insert(
        rows.map((row) => ({
          batch_id: batch.id,
          row_number: row.rowNumber,
          outcome: row.outcome,
          matched_muscle_id: row.record.id,
          matched_by: "id",
          raw_data: row.raw as never,
          parsed_data: row.record as never,
          diff: row.diff as never,
          issues: row.issues as never,
          applied: selected.some((entry) => entry.rowNumber === row.rowNumber),
          previous_snapshot: (existing.get(row.record.id) ?? null) as never,
        })),
      );
      if (rowsError) throw rowsError;

      await supabase
        .from("import_batches")
        .update({ status: "committed", committed_at: new Date().toISOString() })
        .eq("id", batch.id);

      setResult(`${selected.length} record(s) written as drafts. Nothing was published.`);
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
        .select("matched_muscle_id, outcome, previous_snapshot")
        .eq("batch_id", batchId)
        .eq("applied", true);
      if (readError) throw readError;

      const restore = (data ?? []).filter((row) => row.previous_snapshot);
      const remove = (data ?? [])
        .filter((row) => !row.previous_snapshot && row.matched_muscle_id)
        .map((row) => row.matched_muscle_id as string);

      for (const row of restore) {
        const snapshot = row.previous_snapshot as Record<string, unknown>;
        const { error: restoreError } = await supabase
          .from("muscles")
          .upsert(snapshot as never, { onConflict: "id" });
        if (restoreError) throw restoreError;
      }

      if (remove.length) {
        const { error: deleteError } = await supabase.from("muscles").delete().in("id", remove);
        if (deleteError) throw deleteError;
      }

      const { error: batchError } = await supabase
        .from("import_batches")
        .update({ status: "rolled_back", rolled_back_at: new Date().toISOString() })
        .eq("id", batchId);
      if (batchError) throw batchError;

      setResult(
        `Rolled back: ${remove.length} record(s) removed, ${restore.length} restored to their previous values.`,
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
        title="Bulk import"
        meta="Parse → preview every row → commit a sample → review before publishing"
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
          <input
            ref={fileInput}
            type="file"
            accept=".csv,.json,application/json,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFile(file);
            }}
          />
          <Btn variant="ink" onClick={() => fileInput.current?.click()}>
            <FileUp className="h-3.5 w-3.5" aria-hidden="true" /> Choose CSV or JSON
          </Btn>
          <Btn onClick={() => void preview(bundledKnowledgeBaseRows(), "knowledge-base.json")}>
            Use bundled knowledge base (179)
          </Btn>
          {phase === "parsing" && (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Parsing and
              diffing…
            </span>
          )}
          {filename && phase !== "parsing" && (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {filename}
            </span>
          )}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground">
          Imports always land as unpublished drafts. Publishing stays a separate, manual review
          step.
        </p>
        {error && (
          <p className="mt-3 flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </Panel>

      {rows.length > 0 && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {(["new", "updated", "unchanged", "invalid"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(filter === key ? "all" : key)}
                className="rounded-sm border border-border bg-card p-4 text-left"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {key}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight">{counts[key]}</p>
              </button>
            ))}
          </div>

          <Panel className="mt-5 flex flex-wrap items-end gap-4 p-4">
            <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em]">
              Rows to commit in this run
              <input
                type="number"
                min={1}
                max={applicable.length || 1}
                value={limit}
                onChange={(event) => setLimit(Math.max(1, Number(event.target.value) || 1))}
                className="min-h-10 w-36 rounded-sm border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              {selected.length} of {applicable.length} applicable row(s) selected · invalid and
              unchanged rows are never written
            </p>
            <Btn
              variant="accent"
              className="ml-auto min-h-10"
              disabled={!selected.length || phase === "committing"}
              onClick={() => void commit()}
            >
              {phase === "committing" ? "Committing…" : `Commit ${selected.length} row(s)`}
            </Btn>
          </Panel>

          {result && (
            <Panel className="mt-3 border-accent p-4 text-sm">
              {result}{" "}
              <Link to="/admin/muscles" className="font-bold underline">
                Open the review queue
              </Link>
            </Panel>
          )}

          <Panel className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr>
                  <Th className="w-14">#</Th>
                  <Th>Outcome</Th>
                  <Th>Muscle</Th>
                  <Th>Changes</Th>
                  <Th>Issues</Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const fields = Object.keys(row.diff);
                  const open = expanded === row.rowNumber;
                  return (
                    <Fragment key={row.rowNumber}>
                      <tr
                        className="cursor-pointer align-top hover:bg-secondary/50"
                        onClick={() => setExpanded(open ? null : row.rowNumber)}
                      >
                        <Td className="font-mono text-xs text-muted-foreground">{row.rowNumber}</Td>
                        <Td>
                          <Tag tone={outcomeTone[row.outcome]}>{row.outcome}</Tag>
                        </Td>
                        <Td>
                          <p className="font-bold">{row.record.name || "—"}</p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {row.record.id}
                          </p>
                        </Td>
                        <Td className="text-xs text-muted-foreground">
                          {fields.length
                            ? `${fields.length} field(s): ${fields.join(", ")}`
                            : row.outcome === "new"
                              ? "All fields (new record)"
                              : "—"}
                        </Td>
                        <Td className="text-xs">
                          {row.issues.length ? (
                            <ul className="space-y-0.5">
                              {row.issues.map((issue) => (
                                <li
                                  key={issue.message}
                                  className={
                                    issue.level === "error"
                                      ? "text-destructive"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {issue.message}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </Td>
                      </tr>
                      {open && (
                        <tr className="bg-secondary/40">
                          <Td />
                          <Td colSpan={4}>
                            <div className="grid gap-2">
                              {fields.length ? (
                                fields.map((field) => (
                                  <div key={field} className="grid gap-1 text-xs sm:grid-cols-[10rem_1fr]">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                      {field}
                                    </span>
                                    <span>
                                      <s className="text-muted-foreground">
                                        {short(row.diff[field]?.from)}
                                      </s>{" "}
                                      → <strong>{short(row.diff[field]?.to)}</strong>
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  No field-level changes against the current database record.
                                </p>
                              )}
                            </div>
                          </Td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {rows.length > visible.length && (
              <p className="p-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Showing first {visible.length} of {rows.length} rows
              </p>
            )}
          </Panel>
        </>
      )}

      <Panel className="mt-5 overflow-x-auto">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.1em]">Import batches</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Rollback removes rows this batch created and restores rows it changed
          </p>
        </div>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr>
              <Th>Source</Th>
              <Th>Status</Th>
              <Th>Applied</Th>
              <Th>When</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-secondary/50">
                <Td className="font-bold">{batch.source_filename ?? "—"}</Td>
                <Td>
                  <Tag tone={batch.status === "rolled_back" ? "warn" : "ink"}>{batch.status}</Tag>
                </Td>
                <Td className="font-mono text-xs">{batch.affected_muscle_ids.length}</Td>
                <Td className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {new Date(batch.committed_at ?? batch.created_at).toLocaleString()}
                </Td>
                <Td className="text-right">
                  {batch.status === "committed" ? (
                    <Btn
                      disabled={rollingBack === batch.id}
                      onClick={() => void rollback(batch.id)}
                    >
                      <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {rollingBack === batch.id ? "Rolling back…" : "Roll back"}
                    </Btn>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      —
                    </span>
                  )}
                </Td>
              </tr>
            ))}
            {!batches.length && (
              <tr>
                <Td colSpan={5} className="text-center text-xs text-muted-foreground">
                  No import batches yet.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
