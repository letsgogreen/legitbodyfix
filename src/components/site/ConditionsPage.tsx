import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { mergeConditions, type Condition } from "@/lib/conditions";
import { RecipeBlockContent } from "@/components/recipes/RecipeBlockContent";
import { LearnNav } from "@/components/site/LearnNav";
import { LearnRegionFilter } from "@/components/site/LearnRegionFilter";
import { findBodyRegion } from "@/data/body-regions";

const conditionRegions: Record<string, string[]> = {
  "head-neck": ["Head & neck", "Neck & arm"],
  "shoulder-arm": ["Neck & arm", "Shoulder & scapula", "Wrist & hand"],
  "spine-rib-cage": ["Low back & leg", "Lumbar spine", "Rib cage & trunk"],
  "hip-pelvis": ["Low back & leg", "Pelvis & hip"],
  knee: ["Knee", "Knee & leg"],
  "ankle-foot": ["Ankle & foot", "Foot & ankle"],
};

export function ConditionsPage({ slug, region }: { slug?: string | undefined; region?: string | undefined } = {}) {
  const [items, setItems] = useState<Condition[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 10000);
    setFailed(false);
    setItems(null);
    void fetch("/assets/data/knowledge-base.json", { signal: controller.signal, cache: "no-cache" })
      .then(async (response) => { if (!response.ok) throw new Error("Unavailable"); return response.json(); })
      .then(async (data) => {
        if (!Array.isArray(data.conditions)) throw new Error("Invalid catalog");
        const result = await (supabase as SupabaseClient).from("condition_publications").select("slug,data,published").abortSignal(controller.signal);
        // Only a not-yet-installed migration permits legacy-only mode. Other errors
        // must not resurrect withdrawn content by silently falling back.
        if (result.error && !["42P01", "PGRST205"].includes(result.error.code)) throw result.error;
        if (active) setItems(mergeConditions(data.conditions, result.data ?? []));
      }).catch(() => { if (active) setFailed(true); }).finally(() => clearTimeout(timer));
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [attempt]);
  const selected = items?.find((item) => item.id === slug);
  const activeRegion = findBodyRegion(region);
  const filtered = items?.filter((item) => {
    const matchesRegion = !activeRegion || conditionRegions[activeRegion.slug]?.includes(item.bodyRegion);
    const matchesQuery = [item.title, item.summary, item.bodyRegion, item.tags].join(" ").toLowerCase().includes(query.trim().toLowerCase());
    return matchesRegion && matchesQuery;
  }) ?? [];
  const categories = [...new Set(filtered.map((item) => item.conditionCategory || "Other guides"))];
  return <div className="min-h-screen bg-background text-foreground"><SiteNav />
<LearnNav active="conditions" region={activeRegion?.slug} />
    <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
      {slug && <Link to="/conditions" search={{ region: activeRegion?.slug }} className="mb-6 inline-flex min-h-11 items-center text-sm underline">← All conditions</Link>}
      <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Learn · Conditions</p>
      <h1 className="mt-4 max-w-4xl text-4xl font-extrabold uppercase leading-[0.95] sm:text-6xl">{slug ? selected?.title || "Condition guide" : "Understand the condition."}</h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Educational references, not a diagnosis or a personalized treatment plan.</p>
      {failed ? <div role="alert" className="mt-8 border border-border p-6"><p>We couldn’t load the guides.</p><button className="mt-4 min-h-11 bg-accent px-5 font-bold" onClick={() => setAttempt((value) => value + 1)}>Try again</button></div> : !items ? <p role="status" className="mt-8">Loading guides…</p> : slug ? selected ? <article className="mt-10 max-w-3xl space-y-8">
        <p className="text-lg leading-8">{selected.summary}</p>
        {selected.content_blocks.length > 0 && <RecipeBlockContent blocks={selected.content_blocks} />}
        {([["Areas involved", selected.joints], ["Common associations", selected.tags], ["Movement screen", selected.screening], ["Often overactive or restricted", selected.tightMuscles], ["Often underactive", selected.weakMuscles]] as const).map(([label, value]) => value ? <section key={label} className="border-t border-border pt-6"><h2 className="text-xl font-bold">{label}</h2><p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{value}</p></section> : null)}
        {selected.sourceUrl?.startsWith("https://") && <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="block min-h-11 underline">{selected.sourceName || "Source reference"} ↗</a>}
        {selected.relatedVideoIds?.split(",").filter(Boolean).map((id) => <a key={id} className="inline-flex min-h-12 items-center bg-accent px-5 font-bold" href={`/video.html?id=${encodeURIComponent(id.trim())}`}>View related program →</a>)}
      </article> : <p className="mt-8" role="status">This guide is unavailable. <Link to="/conditions" search={{ region: activeRegion?.slug }} className="underline">Browse published guides</Link>.</p> : <>
        <div className="mt-9"><LearnRegionFilter region={activeRegion?.slug} to="/conditions" noun="guides" /></div>
        <label className="mt-9 block text-sm font-bold" htmlFor="conditions-search">Search within these guides</label><input id="conditions-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ankle, wrist, or radiating symptoms" className="mt-2 min-h-12 w-full max-w-xl border border-border bg-card px-4" />
        <p role="status" className="mt-4 text-sm text-muted-foreground">{filtered.length} guides</p>
        {categories.map((category) => <section key={category} className="mt-10"><h2 className="border-b border-border pb-4 text-2xl font-bold">{category}</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{filtered.filter((item) => (item.conditionCategory || "Other guides") === category).map((item) => <Link key={item.id} to="/conditions/$slug" params={{ slug: item.id }} search={{ region: activeRegion?.slug }} className="flex flex-col border border-border bg-card p-6 hover:border-foreground"><p className="text-xs text-muted-foreground">{item.bodyRegion}</p><h3 className="mt-3 text-xl font-bold">{item.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{item.summary}</p><span className="mt-5 text-sm font-bold">Read guide →</span></Link>)}</div></section>)}
        {!filtered.length && <p className="mt-8">No matching guides. Try another search.</p>}
      </>}
    </main><SiteFooter /></div>;
}
