import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2, Lock, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getStreamPlayback } from "@/lib/stream.functions";
import { getCustomerAccess } from "@/lib/customer-access";
import { RecipeBlockContent } from "@/components/recipes/RecipeBlockContent";
import { getPublishedRecipe } from "@/lib/recipes.functions";
import { blocksFromLegacyInstructions, normalizeRecipeBlocks } from "@/lib/recipe-blocks";

type Program = Database["public"]["Tables"]["programs"]["Row"];
type Module = Database["public"]["Tables"]["program_modules"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
type RelatedRecipe = { slug: string; title: string; summary: string | null; goal: string | null; imageUrl: string | null; imageAlt: string | null };
type RelatedGuide = { slug: string; title: string; summary: string | null };
type EmbeddedRecipe = NonNullable<Awaited<ReturnType<typeof getPublishedRecipe>>>;

export const Route = createFileRoute("/library/$programSlug")({ component: ProgramLibrary });

function ProgramLibrary() {
  const { programSlug } = Route.useParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [recipes, setRecipes] = useState<RelatedRecipe[]>([]);
  const [guides, setGuides] = useState<RelatedGuide[]>([]);
  const [embeddedRecipes, setEmbeddedRecipes] = useState<EmbeddedRecipe[]>([]);
  const [playing, setPlaying] = useState<Lesson | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true); setProgram(null); setModules([]); setLessons([]); setRecipes([]); setGuides([]); setEmbeddedRecipes([]); setPlaying(null); setPlaybackUrl(null); setError(null);
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
        const linkedRecipes = (recipeResult.data ?? []).flatMap((row) => {
          const recipe = row.recipes as unknown as { slug:string; title:string; summary:string|null; goal:string|null; image_url:string|null; image_alt:string|null; published:boolean } | null;
          return recipe?.published ? [{ slug:recipe.slug, title:recipe.title, summary:recipe.summary, goal:recipe.goal, imageUrl:recipe.image_url, imageAlt:recipe.image_alt }] : [];
        });
        setRecipes(linkedRecipes);
        const recipeDetails = await Promise.all(linkedRecipes.map((recipe) => getPublishedRecipe({ data: { slug: recipe.slug } })));
        setEmbeddedRecipes(recipeDetails.filter((recipe): recipe is EmbeddedRecipe => recipe !== null));
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
  const resourceCards = useMemo(() => {
    const cards = new Map<string, { title: string; summary: string | null; guide?: RelatedGuide; recipe?: RelatedRecipe }>();
    const keyFor = (title: string) => title.trim().toLocaleLowerCase().replace(/[^a-z0-9가-힣]+/g, " ").trim();
    for (const guide of guides) cards.set(keyFor(guide.title), { title: guide.title, summary: guide.summary, guide });
    for (const recipe of recipes) {
      const key = keyFor(recipe.title);
      const existing = cards.get(key);
      cards.set(key, existing
        ? { ...existing, summary: recipe.goal || recipe.summary || existing.summary, recipe }
        : { title: recipe.title, summary: recipe.goal || recipe.summary, recipe });
    }
    return [...cards.values()];
  }, [guides, recipes]);

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

  return <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16"><Link to="/library" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" />My library</Link><header className="mt-8 border-y border-border py-7"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Your program</p><div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{program.name}</h1><p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{program.outcome}</p></div><div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.12em]"><span className="border border-border px-3 py-2">{lessons.length} lessons</span><span className="border border-border px-3 py-2">{totalMinutes} min</span>{program.level&&<span className="border border-border px-3 py-2">{program.level}</span>}</div></div>{program.goals.length>0&&<div className="mt-6 flex flex-wrap gap-2">{program.goals.map(goal=><span key={goal} className="bg-secondary px-3 py-2 text-xs font-bold">{goal}</span>)}</div>}</header><div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)]"><section>{playing ? <div><div className="aspect-video overflow-hidden bg-ink">{playbackLoading ? <div className="grid h-full place-items-center text-ink-foreground"><Loader2 className="h-7 w-7 animate-spin" /></div> : playbackUrl ? <iframe src={playbackUrl} title={playing.title} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0" /> : null}</div><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Now playing</p><h2 className="mt-1 text-2xl font-extrabold">{playing.title}</h2>{playing.summary && <p className="mt-2 text-sm leading-6 text-muted-foreground">{playing.summary}</p>}<p className="mt-4 border-l-2 border-accent pl-4 text-xs leading-5 text-muted-foreground">Use the player’s CC menu to select any available English or Korean captions.</p></div> : <div className="grid aspect-video place-items-center border border-border bg-secondary p-8 text-center"><div><Play className="mx-auto h-8 w-8" /><h2 className="mt-4 text-2xl font-extrabold">Choose a lesson to begin</h2><p className="mt-2 text-sm text-muted-foreground">Your video will play securely here.</p></div></div>}{error && <p className="mt-4 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}</section><aside><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Lesson sequence</p><div className="mt-3 border border-border">{sections.map(({ module, lessons: sectionLessons }) => <section key={module.id} className="border-b border-border last:border-b-0"><div className="bg-secondary px-4 py-3"><h2 className="text-sm font-extrabold">{module.title}</h2></div><ol>{sectionLessons.map((lesson, index) => { const ready = lesson.stream_status === "ready"; const active=playing?.id===lesson.id; return <li key={lesson.id} className="border-t border-border first:border-t-0"><button type="button" disabled={!ready} onClick={() => void play(lesson)} aria-current={active?"step":undefined} className={`flex w-full items-center gap-3 px-4 py-4 text-left disabled:cursor-not-allowed disabled:opacity-50 ${active?"bg-accent text-accent-foreground":""}`}><span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-background text-foreground">{ready ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span><span className="min-w-0"><span className="block text-sm font-bold">{index + 1}. {lesson.title}</span><span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.1em] opacity-70">{ready ? formatDuration(lesson.duration_seconds) : "Video processing"}</span></span></button></li>; })}</ol></section>)}</div></aside></div>{embeddedRecipes.length > 0 && <section className="mt-16 border-t border-border pt-10"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Included corrective movement strategies</p><h2 className="mt-2 text-3xl font-extrabold">Understand what you are working on.</h2><div className="mt-8 space-y-16">{embeddedRecipes.map((recipe) => <EmbeddedRecipeContent key={recipe.id} recipe={recipe} />)}</div></section>}</main>;
}

