import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock3, Lock, PlayCircle } from "lucide-react";
import { CheckoutButton } from "@/components/site/FeaturedPrograms";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { getAdminProgramPreview, getPublicProgramDetail, type ProgramSalesContent, type PublicProgramDetail } from "@/lib/public-programs.functions";
import { legacySalesPageId } from "@/lib/program-sales-links";
import { ProgramSalesView } from "@/lib/program-funnel";

export const Route = createFileRoute("/programs/$programSlug")({
  validateSearch: (search: Record<string, unknown>) => ({ preview: search["preview"] === "admin" ? "admin" as const : undefined }),
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: ({ params, deps }) => {
    const legacyId = legacySalesPageId(params.programSlug);
    if (deps.preview !== "admin" && legacyId) throw redirect({ href: `/video.html?id=${encodeURIComponent(legacyId)}`, reloadDocument: true });
    const request = deps.preview === "admin" ? getAdminProgramPreview : getPublicProgramDetail;
    return request({ data: { slug: params.programSlug } });
  },
  component: ProgramSalesPage,
});

const SALES_PREVIEW_ID_BY_PROGRAM_SLUG: Record<string, string> = {
  "neck-shoulder-reset": "neck-alignment",
  "ankle-recovery": "ankle-sprain-rehabilitation",
  "shoulder-movement": "shoulder-movement",
  "bunion-hallux-valgus-guide": "bunion-hallux-valgus-guide",
};

type PublicSalesResponse = ProgramSalesContent & { previewIframeUrl?: string };

