import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { conditionSchema, conditionIssues, type Condition } from "@/lib/conditions";
import { saveCondition } from "@/lib/conditions.functions";
import { conditionLoadError } from "@/lib/condition-load-error";
import { RecipeBlockEditor } from "@/components/admin/RecipeBlockEditor";
import { RecipeBlockContent } from "@/components/recipes/RecipeBlockContent";
import { validateRecipeBlocks } from "@/lib/recipe-blocks";
import { AdminLoadingState, Tag } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/conditions")({
  head: () => ({ meta: [{ title: "Conditions — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ConditionsAdmin,
});
type Entry = { content: Condition; version: number; published: boolean };
type Program = { id: string; title: string };
const fields = [
  ["title", "Title"], ["conditionCategory", "Category"], ["bodyRegion", "Body region"],
  ["summary", "Summary"], ["screening", "Screening / safety guidance"], ["joints", "Areas involved"],
  ["tags", "Common associations"], ["tightMuscles", "Overactive / restricted"],
  ["weakMuscles", "Underactive"], ["sourceName", "Source name"], ["sourceUrl", "Source URL"],
] as const;
function ConditionsAdmin() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState<Condition | null>(null);
  const [version, setVersion] = useState(0);
  const [saved, setSaved] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [status, setStatus] = useState("Loading…");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [preview, setPreview] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [publicationFilter, setPublicationFilter] = useState<"all" | "published" | "draft">("all");
  const dirty = !!draft && JSON.stringify(draft) !== saved;
  useEffect(() => {
    let active = true;
    setReady(false);
    setLoading(true);
    setStatus("Loading Conditions…");
    void (async () => {
      // Use the same initialized auth client as AdminAuthGate, rather than
      // starting a second client with an independently refreshed session.
      const client = getSupabaseClient();
      if (!client) throw new Error("Supabase is not configured for this environment.");
      const [catalogResponse, videosResponse, drafts, publications] = await Promise.all([
        fetch("/assets/data/knowledge-base.json"), fetch("/assets/data/videos.json"),
        client.from("condition_drafts").select("slug,data,version"),
        client.from("condition_publications").select("slug,published"),
      ]);
      const queryError = drafts.error ?? publications.error;
      if (queryError) {
        throw new Error(conditionLoadError(drafts.error ? "drafts" : "publications", queryError.code));
      }
      if (!catalogResponse.ok || !videosResponse.ok) throw new Error("Could not load existing content.");
      const catalog = await catalogResponse.json();
      const videos = await videosResponse.json();
      const map = new Map<string, Entry>();
      for (const raw of catalog.conditions ?? []) {
        if (raw.pathway !== "musculoskeletal-condition" || !raw.published) continue;
        const content = conditionSchema.parse(raw);
        map.set(content.id, { content, version: 0, published: true });
      }
      for (const row of drafts.data ?? []) {
        const content = conditionSchema.parse(row.data);
        map.set(row.slug, { content, version: row.version, published: map.get(row.slug)?.published ?? false });
      }
      for (const row of publications.data ?? []) {
        const entry = map.get(row.slug);
        if (entry) entry.published = row.published;
      }
      if (!active) return;
      setEntries([...map.values()]);
      setPrograms((Array.isArray(videos) ? videos : videos.videos ?? []).filter((item: Program) => item.id && item.title && item.id !== "breathing-fundamentals"));
      setReady(true); setStatus("Choose a condition. Drafts stay private until you publish.");
    })().catch(error => { if (active) setStatus(error instanceof Error ? error.message : "Could not load Conditions. Please retry."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const intercept = (event: MouseEvent) => {
      if ((event.target as Element).closest?.("a[href]") && !window.confirm("Leave without saving your changes?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", intercept, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", intercept, true); };
  }, [dirty]);
  function choose(entry: Entry) {
    if (saving.current || (dirty && !window.confirm("Discard unsaved changes?"))) return;
    setDraft(entry.content); setVersion(entry.version); setSaved(JSON.stringify(entry.content)); setPreview(false);
    setStatus(entry.published ? "Published. Saving a draft does not change the public page." : "Unpublished draft.");
  }
  function closeEditor() {
    if (saving.current || (dirty && !window.confirm("Return to the condition list and discard unsaved changes?"))) return;
    setDraft(null); setSaved(""); setPreview(false);
    setStatus("Choose a condition. Drafts stay private until you publish.");
  }
  async function save(action: "draft" | "publish" | "unpublish") {
    if (!draft || saving.current) return;
    if (action === "unpublish" && !window.confirm("Hide this condition from the public site?")) return;
    saving.current = true; setBusy(true); setStatus("Saving…");
    const snapshot = draft;
    try {
      const result = await saveCondition({ data: { content: snapshot, version, action } });
      setVersion(result.version); setSaved(JSON.stringify(snapshot));
      setEntries(current => {
        const previous = current.find(item => item.content.id === snapshot.id);
        const entry = { content: snapshot, version: result.version, published: action === "draft" ? previous?.published ?? false : action === "publish" };
        return [...current.filter(item => item.content.id !== snapshot.id), entry];
      });
      setStatus(action === "publish" ? "Published. The public page now uses this version." : action === "unpublish" ? "Unpublished. Your draft is preserved." : "Draft saved. Public content is unchanged.");
    } catch (error) { setStatus(`Save failed: ${error instanceof Error ? error.message : String(error)}`); }
    finally { saving.current = false; setBusy(false); }
  }
  const issues = draft ? conditionIssues(draft) : [];
  const selectedEntry = draft ? entries.find(entry => entry.content.id === draft.id) : undefined;
  const selectedPrograms = draft?.relatedVideoIds.split(",").map(id => id.trim()).filter(Boolean) ?? [];
  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries
      .filter(entry => publicationFilter === "all" || (publicationFilter === "published" ? entry.published : !entry.published))
      .filter(entry => !normalized || [entry.content.title, entry.content.conditionCategory, entry.content.bodyRegion, entry.content.id].some(value => value.toLowerCase().includes(normalized)))
      .sort((a, b) => a.content.title.localeCompare(b.content.title));
  }, [entries, publicationFilter, query]);
  const publishedCount = entries.filter(entry => entry.published).length;
  return <div className="mx-auto max-w-7xl p-5 sm:p-8">
    <h1 className="text-3xl font-bold">Conditions</h1>
    <p className="mt-2 text-muted-foreground">Write a guide. Add supporting details when you need them.</p>
    <p role="status" className="my-4 min-h-5 text-sm text-muted-foreground">{status} {dirty ? "Unsaved changes — save your draft before leaving." : ""}</p>
    {!ready ? loading ? <AdminLoadingState variant="editor" label="Loading conditions" /> : <div role="alert" className="border border-destructive/40 bg-destructive/5 p-5"><p className="font-bold">Conditions could not be loaded</p><p className="mt-2 text-sm text-muted-foreground">{status}</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-4 min-h-11 border border-border bg-background px-4 font-bold">Try again</button></div> : !draft ? <section aria-labelledby="condition-library-title">
      <div className="grid gap-3 border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="block text-sm font-bold" htmlFor="condition-search">Search conditions<div className="relative mt-2"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><input id="condition-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title, category, or body region" className="min-h-11 w-full border border-border bg-background py-2 pl-10 pr-3 font-normal"/></div></label>
        <div className="flex flex-wrap gap-2" aria-label="Filter conditions by publication status">{(["all", "published", "draft"] as const).map(filter => <button key={filter} type="button" aria-pressed={publicationFilter === filter} onClick={() => setPublicationFilter(filter)} className={`min-h-11 border px-4 text-sm font-bold capitalize ${publicationFilter === filter ? "border-foreground bg-foreground text-background" : "border-border bg-background"}`}>{filter}</button>)}</div>
      </div>
      <div className="my-5 flex flex-wrap items-end justify-between gap-3"><div><h2 id="condition-library-title" className="text-xl font-bold">Condition library</h2><p className="mt-1 text-sm text-muted-foreground">{entries.length} total · {publishedCount} published · {entries.length - publishedCount} drafts</p></div><p className="text-sm text-muted-foreground">{filteredEntries.length} shown</p></div>
      {filteredEntries.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filteredEntries.map(entry => { const entryIssues = conditionIssues(entry.content); return <button key={entry.content.id} type="button" onClick={() => choose(entry)} className="group min-h-44 border border-border bg-card p-5 text-left transition hover:border-foreground hover:bg-secondary/30 focus-visible:outline focus-visible:outline-2"><div className="flex items-start justify-between gap-3"><Tag tone={entry.published ? "accent" : "muted"}>{entry.published ? "Published" : "Draft"}</Tag>{entryIssues.length > 0 && <Tag tone="warn">{entryIssues.length} {entryIssues.length === 1 ? "issue" : "issues"}</Tag>}</div><h3 className="mt-5 text-lg font-bold group-hover:underline">{entry.content.title}</h3><p className="mt-2 text-sm text-muted-foreground">{entry.content.conditionCategory || "Uncategorized"} · {entry.content.bodyRegion || "No body region"}</p><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Open editor →</p></button>; })}</div> : <div className="border border-dashed border-border px-5 py-14 text-center"><h3 className="font-bold">No matching conditions</h3><p className="mt-2 text-sm text-muted-foreground">Try a different search or publication filter.</p><button type="button" onClick={() => { setQuery(""); setPublicationFilter("all"); }} className="mt-4 min-h-11 border border-border px-4 font-bold">Clear filters</button></div>}
    </section> : <>
      <button type="button" onClick={closeEditor} className="inline-flex min-h-11 items-center gap-2 border border-border bg-background px-4 text-sm font-bold"><ArrowLeft className="h-4 w-4" aria-hidden="true"/>All conditions</button>
      <>
        <div className="sticky top-[4.5rem] z-30 my-5 flex flex-wrap items-center gap-3 border border-border bg-background/95 p-3 shadow-sm backdrop-blur">
          <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
            <Tag tone={selectedEntry?.published ? "accent" : "muted"}>{selectedEntry?.published ? "Published" : "Draft"}</Tag>
            <Tag tone={dirty ? "warn" : "muted"}>{dirty ? "Unsaved changes" : "All changes saved"}</Tag>
            {issues.length > 0 && <Tag tone="warn">{issues.length} publish {issues.length === 1 ? "issue" : "issues"}</Tag>}
          </div>
          <button disabled={busy} onClick={() => setPreview(value => !value)} className="border px-4 py-3">{preview ? "Edit" : "Preview"}</button>
          <button disabled={busy || !dirty} onClick={() => save("draft")} className="border px-4 py-3 disabled:cursor-not-allowed disabled:opacity-40">{busy ? "Saving…" : "Save draft"}</button>
          <button disabled={busy || issues.length > 0} onClick={() => save("publish")} className="bg-accent px-4 py-3 font-bold disabled:opacity-40">Publish</button>
          <a href={`/conditions/${draft.id}`} target="_blank" rel="noopener noreferrer" className="px-4 py-3 underline">Public page ↗</a>
        </div>
        {issues.length > 0 && <div role="alert" className="mb-6 border border-amber-500 p-4"><strong>Before publishing</strong><ul>{issues.map((issue, index) => <li key={index}>{issue}</li>)}</ul></div>}
        {preview ? <article className="mx-auto max-w-3xl space-y-6"><h2 className="text-4xl font-bold">{draft.title}</h2><p>{draft.summary}</p><RecipeBlockContent blocks={draft.content_blocks}/>{fields.slice(4).map(([key, label]) => draft[key] ? <section key={key}><h3 className="font-bold">{label}</h3><p className="whitespace-pre-line">{draft[key]}</p></section> : null)}<h3 className="font-bold">Related programs</h3>{selectedPrograms.map(id => <p key={id}>{programs.find(item => item.id === id)?.title ?? id}</p>)}</article> : <fieldset disabled={busy} className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section aria-label="Write your guide" className="min-w-0 border border-border bg-card p-5 sm:p-8">
            <label className="block text-xs font-bold text-muted-foreground">TITLE
              <textarea aria-label="Title" value={draft.title} rows={2} onChange={event => setDraft({ ...draft, title: event.target.value })} className="mt-2 w-full resize-y border-0 bg-transparent text-3xl font-extrabold leading-tight focus:outline-accent" />
            </label>
            <label className="mt-4 block text-xs font-bold text-muted-foreground">SHORT INTRODUCTION
              <textarea aria-label="Summary" value={draft.summary} rows={4} placeholder="What will the reader learn from this guide?" onChange={event => setDraft({ ...draft, summary: event.target.value })} className="mt-2 w-full resize-y border-0 bg-transparent text-base font-normal leading-7 focus:outline-accent" />
            </label>
            <div className="mt-6 border-t border-border pt-6">
              <RecipeBlockEditor key={draft.id} recipeId={`condition-${draft.id}`} value={draft.content_blocks} issues={validateRecipeBlocks(draft.content_blocks)} onChange={content_blocks => setDraft({ ...draft, content_blocks })}/>
            </div>
          </section>
          <aside aria-label="Guide settings" className="min-w-0 space-y-4">
            <h2 className="text-lg font-bold">Guide settings</h2>
            <p className="text-sm text-muted-foreground">These details support your article. Existing values are kept unless you edit them.</p>
            <details open className="border border-border p-4"><summary className="cursor-pointer font-bold">Classification</summary><div className="mt-4 space-y-4">{fields.slice(1,3).map(([key,label]) => <label key={key} className="block text-sm">{label}<input value={draft[key]} onChange={event => setDraft({...draft,[key]:event.target.value})} className="mt-1 min-h-11 w-full border border-border bg-card p-2"/></label>)}</div></details>
            <details className="border border-border p-4"><summary className="cursor-pointer font-bold">Safety & assessment</summary><p className="mt-3 text-xs text-muted-foreground">Shown with the public article. Review before publishing.</p><div className="mt-4 space-y-4">{fields.slice(4,9).map(([key,label]) => <label key={key} className="block text-sm">{label}<textarea rows={4} value={draft[key]} onChange={event => setDraft({...draft,[key]:event.target.value})} className="mt-1 w-full border border-border bg-card p-2"/></label>)}</div></details>
            <details className="border border-border p-4"><summary className="cursor-pointer font-bold">Sources</summary><div className="mt-4 space-y-4">{fields.slice(9).map(([key,label]) => <label key={key} className="block text-sm">{label}<input type={key === "sourceUrl" ? "url" : "text"} value={draft[key]} onChange={event => setDraft({...draft,[key]:event.target.value})} className="mt-1 min-h-11 w-full border border-border bg-card p-2"/></label>)}</div></details>
            <details open className="border border-border p-4"><summary className="cursor-pointer font-bold">Related programs · {selectedPrograms.length}</summary><p className="my-3 text-xs text-muted-foreground">Choose which program links appear after the guide.</p>{programs.map(program => <label key={program.id} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={selectedPrograms.includes(program.id)} onChange={event => setDraft({ ...draft, relatedVideoIds: (event.target.checked ? [...selectedPrograms, program.id] : selectedPrograms.filter(id => id !== program.id)).join(",") })}/>{program.title}</label>)}{selectedPrograms.filter(id => !programs.some(program => program.id === id)).map(id => <div key={id} className="mt-3 border border-amber-500 p-2 text-xs">Unavailable link: {id}<button type="button" className="ml-2 underline" onClick={() => setDraft({...draft,relatedVideoIds:selectedPrograms.filter(value => value !== id).join(",")})}>Remove link</button></div>)}</details>
            <details className="border border-border p-4"><summary className="cursor-pointer text-sm">Publishing options</summary><p className="my-3 text-xs text-muted-foreground">Hide the public guide without deleting your draft.</p><button disabled={busy} onClick={() => save("unpublish")} className="min-h-11 border px-4">Unpublish guide</button></details>
          </aside>
        </fieldset>}
      </>
    </>}
  </div>;
}
