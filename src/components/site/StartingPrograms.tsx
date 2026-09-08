import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { matchesDiscoveryRegion } from "@/lib/discovery-program-regions";

type StartingProgram = {
  id: string;
  slug: string;
  name: string;
  outcome: string | null;
  duration: string | null;
  level: string | null;
  format: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  regions: string[] | null;
};

const salesPages: Record<string, string> = {
  "neck-shoulder-reset": "neck-alignment",
  "ankle-recovery": "ankle-sprain-rehabilitation",
  "shoulder-movement": "shoulder-movement",
  "bunion-hallux-valgus-guide": "bunion-hallux-valgus-guide",
};

export function StartingPrograms({ region, title }: { region: string; title: string }) {
  const [programs, setPrograms] = useState<StartingProgram[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let settled = false;
    const controller = new AbortController();
    setPrograms(null);
    setFailed(false);
    const timeout = setTimeout(() => {
      if (active && !settled) {
        settled = true;
        setFailed(true);
        controller.abort();
      }
    }, 15000);
    async function load() {
      const { data, error } = await supabase.from("programs")
        .select("id,slug,name,outcome,duration:duration_label,level,format,imageUrl:image_url,imageAlt:image_alt,regions")
        .eq("published", true)
        .order("featured_rank", { ascending: true, nullsFirst: false })
        .order("name")
        .abortSignal(controller.signal);
      if (error) throw error;
      return data ?? [];
    }
    void load().then((rows) => {
      if (active && !settled) setPrograms(rows);
    }).catch(() => {
      if (active && !settled) setFailed(true);
    }).finally(() => { settled = true; clearTimeout(timeout); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);

  const visible = programs?.filter((program) => matchesDiscoveryRegion(program, region));
  const learnHref = `/movement-check?region=${encodeURIComponent(region)}`;
  if (failed) return <section role="alert" className="border border-border bg-card p-7">
    <h2 className="text-xl font-bold">We couldn’t load programs right now.</h2>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">Try again, or explore the learning resources for {title.toLowerCase()}.</p>
    <div className="mt-5 flex flex-wrap gap-4">
      <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex min-h-11 items-center gap-2 bg-accent px-4 text-sm font-bold"><RefreshCw size={16} /> Try again</button>
      <a href={learnHref} className="inline-flex min-h-11 items-center text-sm underline">Explore learning resources</a>
    </div>
  </section>;
  if (!programs) return <div role="status" className="border border-border bg-card p-9 text-sm text-muted-foreground">Finding published programs for {title.toLowerCase()}…</div>;
  if (!visible?.length) return <section className="border border-border bg-card p-7 sm:p-9">
    <BookOpen size={28} />
    <h2 className="mt-5 text-2xl font-bold">Start with the learning library</h2>
    <p className="mt-3 leading-7 text-muted-foreground">There isn’t a published program for this area yet. You can still explore the available learning resources.</p>
    <a href={learnHref} className="mt-6 inline-flex min-h-12 items-center gap-3 bg-accent px-6 text-sm font-bold">Explore this area <ArrowRight size={16} /></a>
  </section>;
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">{visible.length} published program{visible.length === 1 ? "" : "s"} for {title.toLowerCase()}</p>
    {visible.map((program) => <article key={program.id} className="grid overflow-hidden border border-border bg-card sm:grid-cols-[180px_1fr]">
      <div className="relative flex min-h-48 items-center justify-center bg-secondary/40 p-4">
        <BookOpen size={36} className="text-muted-foreground" aria-hidden="true" />
        {program.imageUrl && <img src={program.imageUrl} alt={program.imageAlt || program.name} loading="lazy" className="absolute inset-0 h-full w-full bg-card object-contain p-4" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
      </div>
      <div className="p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Guided program</p>
        <h2 className="mt-3 text-2xl font-bold">{program.name}</h2>
        {program.outcome && <p className="mt-3 leading-7 text-muted-foreground">{program.outcome}</p>}
        <p className="mt-4 text-sm text-muted-foreground">{(salesPages[program.slug] ? [program.level] : [program.duration, program.level, program.format]).filter(Boolean).join(" · ")}</p>
        <a href={salesPages[program.slug] ? `/video.html?id=${salesPages[program.slug]}` : `/programs/${encodeURIComponent(program.slug)}`} className="mt-6 inline-flex min-h-12 items-center gap-3 bg-accent px-6 text-sm font-bold" aria-label={`View ${program.name} details`}>View program details <ArrowRight size={16} /></a>
        <p className="mt-3 text-xs text-muted-foreground">Review the content and current price on the program page.</p>
      </div>
    </article>)}
  </div>;
}
