import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen, Loader2, Lock, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getStreamPlayback } from "@/lib/stream.functions";
import { getCustomerAccess } from "@/lib/customer-access";

type Program = Database["public"]["Tables"]["programs"]["Row"];
type Module = Database["public"]["Tables"]["program_modules"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
type RelatedRecipe = { slug: string; title: string; summary: string | null; goal: string | null; imageUrl: string | null; imageAlt: string | null };
type RelatedGuide = { slug: string; title: string; summary: string | null };

export const Route = createFileRoute("/library/$programSlug")({ component: ProgramLibrary });

function ProgramLibrary() {
  const { programSlug } = Route.useParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [recipes, setRecipes] = useState<RelatedRecipe[]>([]);
  const [guides, setGuides] = useState<RelatedGuide[]>([]);
  const [playing, setPlaying] = useState<Lesson | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true); setProgram(null); setModules([]); setLessons([]); setRecipes([]); setGuides([]); setPlaying(null); setPlaybackUrl(null); setError(null);
      const { programIds: ids } = await getCustomerAccess();
      if (!ids.length) { setLoading(false); return; }
      const { data: selected, error: programError } = await supabase.from("programs").select("*").eq("slug", programSlug).in("id", ids).maybeSingle();
      if (programError || !selected) { setError(programError?.message || "This program is not in your library."); setLoading(false); return; }
      setProgram(selected);
      const [{ data: moduleRows, error: moduleError }, { data: lessonRows, error: lessonError }, recipeResult, guideResult] = await Promise.all([
        supabase.from("program_modules").select("*").eq("program_id", selected.id).eq("published", true).order("position"),
        supabase.from("lessons").select("*").eq("program_id", selected.id).eq("published", true).order("position"),
        supabase.from("program_recipes").select("position,recipes(slug,title,summary,goal,image_url,image_alt,published)").eq("program_id", selected.id).order("position"),
        supabase.from("guide_programs").select("position,guides(slug,title,pattern_summary,published)").eq("program_id", selected.id).order("position"),
      ]);
      if (moduleError || lessonError) setError(moduleError?.message || lessonError?.message || "Could not load this curriculum.");
      else {
        const availableLessons = lessonRows ?? [];
        setModules(moduleRows ?? []); setLessons(availableLessons);
        setRecipes((recipeResult.data ?? []).flatMap((row) => {
          const recipe = row.recipes as unknown as { slug:string; title:string; summary:string|null; goal:string|null; image_url:string|null; image_alt:string|null; published:boolean } | null;
          return recipe?.published ? [{ slug:recipe.slug, title:recipe.title, summary:recipe.summary, goal:recipe.goal, imageUrl:recipe.image_url, imageAlt:recipe.image_alt }] : [];
        }));
        setGuides((guideResult.data ?? []).flatMap((row) => {
          const guide = row.guides as unknown as { slug:string; title:string; pattern_summary:string|null; published:boolean } | null;
          return guide?.published ? [{ slug:guide.slug, title:guide.title, summary:guide.pattern_summary }] : [];
        }));
        const firstReady = availableLessons.find((lesson) => lesson.stream_status === "ready");
        if (firstReady) void play(firstReady);
      }
      setLoading(false);
    })().catch(() => { setError("Could not load your access. Please try again."); setLoading(false); });
  }, [programSlug]);

  const sections = useMemo(() => {
    const grouped = modules.map((module) => ({ module, lessons: lessons.filter((lesson) => lesson.module_id === module.id) }));
    const unassigned = lessons.filter((lesson) => !lesson.module_id || !modules.some((module) => module.id === lesson.module_id));
    if (unassigned.length) grouped.push({ module: { id: "other", title: "Additional lessons" } as Module, lessons: unassigned });
    return grouped;
  }, [lessons, modules]);

  const totalMinutes = useMemo(() => Math.max(1, Math.round(lessons.reduce((total, lesson) => total + (lesson.duration_seconds ?? 0), 0) / 60)), [lessons]);

  async function play(lesson: Lesson) {
    if (lesson.stream_status !== "ready") return;
    setPlaybackLoading(true); setError(null); setPlaying(lesson); setPlaybackUrl(null);
    try {
      const preferredLanguage = navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
      const result = await getStreamPlayback({ data: { lessonId: lesson.id, preferredLanguage } });
      setPlaybackUrl(result.iframeUrl);
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); setPlaying(null); }
    setPlaybackLoading(false);
  }

  if (loading) return <main className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-20 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading curriculum…</main>;
  if (!program) return <main className="mx-auto max-w-3xl px-5 py-20"><h1 className="text-3xl font-extrabold">Program unavailable</h1><p className="mt-3 text-muted-foreground">{error || "This program is not attached to your account."}</p><Link to="/library" className="mt-6 inline-flex items-center gap-2 font-bold"><ArrowLeft className="h-4 w-4" />Back to library</Link></main>;

  return <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16"><Link to="/library" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" />My library</Link><header className="mt-8 border-y border-border py-7"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Your program</p><div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{program.name}</h1><p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{program.outcome}</p></div><div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.12em]"><span className="border border-border px-3 py-2">{lessons.length} lessons</span><span className="border border-border px-3 py-2">{totalMinutes} min</span>{program.level&&<span className="border border-border px-3 py-2">{program.level}</span>}</div></div>{program.goals.length>0&&<div className="mt-6 flex flex-wrap gap-2">{program.goals.map(goal=><span key={goal} className="bg-secondary px-3 py-2 text-xs font-bold">{goal}</span>)}</div>}</header><div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)]"><section>{playing ? <div><div className="aspect-video overflow-hidden bg-ink">{playbackLoading ? <div className="grid h-full place-items-center text-ink-foreground"><Loader2 className="h-7 w-7 animate-spin" /></div> : playbackUrl ? <iframe src={playbackUrl} title={playing.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0" /> : null}</div><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Now playing</p><h2 className="mt-1 text-2xl font-extrabold">{playing.title}</h2>{playing.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{playing.summary}</p>}<p className="mt-4 border-l-2 border-accent pl-4 text-xs leading-5 text-muted-foreground">Use the player’s CC menu to select any available English or Korean captions.</p></div> : <div className="grid aspect-video place-items-center border border-border bg-secondary p-8 text-center"><div><Play className="mx-auto h-8 w-8" /><h2 className="mt-4 text-2xl font-extrabold">Choose a lesson to begin</h2><p className="mt-2 text-sm text-muted-foreground">Your video will play securely here.</p></div></div>}{error && <p className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}</section><aside><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Lesson sequence</p><div className="mt-3 border border-border">{sections.map(({ module, lessons: sectionLessons }) => <section key={module.id} className="border-b border-border last:border-b-0"><div className="bg-secondary px-4 py-3"><h2 className="text-sm font-extrabold">{module.title}</h2></div><ol>{sectionLessons.map((lesson, index) => { const ready = lesson.stream_status === "ready"; const active=playing?.id===lesson.id; return <li key={lesson.id} className="border-t border-border first:border-t-0"><button type="button" disabled={!ready} onClick={() => void play(lesson)} aria-current={active?"step":undefined} className={`flex w-full items-center gap-3 px-4 py-4 text-left disabled:cursor-not-allowed disabled:opacity-50 ${active?"bg-accent text-accent-foreground":""}`}><span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-background text-foreground">{ready ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span><span className="min-w-0"><span className="block text-sm font-bold">{index + 1}. {lesson.title}</span><span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.1em] opacity-70">{ready ? formatDuration(lesson.duration_seconds) : "Video processing"}</span></span></button></li>; })}</ol></section>)}</div></aside></div>{(recipes.length>0||guides.length>0)&&<section className="mt-16 border-t border-border pt-10"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Included resources</p><h2 className="mt-2 text-3xl font-extrabold">Keep the context beside the practice.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Use these references to understand the movement pattern, review key cues, and revisit the supporting exercises.</p><div className="mt-7 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">{guides.map(guide=><Link key={`guide-${guide.slug}`} to="/guides/$slug" params={{slug:guide.slug}} className="group bg-card p-6"><BookOpen className="h-5 w-5"/><p className="mt-5 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Movement guide</p><h3 className="mt-2 text-xl font-extrabold">{guide.title}</h3>{guide.summary&&<p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{guide.summary}</p>}<span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Open guide <ArrowRight className="h-4 w-4"/></span></Link>)}{recipes.map(recipe=><Link key={`recipe-${recipe.slug}`} to="/recipes/$slug" params={{slug:recipe.slug}} className="group bg-card p-6">{recipe.imageUrl&&<img src={recipe.imageUrl} alt={recipe.imageAlt||""} className="mb-5 aspect-video w-full object-cover" loading="lazy"/>}<p className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Exercise recipe</p><h3 className="mt-2 text-xl font-extrabold">{recipe.title}</h3>{(recipe.goal||recipe.summary)&&<p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{recipe.goal||recipe.summary}</p>}<span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Open recipe <ArrowRight className="h-4 w-4"/></span></Link>)}</div></section>}</main>;
}

function formatDuration(seconds: number | null) { if (!seconds) return "Video lesson"; return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
