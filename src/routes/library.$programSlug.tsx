import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Lock, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getStreamPlayback } from "@/lib/stream.functions";
import { getCustomerAccess } from "@/lib/customer-access";

type Program = Database["public"]["Tables"]["programs"]["Row"];
type Module = Database["public"]["Tables"]["program_modules"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];

export const Route = createFileRoute("/library/$programSlug")({ component: ProgramLibrary });

function ProgramLibrary() {
  const { programSlug } = Route.useParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [playing, setPlaying] = useState<Lesson | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true); setProgram(null); setModules([]); setLessons([]); setPlaying(null); setPlaybackUrl(null); setError(null);
      const { programIds: ids } = await getCustomerAccess();
      if (!ids.length) { setLoading(false); return; }
      const { data: selected, error: programError } = await supabase.from("programs").select("*").eq("slug", programSlug).in("id", ids).maybeSingle();
      if (programError || !selected) { setError(programError?.message || "This program is not in your library."); setLoading(false); return; }
      setProgram(selected);
      const [{ data: moduleRows, error: moduleError }, { data: lessonRows, error: lessonError }] = await Promise.all([
        supabase.from("program_modules").select("*").eq("program_id", selected.id).eq("published", true).order("position"),
        supabase.from("lessons").select("*").eq("program_id", selected.id).eq("published", true).order("position"),
      ]);
      if (moduleError || lessonError) setError(moduleError?.message || lessonError?.message || "Could not load this curriculum.");
      else { setModules(moduleRows ?? []); setLessons(lessonRows ?? []); }
      setLoading(false);
    })().catch(() => { setError("Could not load your access. Please try again."); setLoading(false); });
  }, [programSlug]);

  const sections = useMemo(() => {
    const grouped = modules.map((module) => ({ module, lessons: lessons.filter((lesson) => lesson.module_id === module.id) }));
    const unassigned = lessons.filter((lesson) => !lesson.module_id || !modules.some((module) => module.id === lesson.module_id));
    if (unassigned.length) grouped.push({ module: { id: "other", title: "Additional lessons" } as Module, lessons: unassigned });
    return grouped;
  }, [lessons, modules]);

  async function play(lesson: Lesson) {
    if (lesson.stream_status !== "ready") return;
    setPlaybackLoading(true); setError(null); setPlaying(lesson); setPlaybackUrl(null);
    try { const result = await getStreamPlayback({ data: { lessonId: lesson.id } }); setPlaybackUrl(result.iframeUrl); }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); setPlaying(null); }
    setPlaybackLoading(false);
  }

  if (loading) return <main className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-20 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading curriculum…</main>;
  if (!program) return <main className="mx-auto max-w-3xl px-5 py-20"><h1 className="text-3xl font-extrabold">Program unavailable</h1><p className="mt-3 text-muted-foreground">{error || "This program is not attached to your account."}</p><Link to="/library" className="mt-6 inline-flex items-center gap-2 font-bold"><ArrowLeft className="h-4 w-4" />Back to library</Link></main>;

  return <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16"><Link to="/library" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" />My library</Link><div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)]"><section>{playing ? <div><div className="aspect-video overflow-hidden bg-ink">{playbackLoading ? <div className="grid h-full place-items-center text-ink-foreground"><Loader2 className="h-7 w-7 animate-spin" /></div> : playbackUrl ? <iframe src={playbackUrl} title={playing.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0" /> : null}</div><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Now playing</p><h2 className="mt-1 text-2xl font-extrabold">{playing.title}</h2>{playing.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{playing.summary}</p>}</div> : <div className="grid aspect-video place-items-center border border-border bg-secondary p-8 text-center"><div><Play className="mx-auto h-8 w-8" /><h2 className="mt-4 text-2xl font-extrabold">Choose a lesson to begin</h2><p className="mt-2 text-sm text-muted-foreground">Your video will play securely here.</p></div></div>}{error && <p className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}</section><aside><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Your program</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight">{program.name}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{program.outcome}</p><div className="mt-8 border border-border">{sections.map(({ module, lessons: sectionLessons }) => <section key={module.id} className="border-b border-border last:border-b-0"><div className="bg-secondary px-4 py-3"><h2 className="text-sm font-extrabold">{module.title}</h2></div><ol>{sectionLessons.map((lesson, index) => { const ready = lesson.stream_status === "ready"; return <li key={lesson.id} className="border-t border-border first:border-t-0"><button type="button" disabled={!ready} onClick={() => void play(lesson)} className="flex w-full items-center gap-3 px-4 py-4 text-left disabled:cursor-not-allowed disabled:opacity-50"><span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-background">{ready ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span><span className="min-w-0"><span className="block text-sm font-bold">{index + 1}. {lesson.title}</span><span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{ready ? formatDuration(lesson.duration_seconds) : "Video processing"}</span></span></button></li>; })}</ol></section>)}</div></aside></div></main>;
}

function formatDuration(seconds: number | null) { if (!seconds) return "Video lesson"; return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
