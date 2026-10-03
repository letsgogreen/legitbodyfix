import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, BookOpen, Dumbbell } from "lucide-react";
import { bodyRegions, findBodyRegion } from "@/data/body-regions";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { StartingPrograms } from "@/components/site/StartingPrograms";

export const Route = createFileRoute("/start")({
  validateSearch: (search: Record<string, unknown>) => ({
    region: typeof search.region === "string" && findBodyRegion(search.region) ? search.region : undefined,
    intent: search.intent === "learn" || search.intent === "program" ? search.intent : undefined,
  }),
  head: () => ({ meta: [{ title: "Find your starting point | LegitBodyFix" }] }),
  component: Start,
});

function Start() {
  const { region: slug, intent } = Route.useSearch();
  const navigate = Route.useNavigate();
  const region = findBodyRegion(slug);
  const relatedPrograms = region?.programs.filter((program) => program.available) ?? [];
  const step = !region ? 1 : !intent ? 2 : 3;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) headingRef.current?.focus();
    previousStep.current = step;
  }, [step]);
  const actionClass = "inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-accent px-6 py-3 text-sm font-bold text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-4";
  return <div className="min-h-screen bg-background text-foreground">
    <SiteNav />
    <main className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <a href="/" className="inline-flex min-h-11 items-center gap-2 text-sm"><ArrowLeft size={16} /> Home</a>
        <p className="font-mono text-xs uppercase tracking-widest">Your starting point · {step} of 3</p>
      </div>
      <ol aria-label="Your progress" className="mt-7 grid grid-cols-3 gap-3 text-xs sm:text-sm">
        {["Choose an area", "Choose your approach", "Get started"].map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} className={`border-t-4 pt-3 ${step >= index + 1 ? "border-foreground font-bold" : "border-border text-muted-foreground"}`}>{index + 1}. {label}</li>)}
      </ol>
      <div className="py-12" key={step}>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Small steps. A clearer direction.</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight outline-none sm:text-6xl">{step === 1 ? "Where would you like to start?" : step === 2 ? "How would you like to explore?" : "A starting point for you."}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{step === 1 ? "Choose one area to explore. You can change it at any time." : step === 2 ? `${region?.title}: browse at your own pace or follow a guided session.` : "These links follow your selections. Explore the details before choosing what to try."}</p>
        {step === 1 && <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bodyRegions.map((item, index) => <button key={item.slug} type="button" onClick={() => void navigate({ search: { region: item.slug, intent: undefined } })} className="group min-h-40 border border-border bg-card p-6 text-left transition-colors hover:border-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4">
            <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><span className="mt-4 flex items-center justify-between gap-3 text-xl font-bold">{item.title}<ArrowRight size={18} /></span><span className="mt-2 block text-sm leading-6 text-muted-foreground">{item.description}</span>
          </button>)}
        </div>}
        {step === 2 && <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <a href={`/movement-check?region=${encodeURIComponent(region!.slug)}`} className="group flex flex-col border border-border bg-card p-7 text-left hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-4">
            <BookOpen size={26} />
            <span className="mt-8 block text-2xl font-bold">{region!.title} learning resources</span>
            <span className="mt-3 block flex-1 leading-7 text-muted-foreground">Browse the articles, muscle references, conditions, and related resources for this area.</span>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold">Explore this area <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
          </a>
          {relatedPrograms.length ? relatedPrograms.map((program) => <a key={program.href} href={program.href} className="group flex flex-col border border-border bg-card p-7 text-left hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-4">
            <div className="flex items-start justify-between gap-4">
              <Dumbbell size={26} />
              <span className="bg-accent px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-accent-foreground">Available program</span>
            </div>
            <span className="mt-8 block text-2xl font-bold">{program.title}</span>
            <span className="mt-3 block flex-1 leading-7 text-muted-foreground">{program.description}</span>
            {program.meta && <span className="mt-5 border-t border-border pt-4 font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{program.meta}</span>}
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">View program details <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
          </a>) : <button type="button" onClick={() => void navigate({ search: { region: slug, intent: "program" } })} className="border border-border bg-card p-7 text-left hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-4">
            <Dumbbell size={26} />
            <span className="mt-8 block text-2xl font-bold">Follow a guided program</span>
            <span className="mt-3 block leading-7 text-muted-foreground">See available sessions and what each program includes before buying.</span>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold">Check availability <ArrowRight size={16} /></span>
          </button>}
        </div>}
        {step === 3 && region && <div className="mt-9 space-y-4" aria-live="polite">
          <p className="text-sm font-bold">{region.title} · {intent === "program" ? "Guided programs" : "Learn at your own pace"}</p>
          {intent === "program" ? <StartingPrograms region={region.slug} title={region.title} /> : <article className="border border-border bg-card p-7 sm:p-9"><BookOpen size={28} /><h2 className="mt-5 text-2xl font-bold">{region.title} learning resources</h2><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Browse the articles, muscle references, and related resources for your selected area.</p><a href={`/movement-check?region=${encodeURIComponent(region.slug)}`} className={`${actionClass} mt-7`}>Explore this area <ArrowRight size={16} /></a></article>}
          <a className="inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4" href="/library">Already own a program? Open your library <ArrowRight size={16} /></a>
        </div>}
        {step > 1 && <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {step === 3 && <button type="button" onClick={() => void navigate({ search: { region: slug, intent: undefined } })} className="inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"><ArrowLeft size={16} />Change approach</button>}
          <button type="button" onClick={() => void navigate({ search: { region: undefined, intent: undefined } })} className="inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4">Change area</button>
        </div>}
      </div>
      <p className="border-t border-border pt-6 text-sm leading-6 text-muted-foreground">This guide helps you navigate educational resources. It does not assess or diagnose your symptoms.</p>
    </main>
    <SiteFooter />
  </div>;
}
