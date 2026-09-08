import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { conditionSchema, conditionIssues, type Condition } from "@/lib/conditions";
import { saveCondition } from "@/lib/conditions.functions";
import { RecipeBlockEditor } from "@/components/admin/RecipeBlockEditor";
import { RecipeBlockContent } from "@/components/recipes/RecipeBlockContent";
import { validateRecipeBlocks } from "@/lib/recipe-blocks";

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
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [preview, setPreview] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const dirty = !!draft && JSON.stringify(draft) !== saved;
  useEffect(() => {
    let active = true;
    setReady(false);
    void (async () => {
      const [catalogResponse, videosResponse, drafts, publications] = await Promise.all([
        fetch("/assets/data/knowledge-base.json"), fetch("/assets/data/videos.json"),
        (supabase as SupabaseClient).from("condition_drafts").select("slug,data,version"),
        (supabase as SupabaseClient).from("condition_publications").select("slug,published"),
      ]);
      if (drafts.error || publications.error) throw new Error("Conditions database is not ready or access was denied. Apply the Conditions migration and sign in as administrator.");
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
    })().catch(error => { if (active) setStatus(error instanceof Error ? error.message : String(error)); });
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
  const selectedPrograms = draft?.relatedVideoIds.split(",").map(id => id.trim()).filter(Boolean) ?? [];
  return <div className="mx-auto max-w-7xl p-5 sm:p-8">
    <h1 className="text-3xl font-bold">Conditions</h1>
    <p className="mt-2 text-muted-foreground">Write a guide. Add supporting details when you need them.</p>
    <p role="status" className="my-4 text-sm text-muted-foreground">{status} {dirty ? "Unsaved changes — save your draft before leaving." : ""}</p>
    {!ready ? <button onClick={() => setAttempt(value => value + 1)} className="border p-3">Retry</button> : <>
      <label className="block">Condition<select aria-label="Condition" disabled={busy} value={draft?.id ?? ""} onChange={event => { const entry = entries.find(item => item.content.id === event.target.value); if (entry) choose(entry); }} className="my-2 block min-h-12 w-full border bg-background p-3"><option value="">Choose a condition</option>{entries.map(entry => <option key={entry.content.id} value={entry.content.id}>{entry.content.title} · {entry.published ? "Published" : "Draft"}</option>)}</select></label>
      {draft && <>
        <div className="my-5 flex flex-wrap items-center gap-3 border-b border-border bg-background pb-5">
          <button disabled={busy} onClick={() => setPreview(value => !value)} className="border px-4 py-3">{preview ? "Edit" : "Preview"}</button>
          <button disabled={busy} onClick={() => save("draft")} className="border px-4 py-3">Save draft</button>
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
      </>}
    </>}
  </div>;
}
