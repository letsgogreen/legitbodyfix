import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock3, Lock, PlayCircle } from "lucide-react";
import { CheckoutButton } from "@/components/site/FeaturedPrograms";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { getAdminProgramPreview, getPublicProgramDetail, type PublicProgramDetail } from "@/lib/public-programs.functions";

export const Route = createFileRoute("/programs/$programSlug")({
  validateSearch: (search: Record<string, unknown>) => ({
    preview: search.preview === "admin" ? "admin" as const : undefined,
  }),
  component: ProgramSalesPage,
});

function ProgramSalesPage() {
  const { programSlug } = Route.useParams();
  const { preview } = Route.useSearch();
  const [program, setProgram] = useState<PublicProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const request = preview === "admin" ? getAdminProgramPreview : getPublicProgramDetail;
    void request({ data: { slug: programSlug } })
      .then((result) => { if (active) setProgram(result); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Program could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [preview, programSlug]);

  const sections = useMemo(() => {
    if (!program) return [];
    const rows = program.modules.map((module) => ({ module, lessons: program.lessons.filter((lesson) => lesson.moduleId === module.id) }));
    const other = program.lessons.filter((lesson) => !lesson.moduleId);
    if (other.length) rows.push({ module: { id: "other", title: "Additional lessons", position: 999 }, lessons: other });
    return rows;
  }, [program]);

  if (loading) return <div className="min-h-screen bg-background"><SiteNav /><main className="mx-auto max-w-7xl px-5 py-24">Loading program…</main></div>;
  if (!program) return <div className="min-h-screen bg-background"><SiteNav /><main className="mx-auto max-w-3xl px-5 py-24"><h1 className="text-4xl font-black uppercase">Program unavailable</h1><p className="mt-4 text-muted-foreground">{error || "This program has not been published."}</p><Link to="/" hash="programs" className="mt-8 inline-flex items-center gap-2 font-bold"><ArrowLeft className="h-4 w-4" />Back to programs</Link></main></div>;

  const totalMinutes = Math.max(1, Math.round(program.lessons.reduce((sum, lesson) => sum + (lesson.durationSeconds ?? 0), 0) / 60));
  const curriculumSummary = program.lessons.length
    ? `${program.lessons.length} lessons · about ${totalMinutes} minutes total. Preview lessons are identified below.`
    : "Curriculum details are being prepared.";
  const benefits = program.goals.length ? program.goals : ["A clear starting point", "A focused progression", "A repeatable movement practice"];

  return <div className="min-h-screen bg-background text-foreground"><SiteNav /><main>
    {preview === "admin" && <div className="border-b border-border bg-accent px-5 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-[.14em] text-accent-foreground">Administrator draft preview · checkout remains live when a Paddle price is connected</div>}
    <section className="border-b border-border"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.8fr)] lg:px-8 lg:py-20"><div><Link to="/" hash="programs" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" />All programs</Link><p className="mt-10 font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">{program.regions.join(" · ") || "Guided movement program"}</p><h1 className="mt-4 max-w-4xl text-5xl font-black uppercase leading-[.92] tracking-[-.05em] sm:text-7xl">{program.name}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{program.outcome || "Follow a focused progression built around a clear movement goal."}</p><div className="mt-8 flex flex-wrap gap-2">{[program.duration, program.format, program.level].filter(Boolean).map((item) => <span key={item} className="border border-border bg-card px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[.12em]">{item}</span>)}</div></div><aside className="lg:sticky lg:top-8 lg:self-start"><div className="overflow-hidden border border-border bg-neutral-950 text-white">{program.imageUrl ? <img src={program.imageUrl} alt={program.imageAlt || ""} className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-neutral-900"><PlayCircle className="h-12 w-12 text-accent" /></div>}<div className="p-6"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-white/60">One-time access</p><p className="mt-2 text-3xl font-black">{program.price || "Price coming soon"}</p><div className="mt-5"><CheckoutButton program={program} /></div><p className="mt-4 text-xs leading-5 text-white/60">Secure checkout. Use the same email to open your private program library.</p></div></div></aside></div></section>

    <section className="border-b border-border bg-secondary/40"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">What this helps you build</p><div className="mt-8 grid gap-px bg-border md:grid-cols-3">{benefits.slice(0,6).map((goal) => <article key={goal} className="bg-background p-7"><Check className="h-5 w-5" /><h2 className="mt-5 text-xl font-extrabold">{goal}</h2></article>)}</div></div></section>

    <section className="border-b border-border"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[.7fr_1.3fr] lg:px-8"><div><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Inside the program</p><h2 className="mt-4 text-4xl font-black uppercase tracking-tight">See the complete path before you buy.</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">{curriculumSummary}</p>{program.whoItsFor && <div className="mt-8 border-l-4 border-accent bg-secondary p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em]">Who it is for</p><p className="mt-2 text-sm leading-6">{program.whoItsFor}</p></div>}</div><div className="border border-border">{sections.length ? sections.map(({ module, lessons }) => <section key={module.id} className="border-b border-border last:border-b-0"><div className="flex items-center justify-between bg-secondary px-5 py-4"><h3 className="font-extrabold">{module.title}</h3><span className="font-mono text-[10px] uppercase tracking-[.12em]">{lessons.length} lessons</span></div><ol>{lessons.map((lesson, index) => <li key={lesson.id} className="flex gap-4 border-t border-border px-5 py-5 first:border-t-0"><span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-background">{lesson.previewFree ? <PlayCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold">{String(index + 1).padStart(2,"0")} {lesson.title}</h4><span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground"><Clock3 className="h-3 w-3" />{formatDuration(lesson.durationSeconds)}</span></div>{lesson.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.summary}</p>}{lesson.previewFree && <span className="mt-2 inline-block bg-accent px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[.12em]">Free preview</span>}</div></li>)}</ol></section>) : <p className="p-8 text-sm text-muted-foreground">Curriculum details are being prepared.</p>}</div></div></section>

    <section className="bg-neutral-950 text-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8"><div><p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-accent">Ready when you are</p><h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">Start {program.name}.</h2><p className="mt-4 max-w-2xl text-white/65">One focused program. No recurring subscription required.</p></div><div className="min-w-72"><CheckoutButton program={program} /></div></div></section>
  </main><SiteFooter /></div>;
}

function formatDuration(seconds: number | null) { if (!seconds) return "Video lesson"; return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