function EmbeddedRecipeContent({ recipe }: { recipe: EmbeddedRecipe }) {
  const storedBlocks = normalizeRecipeBlocks(recipe.content_blocks);
  const blocks = storedBlocks.length ? storedBlocks : blocksFromLegacyInstructions(recipe.instructions);
  return <article className="overflow-hidden border border-border bg-background"><header className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,.9fr)] lg:p-10"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Corrective movement strategy</p><h3 className="mt-3 text-3xl font-extrabold uppercase leading-none sm:text-4xl">{recipe.title}</h3>{recipe.goal && <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{recipe.goal}</p>}</div>{recipe.image_url && <img src={recipe.image_url} alt={recipe.image_alt ?? recipe.title} className="aspect-video h-full w-full border border-border object-cover" />}</header><div className="grid gap-px border-y border-border bg-border md:grid-cols-2"><MuscleGroup title="Typically overactive / tight" items={recipe.tight} /><MuscleGroup title="Typically underactive / weak" items={recipe.weak} /></div><div className="grid gap-10 p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,.8fr)] lg:p-10"><div><RecipeBlockContent blocks={blocks} />{recipe.assessment_clues && <section className="mt-10"><h4 className="text-xl font-extrabold uppercase">What to look for</h4><p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{recipe.assessment_clues}</p></section>}</div><aside className="space-y-5">{recipe.dosage && <InfoCard label="Dosage" value={recipe.dosage} />}{(recipe.equipment ?? []).length > 0 && <InfoCard label="Equipment" value={(recipe.equipment as string[]).join(", ")} />}{recipe.safety_notes && <InfoCard label="Safety" value={recipe.safety_notes} strong />}</aside></div><div className="border-t border-border p-6 lg:px-10"><Link to="/recipes/$slug" params={{ slug: recipe.slug }} className="inline-flex items-center gap-2 text-sm font-bold">Open full guide <ArrowRight className="h-4 w-4" /></Link></div></article>;
}

function MuscleGroup({ title, items }: { title: string; items: EmbeddedRecipe["tight"] }) {
  return <section className="bg-secondary/40 p-6 lg:p-8"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">{title}</p><ul className="mt-4 divide-y divide-border border-y border-border">{items.length ? items.map((muscle) => <li key={muscle.id}><Link to="/muscles/$muscleId" params={{ muscleId: muscle.id }} className="flex items-center justify-between gap-3 py-3 text-sm font-bold"><span>{muscle.name}</span><span className="font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground">{muscle.group || "Muscle"}</span></Link></li>) : <li className="py-3 text-sm text-muted-foreground">No muscles linked yet.</li>}</ul></section>;
}

function InfoCard({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <section className={`border bg-card p-5 ${strong ? "border-foreground" : "border-border"}`}><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">{label}</p><p className="mt-3 whitespace-pre-line text-sm leading-6">{value}</p></section>;
}
function formatDuration(seconds: number | null) { if (!seconds) return "Video lesson"; return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