function ProgramSalesPage() {
  const { programSlug } = Route.useParams();
  const { preview } = Route.useSearch();
  const loadedProgram = Route.useLoaderData();
  const [program, setProgram] = useState<PublicProgramDetail | null>(loadedProgram);

  useEffect(() => {
    let active = true;
    setProgram(loadedProgram);
    const salesPageId = SALES_PREVIEW_ID_BY_PROGRAM_SLUG[programSlug];
    if (loadedProgram && salesPageId) {
      void fetch(`/api/public/program-sales/${encodeURIComponent(salesPageId)}`, { cache: "no-store" })
        .then(async (response) => response.ok ? await response.json() as PublicSalesResponse : null)
        .then((sales) => {
          if (!active || !sales) return;
          const { previewIframeUrl, ...salesContent } = sales;
          setProgram((current) => current ? { ...current, previewIframeUrl: previewIframeUrl || current.previewIframeUrl, salesContent: { ...(current.salesContent ?? {}), ...salesContent } } : current);
        })
        .catch(() => undefined);
    }
    return () => { active = false; };
  }, [loadedProgram, programSlug]);

  const sections = useMemo(() => {
    if (!program) return [];
    const rows = program.modules.map((module) => ({ module, lessons: program.lessons.filter((lesson) => lesson.moduleId === module.id) }));
    const visibleModuleIds = new Set(program.modules.map((module) => module.id));
    const other = program.lessons.filter((lesson) => !lesson.moduleId || !visibleModuleIds.has(lesson.moduleId));
    if (other.length) rows.push({ module: { id: "other", title: "Program lessons", position: 999 }, lessons: other });
    return rows;
  }, [program]);

  if (!program) return <UnavailablePage />;

  const sales = program.salesContent;
  const benefits = [sales?.landingBenefit1, sales?.landingBenefit2, sales?.landingBenefit3].filter((value): value is string => Boolean(value?.trim()));
  const benefitItems = benefits.length ? benefits : program.goals.length ? program.goals : ["A clear starting point", "A focused progression", "A repeatable movement practice"];
  const marketingSteps = sales?.curriculum?.filter((step) => step.phase || step.title || step.description) ?? [];
  const totalMinutes = Math.max(1, Math.round(program.lessons.reduce((sum, lesson) => sum + (lesson.durationSeconds ?? 0), 0) / 60));
  const curriculumSummary = program.lessons.length ? `${program.lessons.length} ${program.lessons.length === 1 ? "lesson" : "lessons"} · about ${totalMinutes} minutes total. Preview lessons are identified below.` : "Curriculum details are being prepared.";

  return <div className="min-h-screen bg-background text-foreground"><ProgramSalesView program={program} /><SiteNav /><main>
    {preview === "admin" ? <div className="border-b border-border bg-accent px-5 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-[.14em] text-accent-foreground">Administrator draft preview · checkout remains live when a Paddle price is connected</div> : null}
    <section className="border-b border-border"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-5 sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.8fr)] lg:gap-10 lg:px-8 lg:py-20">
      <div><Link to="/" hash="programs" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" />All programs</Link><p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[.16em] text-muted-foreground sm:mt-10 sm:text-xs">{sales?.landingEyebrow || program.regions.join(" · ") || "Guided movement program"}</p><h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[.95] tracking-[-.04em] sm:text-7xl">{sales?.landingHeadline || program.name}</h1><p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-7 text-muted-foreground sm:mt-7 sm:text-lg sm:leading-8">{sales?.landingSummary || program.outcome || "Follow a focused progression built around a clear movement goal."}</p><div className="mt-6 flex flex-wrap gap-2 sm:mt-8">{[program.duration, program.format, program.level].filter(Boolean).map((item) => <span key={item} className="border border-border bg-card px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[.12em] sm:text-[11px]">{item}</span>)}</div></div>
      <PurchaseCard program={program} />
    </div></section>
    <section className="border-b border-border bg-card"><div className="mx-auto grid max-w-7xl gap-px bg-border sm:grid-cols-3"><Reassurance number="01" title="One-time payment" body="No recurring membership fee" /><Reassurance number="02" title="Practice at your pace" body="Pause, repeat, and revisit" /><Reassurance number="03" title="Private delivery" body="Secure access through your library" /></div></section>
    <section className="border-b border-border bg-secondary/40"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Why this session</p><h2 className="mt-4 max-w-4xl text-3xl font-black uppercase sm:text-4xl">{sales?.landingWhyHeadline || "What this helps you build"}</h2><div className="mt-8 grid gap-px bg-border md:grid-cols-3">{benefitItems.slice(0, 6).map((goal) => <article key={goal} className="bg-background p-7"><Check className="h-5 w-5" /><p className="mt-5 whitespace-pre-line text-lg font-extrabold leading-7">{goal}</p></article>)}</div></div></section>
    {(sales?.techniqueHeadline || sales?.techniqueBody) ? <section className="border-b border-border"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[.42fr_.58fr] lg:px-8 lg:py-20"><div><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">{sales.techniqueEyebrow || "The approach"}</p><h2 className="mt-4 text-4xl font-black uppercase tracking-tight">{sales.techniqueHeadline}</h2></div><p className="whitespace-pre-line text-base leading-8 text-muted-foreground sm:text-lg">{sales.techniqueBody}</p></div></section> : null}
    {marketingSteps.length ? <section className="border-b border-border bg-neutral-950 text-white"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-accent">The progression</p><div className="mt-8 grid gap-px bg-white/15 md:grid-cols-3">{marketingSteps.map((step, index) => <article key={`${step.phase}-${index}`} className="bg-neutral-950 p-7"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-accent">{step.phase || String(index + 1).padStart(2, "0")}</p><h2 className="mt-5 text-2xl font-extrabold">{step.title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/65">{step.description}</p></article>)}</div></div></section> : null}
    <section className="border-b border-border bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[.7fr_1.3fr] lg:px-8 lg:py-20"><div><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Built for real practice</p><h2 className="mt-4 text-4xl font-black uppercase tracking-tight">Know whether this is the right fit.</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">A clear program for self-directed learners who want structure, not scattered exercise tips.</p></div><div className="grid gap-px bg-border md:grid-cols-2"><div className="bg-background p-6"><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-emerald-700">A good fit if</p><p className="mt-4 whitespace-pre-line text-sm font-semibold leading-6">{sales?.landingAudience || program.whoItsFor || "You want a focused sequence that you can practise independently and repeat at your own pace."}</p><ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground"><li>• You want a clear progression instead of disconnected tips.</li><li>• You can keep the practice within a comfortable range.</li><li>• You are comfortable learning independently by video.</li></ul></div><div className="bg-background p-6"><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-destructive">Seek assessment first if</p><ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground"><li>• Symptoms followed significant or recent trauma.</li><li>• You have new or worsening weakness, numbness, or balance changes.</li><li>• Symptoms are severe, unusual, or rapidly worsening.</li></ul><p className="mt-5 border-l-2 border-border pl-3 text-xs leading-5 text-muted-foreground">Movement education, not medical diagnosis or individualized rehabilitation.</p></div></div></div></section>
    <section className="border-b border-border"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[.7fr_1.3fr] lg:px-8"><div><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Inside the program</p><h2 className="mt-4 text-4xl font-black uppercase tracking-tight">See the complete path before you buy.</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">{curriculumSummary}</p>{(sales?.landingAudience || program.whoItsFor) ? <div className="mt-8 border-l-4 border-accent bg-secondary p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em]">Who it is for</p><p className="mt-2 whitespace-pre-line break-words text-sm leading-6">{sales?.landingAudience || program.whoItsFor}</p></div> : null}</div><Curriculum sections={sections} /></div></section>
    <section className="border-b border-border"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Simple access</p><h2 className="mt-4 text-4xl font-black uppercase tracking-tight">Checkout to practice.<br />Three clear steps.</h2><div className="mt-8 grid gap-px bg-border md:grid-cols-3"><AccessStep number="01" title="Purchase securely" body="Complete the one-time Paddle checkout for this program." /><AccessStep number="02" title="Use your checkout email" body="Create or open the account that uses the same email address." /><AccessStep number="03" title="Practice on demand" body="Open your private library and revisit the program at your pace." /></div></div></section>
    <section className="border-b border-border bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.55fr_1fr] lg:px-8 lg:py-20"><div><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Questions, answered</p><h2 className="mt-4 text-4xl font-black uppercase tracking-tight">Know before you buy.</h2></div><div className="divide-y divide-border border-y border-border"><Faq question="Is this a subscription?">No. This is a one-time purchase for the program shown on this page.</Faq><Faq question="Where do I find my purchase?">Open My library and use the same email address you entered during checkout.</Faq><Faq question="Can I repeat the program?">Yes. Your purchased program remains available in your private library so you can pause, repeat, and revisit it.</Faq><Faq question="Is this medical treatment?">No. LegitBodyFix provides movement education and does not replace diagnosis, emergency care, or individualized treatment from a qualified professional.</Faq></div></div></section>
    <section className="bg-neutral-950 text-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8"><div><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-accent">Ready when you are</p><h2 className="mt-4 max-w-4xl text-4xl font-black uppercase sm:text-5xl">{sales?.finalHeadline || `Start ${program.name}.`}</h2><p className="mt-4 max-w-2xl whitespace-pre-line text-white/65">{sales?.landingReassurance || "One focused program. No recurring subscription required."}</p></div><div className="min-w-72"><CheckoutButton program={program} /></div></div></section>
  </main><SiteFooter /></div>;
}

function PurchaseCard({ program }: { program: PublicProgramDetail }) {
  return <aside className="lg:sticky lg:top-8 lg:self-start"><div className="overflow-hidden border border-border bg-neutral-950 text-white">{program.previewIframeUrl ? <div><div className="aspect-video bg-black"><iframe src={program.previewIframeUrl} title={`${program.name} preview`} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0" /></div><p className="border-t border-white/10 px-5 py-3 font-mono text-[9px] font-bold uppercase tracking-[.14em] text-white/55">Program preview · captions available in the player</p></div> : program.imageUrl ? <img src={program.imageUrl} alt={program.imageAlt || ""} className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-neutral-900"><PlayCircle className="h-12 w-12 text-accent" /></div>}<div className="p-5 sm:p-6"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-white/60">{program.saleLabel || "One-time access"}</p>{program.originalPrice ? <p className="mt-2 text-sm text-white/55 line-through">{program.originalPrice}</p> : null}<p className={`${program.originalPrice ? "mt-1 text-accent" : "mt-2"} text-3xl font-black`}>{program.price || "Price coming soon"}</p>{program.saleEndsAt ? <p className="mt-2 text-xs text-white/65">Ends {new Date(program.saleEndsAt).toLocaleString()}</p> : null}<div className="mt-5"><CheckoutButton program={program} /></div><p className="mt-4 text-xs leading-5 text-white/60">Secure checkout. Use the same email to open your private program library.</p></div></div></aside>;
}

function Reassurance({ number, title, body }: { number: string; title: string; body: string }) {
  return <div className="bg-card px-5 py-6"><p className="font-mono text-[10px] font-bold text-muted-foreground">{number}</p><p className="mt-3 font-extrabold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{body}</p></div>;
}

function AccessStep({ number, title, body }: { number: string; title: string; body: string }) {
  return <article className="bg-card p-6"><p className="font-mono text-[10px] font-bold text-muted-foreground">{number}</p><h3 className="mt-5 text-xl font-extrabold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p></article>;
}

function Faq({ question, children }: { question: string; children: React.ReactNode }) {
  return <details className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold"><span>{question}</span><span className="font-mono text-lg group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-7 text-muted-foreground">{children}</p></details>;
}

function Curriculum({ sections }: { sections: Array<{ module: { id: string; title: string; position: number }; lessons: PublicProgramDetail["lessons"] }> }) {
  return <div className="border border-border">{sections.length ? sections.map(({ module, lessons }) => <section key={module.id} className="border-b border-border last:border-b-0"><div className="flex items-center justify-between bg-secondary px-5 py-4"><h3 className="font-extrabold">{module.title}</h3><span className="font-mono text-[10px] uppercase tracking-[.12em]">{lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}</span></div><ol>{lessons.map((lesson, index) => <li key={lesson.id} className="flex gap-4 border-t border-border px-5 py-5 first:border-t-0"><span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-background">{lesson.previewFree ? <PlayCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold">{String(index + 1).padStart(2, "0")} {lesson.title}</h4><span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground"><Clock3 className="h-3 w-3" />{formatDuration(lesson.durationSeconds)}</span></div>{lesson.summary ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.summary}</p> : null}{lesson.previewFree ? <span className="mt-2 inline-block bg-accent px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[.12em]">Free preview</span> : null}</div></li>)}</ol></section>) : <p className="p-8 text-sm text-muted-foreground">Curriculum details are being prepared.</p>}</div>;
}

function UnavailablePage() { return <div className="min-h-screen bg-background"><SiteNav /><main className="mx-auto max-w-3xl px-5 py-24"><h1 className="text-4xl font-black uppercase">Program unavailable</h1><p className="mt-4 text-muted-foreground">This program has not been published.</p><Link to="/" hash="programs" className="mt-8 inline-flex items-center gap-2 font-bold"><ArrowLeft className="h-4 w-4" />Back to programs</Link></main></div>; }
function formatDuration(seconds: number | null) { if (!seconds) return "Video lesson"; return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
