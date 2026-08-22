import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Clock3, Dumbbell, LockKeyhole, ShieldAlert } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getProgram } from "@/data/programs";

export const Route = createFileRoute("/programs/$programId")({
  loader: ({ params }) => {
    const program = getProgram(params.programId);
    if (!program) throw notFound();
    return program;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Program"} | LegitBodyFix` },
    { name: "description", content: loaderData?.summary ?? "A focused LegitBodyFix movement program." },
  ] }),
  component: ProgramPage,
});

function ProgramPage() {
  const program = Route.useLoaderData();
  return <div className="min-h-screen bg-background text-foreground">
    <SiteNav />
    <main className={program.available ? "pb-20 sm:pb-0" : ""}>
      <section className="border-b border-border"><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <Link to="/" hash="programs" className="inline-flex items-center gap-2 text-sm font-bold hover:underline"><ArrowLeft className="h-4 w-4" /> All programs</Link>
      </div></section>

      <section className="border-b border-border"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:py-16">
        <div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{program.area} / Focused program</p><h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] sm:text-7xl">{program.title}</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{program.summary}</p>
          <div className="mt-7 flex flex-wrap gap-3">{program.duration && <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold"><Clock3 className="h-4 w-4" /> {program.duration} minutes</span>}<span className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold"><Dumbbell className="h-4 w-4" /> {program.equipment}</span></div>
          <div className="mt-8">{program.available ? <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><a href={`/checkout.html?product=${program.id}`} className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-7 py-4 text-sm font-bold text-accent-foreground">Get access — ${program.price} <ArrowRight className="h-4 w-4" /></a><span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="h-4 w-4" /> One-time purchase · Protected access</span></div> : <div className="inline-flex items-center gap-3 rounded-sm border border-border bg-secondary px-5 py-4"><span className="h-2 w-2 rounded-full bg-accent" /><span className="text-sm font-bold">Program release in preparation</span></div>}</div>
        </div>
        <div className="overflow-hidden rounded-sm border border-border bg-white"><div className="aspect-[4/3]"><img src={program.image} alt={program.imageAlt} className="size-full object-contain p-4" /></div><div className="border-t border-border p-4 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Program visual / anatomical context</div></div>
      </div></section>

      <section className="border-b border-border bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-20"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Who it is for</p><h2 className="mt-3 text-3xl font-black uppercase leading-tight sm:text-4xl">A specific goal—not a generic workout.</h2><p className="mt-5 leading-relaxed text-muted-foreground">{program.audience}</p></div><div className="rounded-sm border border-border bg-card p-6 sm:p-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">What you will work on</p><ul className="mt-6 space-y-4">{program.benefits.map((benefit) => <li key={benefit} className="flex gap-3 text-base font-semibold"><Check className="mt-0.5 h-5 w-5 shrink-0" /> {benefit}</li>)}</ul></div></div></section>

      <section className="border-b border-border"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Inside the progression</p><h2 className="mt-3 text-4xl font-black uppercase sm:text-5xl">A clear order of work.</h2><div className="mt-9 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">{program.stages.map((stage, index) => <div key={stage.title} className="min-h-56 bg-card p-7"><span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span><h3 className="mt-10 text-2xl font-extrabold uppercase">{stage.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.copy}</p></div>)}</div></div></section>

      <section><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="flex gap-4 rounded-sm border-l-4 border-accent bg-secondary p-6"><ShieldAlert className="h-5 w-5 shrink-0" /><div><p className="font-bold">Use this program responsibly</p><p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">{program.caution} This program provides education and guided exercise; it does not diagnose or treat a medical condition.</p></div></div></div></section>

      <section className="border-t border-border bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[0.65fr_1.35fr] lg:px-8 lg:py-20"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Before you begin</p><h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">Purchase questions.</h2></div><div className="divide-y divide-border border-y border-border">
        <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Is this a subscription?<span className="text-xl group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">No. Available sessions use a one-time payment and appear in your personal library.</p></details>
        <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Can I repeat the session?<span className="text-xl group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Yes. You can return through My Library using the email connected to your completed purchase.</p></details>
        <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">Does this replace medical care?<span className="text-xl group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">No. The program is educational and is not a diagnosis. Use the safety guidance above and seek appropriate assessment when symptoms warrant it.</p></details>
        <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">How do I access my purchase?<span className="text-xl group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Use the same email used at checkout to request a secure sign-in link from My Library. No separate password is required.</p></details>
      </div></div></section>
    </main><SiteFooter />
    {program.available && <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden"><div><p className="text-sm font-extrabold">{program.shortTitle}</p><p className="font-mono text-xs text-muted-foreground">${program.price} · ONE TIME</p></div><a href={`/checkout.html?product=${program.id}`} className="inline-flex items-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-bold text-accent-foreground">Get access <ArrowRight className="h-4 w-4" /></a></div>}
  </div>;
}
