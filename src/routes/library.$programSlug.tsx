import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Dumbbell,
  Info,
  Loader2,
  Lock,
  MonitorUp,
  Play,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { learningContentFor } from "@/lib/learning-content";
import { getStreamPlayback } from "@/lib/stream.functions";

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
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const { data: access } = await supabase
        .from("entitlements")
        .select("program_id")
        .eq("active", true);
      const ids = (access ?? []).map((item) => item.program_id);
      if (!ids.length) {
        setLoading(false);
        return;
      }
      const { data: selected, error: programError } = await supabase
        .from("programs")
        .select("*")
        .eq("slug", programSlug)
        .in("id", ids)
        .maybeSingle();
      if (programError || !selected) {
        setError(programError?.message || "This program is not in your library.");
        setLoading(false);
        return;
      }
      setProgram(selected);
      const [{ data: moduleRows, error: moduleError }, { data: lessonRows, error: lessonError }] =
        await Promise.all([
          supabase
            .from("program_modules")
            .select("*")
            .eq("program_id", selected.id)
            .eq("published", true)
            .order("position"),
          supabase
            .from("lessons")
            .select("*")
            .eq("program_id", selected.id)
            .eq("published", true)
            .order("position"),
        ]);
      if (moduleError || lessonError)
        setError(moduleError?.message || lessonError?.message || "Could not load this curriculum.");
      else {
        setModules(moduleRows ?? []);
        setLessons(lessonRows ?? []);
      }
      setLoading(false);
    })();
  }, [programSlug]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`legitbodyfix:progress:${programSlug}`);
      if (saved) setCompleted(JSON.parse(saved));
    } catch {
      /* Progress is optional when storage is unavailable. */
    }
  }, [programSlug]);

  const sections = useMemo(() => {
    const grouped = modules.map((module) => ({
      module,
      lessons: lessons.filter((lesson) => lesson.module_id === module.id),
    }));
    const unassigned = lessons.filter((lesson) => !lesson.module_id);
    if (unassigned.length)
      grouped.push({
        module: { id: "other", title: "Additional lessons" } as Module,
        lessons: unassigned,
      });
    return grouped;
  }, [lessons, modules]);
  const learningContent = useMemo(
    () => learningContentFor(programSlug, program?.name ?? "", program?.learning_content),
    [program?.learning_content, program?.name, programSlug],
  );
  const readyLessons = lessons.filter((lesson) => lesson.stream_status === "ready");
  const completedCount = readyLessons.filter((lesson) => completed.includes(lesson.id)).length;
  const progress = readyLessons.length
    ? Math.round((completedCount / readyLessons.length) * 100)
    : 0;

  async function play(lesson: Lesson) {
    if (lesson.stream_status !== "ready") return;
    setPlaybackLoading(true);
    setError(null);
    setPlaying(lesson);
    setPlaybackUrl(null);
    try {
      const result = await getStreamPlayback({ data: { lessonId: lesson.id } });
      setPlaybackUrl(result.iframeUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPlaying(null);
    }
    setPlaybackLoading(false);
    window.setTimeout(
      () =>
        document
          .getElementById("lesson-player")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  }
  function toggleComplete(lessonId: string) {
    const next = completed.includes(lessonId)
      ? completed.filter((id) => id !== lessonId)
      : [...completed, lessonId];
    setCompleted(next);
    try {
      window.localStorage.setItem(`legitbodyfix:progress:${programSlug}`, JSON.stringify(next));
    } catch {
      /* Optional local progress. */
    }
  }

  if (loading)
    return (
      <main className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-20 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading curriculum…
      </main>
    );
  if (!program)
    return (
      <main className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-3xl font-extrabold">Program unavailable</h1>
        <p className="mt-3 text-muted-foreground">
          {error || "This program is not attached to your account."}
        </p>
        <Link to="/library" className="mt-6 inline-flex items-center gap-2 font-bold">
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </Link>
      </main>
    );

  return (
    <main className="pb-24">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <Link to="/library" className="inline-flex items-center gap-2 text-sm font-bold">
            <ArrowLeft className="h-4 w-4" />
            My library
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Your program
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl">
                {program.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                {program.outcome}
              </p>
            </div>
            <div className="border border-border bg-background p-5">
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold">Program progress</span>
                <span className="font-mono text-sm font-bold">{progress}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden bg-secondary">
                <div
                  className="h-full bg-accent transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {completedCount} of {readyLessons.length} ready lessons complete
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-16">
        <div className="min-w-0 space-y-16">
          <section id="lesson-player" className="scroll-mt-6">
            {playing ? (
              <div>
                <div className="aspect-video overflow-hidden bg-ink">
                  {playbackLoading ? (
                    <div className="grid h-full place-items-center text-ink-foreground">
                      <Loader2 className="h-7 w-7 animate-spin" />
                    </div>
                  ) : playbackUrl ? (
                    <iframe
                      src={playbackUrl}
                      title={playing.title}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  ) : null}
                </div>
                <div className="border-x border-b border-border bg-card p-5 sm:p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Now playing
                  </p>
                  <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold">{playing.title}</h2>
                      {playing.summary && (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                          {playing.summary}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleComplete(playing.id)}
                      className={`inline-flex min-h-10 items-center gap-2 border px-3 text-xs font-bold ${completed.includes(playing.id) ? "border-accent bg-accent text-black" : "border-border bg-background"}`}
                    >
                      {completed.includes(playing.id) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      {completed.includes(playing.id) ? "Completed" : "Mark complete"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid aspect-video place-items-center border border-border bg-secondary p-8 text-center">
                <div>
                  <Play className="mx-auto h-8 w-8" />
                  <h2 className="mt-4 text-2xl font-extrabold">Choose a lesson to begin</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a ready lesson from the curriculum.
                  </p>
                </div>
              </div>
            )}
            {error && (
              <p className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </section>
          <section id="guide" className="scroll-mt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {learningContent.eyebrow}
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">
              {learningContent.title}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
              {learningContent.introduction}
            </p>
            <div className="mt-8 grid border border-border md:grid-cols-3">
              {learningContent.principles.map((item, index) => (
                <article
                  key={item.title}
                  className="border-b border-border p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-6"
                >
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
          <section id="check" className="scroll-mt-6 border border-border bg-secondary p-6 sm:p-8">
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center bg-accent text-black">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Quick baseline
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">Check before you train</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This is a reference point, not a diagnosis. Stay within a range that feels
                  manageable.
                </p>
              </div>
            </div>
            <ul className="mt-7 grid gap-px border border-border bg-border sm:grid-cols-2">
              {learningContent.checks.map((item) => (
                <li key={item} className="flex gap-3 bg-background p-4 text-sm leading-6">
                  <Circle className="mt-1 h-3.5 w-3.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section id="routine" className="scroll-mt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Practice sequence
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
              A simple path through the session
            </h2>
            <div className="mt-7 border-y border-border">
              {learningContent.routine.map((item) => (
                <article
                  key={item.step}
                  className="grid gap-3 border-b border-border py-5 last:border-b-0 sm:grid-cols-[70px_150px_1fr] sm:items-baseline"
                >
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    {item.step}
                  </span>
                  <h3 className="font-extrabold">{item.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
          <section
            id="habits"
            className="scroll-mt-6 grid overflow-hidden border border-border lg:grid-cols-[.75fr_1.25fr]"
          >
            <div className="bg-ink p-6 text-ink-foreground sm:p-8">
              <MonitorUp className="h-7 w-7 text-accent" />
              <h2 className="mt-8 text-3xl font-extrabold">Carry it into daily life</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Capacity grows when the lesson connects to the positions and tasks you repeat
                outside the session.
              </p>
            </div>
            <ul className="divide-y divide-border bg-card">
              {learningContent.habits.map((item, index) => (
                <li key={item} className="flex gap-4 p-5 text-sm leading-6 sm:p-6">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
                    0{index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section
            id="safety"
            className="scroll-mt-6 border-l-4 border-destructive bg-destructive/5 p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
              <div>
                <h2 className="text-xl font-extrabold">
                  Pause and seek medical assessment when needed
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {learningContent.safety}
                </p>
              </div>
            </div>
          </section>
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="border border-border bg-card">
            <div className="border-b border-border p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Curriculum
              </p>
              <h2 className="mt-2 text-xl font-extrabold">Choose a lesson</h2>
            </div>
            {sections.length ? (
              sections.map(({ module, lessons: sectionLessons }) => (
                <section key={module.id} className="border-b border-border last:border-b-0">
                  <div className="bg-secondary px-4 py-3">
                    <h3 className="text-sm font-extrabold">{module.title}</h3>
                  </div>
                  <ol>
                    {sectionLessons.map((lesson, index) => {
                      const ready = lesson.stream_status === "ready";
                      const isComplete = completed.includes(lesson.id);
                      const isPlaying = playing?.id === lesson.id;
                      return (
                        <li key={lesson.id} className="border-t border-border first:border-t-0">
                          <div
                            className={`flex items-center gap-2 px-3 py-3 ${isPlaying ? "bg-accent/15" : ""}`}
                          >
                            <button
                              type="button"
                              disabled={!ready}
                              onClick={() => void play(lesson)}
                              className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span
                                className={`grid h-9 w-9 shrink-0 place-items-center border ${isPlaying ? "border-accent bg-accent text-black" : "border-border bg-background"}`}
                              >
                                {ready ? (
                                  <Play className="h-4 w-4" />
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-bold">
                                  {index + 1}. {lesson.title}
                                </span>
                                <span className="mt-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                                  {ready ? (
                                    <>
                                      <Clock3 className="h-3 w-3" />
                                      {formatDuration(lesson.duration_seconds)}
                                    </>
                                  ) : (
                                    "Video processing"
                                  )}
                                </span>
                              </span>
                            </button>
                            {ready && (
                              <button
                                type="button"
                                onClick={() => toggleComplete(lesson.id)}
                                aria-label={`${isComplete ? "Mark incomplete" : "Mark complete"}: ${lesson.title}`}
                                className={`grid h-8 w-8 shrink-0 place-items-center border ${isComplete ? "border-accent bg-accent text-black" : "border-border"}`}
                              >
                                {isComplete ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))
            ) : (
              <p className="p-5 text-sm text-muted-foreground">
                Curriculum details are being prepared.
              </p>
            )}
          </div>
          <nav aria-label="Program guide" className="mt-5 border border-border bg-background p-4">
            <p className="px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              On this page
            </p>
            {[
              ["guide", "Session guide", BookOpen],
              ["check", "Baseline check", RotateCcw],
              ["routine", "Practice sequence", Dumbbell],
              ["habits", "Daily application", MonitorUp],
              ["safety", "Safety", AlertTriangle],
            ].map(([id, label, Icon]) => (
              <a
                key={String(id)}
                href={`#${id}`}
                className="flex items-center gap-3 border-b border-border px-2 py-3 text-sm font-bold last:border-b-0"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{String(label)}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </nav>
          <div className="mt-5 flex gap-3 border border-border bg-secondary p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs leading-5 text-muted-foreground">
              Your lesson completion is saved on this device. Video access remains protected by your
              purchase.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "Video lesson";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
