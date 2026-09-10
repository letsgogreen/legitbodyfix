import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import { supabase } from "@/integrations/supabase/client";
import { scrapeRecipeSources, type ScrapedRecipeSource } from "@/lib/recipe-scrape.functions";

export const Route = createFileRoute("/admin/recipes/scrape")({
  head: () => ({ meta: [{ title: "Collect recipe sources — LegitBodyFix Admin" }, { name: "robots", content: "noindex" }] }),
  component: RecipeSourceCollector,
});

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "external-source";
}

function RecipeSourceCollector() {
  const navigate = useNavigate();
  const scrape = useServerFn(scrapeRecipeSources);
  const [input, setInput] = useState("");
  const [sources, setSources] = useState<ScrapedRecipeSource[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [state, setState] = useState<"idle" | "loading" | "saving">("idle");
  const [message, setMessage] = useState("");
  const urls = useMemo(() => [...new Set(input.split(/\r?\n/).map((value) => value.trim()).filter(Boolean))].slice(0, 20), [input]);

  async function collect() {
    setState("loading"); setMessage("");
    try {
      const result = await scrape({ data: { urls } });
      setSources(result);
      setSelected(new Set(result.map((item, index) => item.error ? -1 : index).filter((index) => index >= 0)));
      setMessage(`${result.filter((item) => !item.error).length} source(s) ready for review.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not collect sources."); }
    finally { setState("idle"); }
  }

  async function createDrafts() {
    const picked = sources.filter((_, index) => selected.has(index) && !sources[index]?.error);
    if (!picked.length) return;
    setState("saving"); setMessage("");
    const stamp = Date.now().toString(36);
    const records = picked.map((source, index) => ({
      title: source.title,
      slug: `${slugify(source.title)}-${stamp}-${index + 1}`,
      summary: source.description || source.excerpt.slice(0, 320) || null,
      evidence: `Source: ${source.siteName}\n${source.url}\n\nCollected excerpt (verify before publishing):\n${source.excerpt}`,
      image_url: source.imageUrl,
      image_alt: source.imageUrl ? `${source.title} — source preview` : null,
      review_status: "needs_data_review" as const,
      published: false,
    }));
    const { data, error } = await supabase.from("recipes").insert(records).select("id");
    setState("idle");
    if (error) { setMessage(`Could not create drafts: ${error.message}`); return; }
    if (data?.length === 1) { await navigate({ to: "/admin/recipes/$recipeId", params: { recipeId: data[0].id } }); return; }
    setMessage(`${data?.length ?? 0} source draft(s) created. Nothing was published.`);
  }

  return <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
    <PageHead title="Collect external sources" meta="Paste up to 20 public HTTPS pages · review first · drafts only" actions={<Link to="/admin/recipes" className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-bold"><ArrowLeft className="h-3.5 w-3.5" /> Movement content</Link>} />
    <Panel className="mt-5 p-5">
      <label className="text-sm font-bold" htmlFor="source-urls">Source URLs, one per line</label>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">Collects metadata and short excerpts. Original text remains owned by its publisher; verify accuracy and reuse rights before publishing.</p>
      <textarea id="source-urls" value={input} onChange={(event) => setInput(event.target.value)} rows={7} placeholder={'https://orthoinfo.aaos.org/...\nhttps://www.choosept.com/...'} className="mt-4 w-full rounded-sm border border-border bg-background p-3 font-mono text-xs leading-6" />
      <div className="mt-3 flex flex-wrap items-center gap-3"><Btn variant="ink" disabled={!urls.length || state !== "idle"} onClick={() => void collect()}>{state === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Collect {urls.length || ""} source{urls.length === 1 ? "" : "s"}</Btn>{message && <span className="text-xs text-muted-foreground" role="status">{message}</span>}</div>
    </Panel>
    {sources.length > 0 && <>
      <div className="mt-7 flex items-end justify-between gap-4 border-b border-border pb-3"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Review queue</p><h2 className="mt-1 text-xl font-extrabold">Choose sources to turn into drafts</h2></div><Btn variant="accent" disabled={!selected.size || state !== "idle"} onClick={() => void createDrafts()}>{state === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create {selected.size} draft{selected.size === 1 ? "" : "s"}</Btn></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{sources.map((source, index) => <Panel key={`${source.url}-${index}`} className="overflow-hidden">
        {source.imageUrl && <img src={source.imageUrl} alt="" className="aspect-[16/7] w-full border-b border-border object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
        <div className="p-4"><div className="flex items-start gap-3"><input type="checkbox" className="mt-1" checked={selected.has(index)} disabled={Boolean(source.error)} onChange={() => setSelected((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; })} aria-label={`Select ${source.title || source.url}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Tag tone={source.error ? "warn" : "accent"}>{source.error ? "failed" : "collected"}</Tag><span className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{source.siteName}</span></div><h3 className="mt-3 text-lg font-extrabold leading-tight">{source.title || source.url}</h3>{source.error ? <p className="mt-2 text-sm text-destructive">{source.error}</p> : <><p className="mt-2 text-sm leading-6 text-muted-foreground">{source.description || source.excerpt || "No useful description was found."}</p><a href={source.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-bold underline underline-offset-4">Open source <ExternalLink className="h-3 w-3" /></a></>}</div></div></div>
      </Panel>)}</div>
    </>}
  </div>;
}
