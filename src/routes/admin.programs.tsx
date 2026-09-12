import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  FileVideo,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Btn, PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { ProgramCurriculum } from "@/components/admin/ProgramCurriculum";
import { ProgramSalesPageEditor } from "@/components/admin/ProgramSalesPageEditor";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { deleteAdminProgram, getAdminPrograms, getProgramDeleteImpact, saveAdminProgram, setAdminProgramPublished, type AdminProgram } from "@/lib/admin-programs.functions";
import { getProgramPrice, updateProgramPrice } from "@/lib/paddle.functions";

type ProgramRow = AdminProgram;
type RecipeOption = Pick<
  Database["public"]["Tables"]["recipes"]["Row"],
  "id" | "title" | "published" | "image_url"
>;
type RecipeLink = { recipe_id: string; position: number | null };
type LessonSummary = Pick<
  Database["public"]["Tables"]["lessons"]["Row"],
  "id" | "published" | "preview_free" | "stream_status"
>;
type ProgramDraft = {
  id?: string;
  name: string;
  slug: string;
  outcome: string;
  who_its_for: string;
  format: string;
  duration_label: string;
  level: string;
  regions: string;
  goals: string;
  paddle_product_id: string;
  paddle_price_id: string;
  entitlement_key: string;
  image_url: string;
  image_alt: string;
  fallback_image_url: string;
  featured: boolean;
  featured_rank: string;
  published: boolean;
};

const emptyDraft: ProgramDraft = {
  name: "",
  slug: "",
  outcome: "",
  who_its_for: "",
  format: "On-demand video program",
  duration_label: "",
  level: "Foundational",
  regions: "",
  goals: "",
  paddle_product_id: "",
  paddle_price_id: "",
  entitlement_key: "",
  image_url: "",
  image_alt: "",
  fallback_image_url: "",
  featured: false,
  featured_rank: "",
  published: false,
};

export const Route = createFileRoute("/admin/programs")({
  validateSearch: (search: Record<string, unknown>): { action?: "new"; edit?: string; view?: "curriculum" | "sales"; program?: string } => ({ action: search["action"] === "new" ? "new" : undefined, edit: typeof search["edit"] === "string" ? search["edit"] : undefined, view: search.view === "curriculum" || search.view === "sales" ? search.view : undefined, program: typeof search.program === "string" ? search.program : undefined }),
  head: () => ({
    meta: [
      { title: "Programs — LegitBodyFix Admin" },
      { name: "description", content: "Manage live LegitBodyFix programs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProgramsWorkspace,
});

function ProgramsWorkspace() {
  const { view, program } = Route.useSearch();
  return <>
    <nav aria-label="Program workspace" className="flex flex-wrap gap-2 border-b border-border px-5 py-3">
      <Link to="/admin/programs" search={{}} aria-current={!view ? "page" : undefined} className={`min-h-11 px-4 py-3 text-sm font-bold ${!view ? "bg-ink text-ink-foreground" : "border border-border"}`}>Programs & details</Link>
      <Link to="/admin/programs" search={{ view: "curriculum", program }} aria-current={view === "curriculum" ? "page" : undefined} className={`min-h-11 px-4 py-3 text-sm font-bold ${view === "curriculum" ? "bg-ink text-ink-foreground" : "border border-border"}`}>Curriculum & videos</Link>
      <Link to="/admin/programs" search={{ view: "sales" }} aria-current={view === "sales" ? "page" : undefined} className={`min-h-11 px-4 py-3 text-sm font-bold ${view === "sales" ? "bg-ink text-ink-foreground" : "border border-border"}`}>Sales page</Link>
    </nav>
    {view === "curriculum" ? <ProgramCurriculum key={program ?? "default"} requestedProgramId={program}/> : view === "sales" ? <ProgramSalesPageEditor/> : <ProgramsView/>}
  </>;
}

function ProgramsView() {
  const { action, edit } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/programs" });
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [editing, setEditing] = useState<ProgramDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handledSearchRef = useRef<string | null>(null);

  const loadPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      setPrograms(await getAdminPrograms());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadPrograms();
  }, []);

  useEffect(() => {
    const searchKey = action === "new" ? "new" : edit ? `edit:${edit}` : null;
    if (!searchKey) { handledSearchRef.current = null; return; }
    if (loading || editing || handledSearchRef.current === searchKey) return;
    handledSearchRef.current = searchKey;
    if (action === "new") { setEditing({ ...emptyDraft }); return; }
    const selected = programs.find((program) => program.id === edit);
    if (selected) setEditing(rowToDraft(selected));
  }, [action, edit, editing, loading, programs]);

  const liveCount = useMemo(
    () => programs.filter((program) => program.published).length,
    [programs],
  );

  const closeEditor = () => {
    setEditing(null);
    if (action || edit) void navigate({ search: { action: undefined, edit: undefined } });
  };

  const togglePublished = async (program: ProgramRow) => {
    const nextPublished = !program.published;
    setPublishingId(program.id);
    setError(null);
    try {
      const updated = await setAdminProgramPublished({
        data: { programId: program.id, published: nextPublished },
      });
      setPrograms((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead
        title="Programs"
        meta={loading ? "Loading your programs…" : error && !programs.length ? "Program data could not be loaded" : `${programs.length} programs · ${liveCount} published`}
        actions={
          <Btn variant="ink" onClick={() => setEditing({ ...emptyDraft })}>
            <Plus className="mr-1.5 h-4 w-4" /> New program
          </Btn>
        }
      />

      {error && (
        <div className="mt-5 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load programs: {error}
        </div>
      )}

      <Panel className="mt-5 overflow-x-auto">
        {loading ? (
          <div className="flex min-h-44 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading programs…
          </div>
        ) : (
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr>
                <Th>Program</Th>
                <Th>Regions</Th>
                <Th>Paddle price</Th>
                <Th>Status</Th>
                <Th>Ready</Th>
                <Th>Updated</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-secondary/50">
                  <Td>
                    <p className="font-medium">{program.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      /{program.slug}
                    </p>
                  </Td>
                  <Td className="text-muted-foreground">{program.regions.join(", ") || "—"}</Td>
                  <Td className="font-mono text-xs text-muted-foreground">
                    {(program as ProgramRow & { paddle_price_id?: string | null }).paddle_price_id || "Not connected"}
                  </Td>
                  <Td>
                    <Tag tone={program.published ? "accent" : "muted"}>
                      {program.published ? "Published" : "Draft"}
                    </Tag>
                  </Td>
                  <Td>
                    {(() => {
                      const missing = programReadiness(program);
                      return missing.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {missing.map((item) => (
                            <Tag key={item} tone="warn">
                              Missing {item}
                            </Tag>
                          ))}
                        </div>
                      ) : (
                        <Tag tone="accent">Ready</Tag>
                      );
                    })()}
                  </Td>
                  <Td className="font-mono text-xs text-muted-foreground">
                    {new Date(program.updated_at).toLocaleDateString()}
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Btn
                        disabled={publishingId === program.id}
                        onClick={() => void togglePublished(program)}
                      >
                        {publishingId === program.id
                          ? "Saving…"
                          : program.published
                            ? "Unpublish"
                            : "Publish"}
                      </Btn>
                      <Link
                        to="/programs/$programSlug"
                        params={{ programSlug: program.slug }}
                        search={{ preview: "admin" }}
                        target="_blank"
                        className="inline-flex min-h-9 items-center rounded-sm border border-border px-3 text-xs font-bold"
                      >
                        Sales <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                      <Link
                        to="/admin/programs"
                        search={{ view: "curriculum", program: program.id }}
                        className="inline-flex min-h-9 items-center rounded-sm border border-border px-3 text-xs font-bold"
                      >
                        <FileVideo className="mr-1.5 h-3.5 w-3.5" /> Videos
                      </Link>
                      <Btn onClick={() => setEditing(rowToDraft(program))}>Edit</Btn>
                    </div>
                  </Td>
                </tr>
              ))}
              {!programs.length && !error && (
                <tr>
                  <Td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No programs yet. Create the first program to begin.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Panel>

      {editing && (
        <ProgramDrawer
          initial={editing}
          onClose={closeEditor}
          onRefresh={loadPrograms}
          onSaved={async () => {
            closeEditor();
            await loadPrograms();
          }}
        />
      )}
    </div>
  );
}

function rowToDraft(program: ProgramRow): ProgramDraft {
  return {
    id: program.id,
    name: program.name,
    slug: program.slug,
    outcome: program.outcome ?? "",
    who_its_for: program.who_its_for ?? "",
    format: program.format ?? "",
    duration_label: program.duration_label ?? "",
    level: program.level ?? "",
    regions: program.regions.join(", "),
    goals: program.goals.join(", "),
    paddle_product_id: (program as ProgramRow & { paddle_product_id?: string | null }).paddle_product_id ?? "",
    paddle_price_id: (program as ProgramRow & { paddle_price_id?: string | null }).paddle_price_id ?? "",
    entitlement_key: program.entitlement_key ?? "",
    image_url: program.image_url ?? "",
    image_alt: program.image_alt ?? "",
    fallback_image_url: program.fallback_image_url ?? "",
    featured: program.featured,
    featured_rank: program.featured_rank?.toString() ?? "",
    published: program.published,
  };
}

function csv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function programReadiness(program: ProgramRow) {
  const missing: string[] = [];
  if (!program.image_url && !program.fallback_image_url) missing.push("cover");
  if (program.image_url && !program.image_alt) missing.push("alt");
  if (!(program as ProgramRow & { paddle_price_id?: string | null }).paddle_price_id) {
    missing.push("price");
  }
  if (!program.outcome) missing.push("outcome");
  return missing;
}

function draftToPayload(draft: ProgramDraft) {
  return {
    name: draft.name.trim(),
    slug: draft.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-"),
    outcome: draft.outcome.trim() || null,
    whoItsFor: draft.who_its_for.trim() || null,
    format: draft.format.trim() || null,
    durationLabel: draft.duration_label.trim() || null,
    level: draft.level.trim() || null,
    regions: csv(draft.regions),
    goals: csv(draft.goals),
    paddleProductId: draft.paddle_product_id.trim() || null,
    entitlementKey: draft.entitlement_key.trim() || null,
    imageUrl: draft.image_url.trim() || null,
    imageAlt: draft.image_alt.trim() || null,
    featured: draft.featured,
    featuredRank: draft.featured_rank ? Number(draft.featured_rank) : null,
    published: draft.published,
  };
}

type ProgramEditorSection = "overview" | "presentation" | "content" | "commerce";

const programEditorSections: Array<{
  id: ProgramEditorSection;
  label: string;
  description: string;
}> = [
  { id: "overview", label: "Overview", description: "What customers see first" },
  { id: "presentation", label: "Presentation", description: "Cover and storefront details" },
  { id: "content", label: "Content", description: "Videos and related guidance" },
  { id: "commerce", label: "Publish", description: "Price, access, and visibility" },
];

function ProgramDrawer({
  initial,
  onClose,
  onRefresh,
  onSaved,
}: {
  initial: ProgramDraft;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onSaved: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageMessage, setImageMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [recipeLinks, setRecipeLinks] = useState<RecipeLink[]>([]);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [guideCount, setGuideCount] = useState(0);
  const [section, setSection] = useState<ProgramEditorSection>("overview");
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);
  const effectiveCover = draft.image_url.trim() || draft.fallback_image_url.trim();
  const closeSafely = () => {
    if (isDirty && !window.confirm("Discard your unsaved program changes?")) return;
    onClose();
  };

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);
  const update = <K extends keyof ProgramDraft>(key: K, value: ProgramDraft[K]) => {
    setSaveMessage(null);
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const loadRecipeLinks = useCallback(async () => {
    if (!initial.id) return;
    const [recipeResult, linkResult, lessonResult, guideResult] = await Promise.all([
      supabase.from("recipes").select("id,title,published,image_url").order("title"),
      supabase
        .from("program_recipes")
        .select("recipe_id,position")
        .eq("program_id", initial.id)
        .order("position"),
      supabase
        .from("lessons")
        .select("id,published,preview_free,stream_status")
        .eq("program_id", initial.id),
      supabase
        .from("guide_programs")
        .select("guide_id", { count: "exact", head: true })
        .eq("program_id", initial.id),
    ]);
    const readError =
      recipeResult.error ?? linkResult.error ?? lessonResult.error ?? guideResult.error;
    if (readError) {
      setError(`Could not load recipe relationships: ${readError.message}`);
      return;
    }
    setRecipes(recipeResult.data ?? []);
    setRecipeLinks((linkResult.data ?? []) as RecipeLink[]);
    setLessons((lessonResult.data ?? []) as LessonSummary[]);
    setGuideCount(guideResult.count ?? 0);
  }, [initial.id]);

  useEffect(() => {
    void loadRecipeLinks();
  }, [loadRecipeLinks]);

  const launchChecks = useMemo(
    () => [
      {
        label: "Outcome and audience written",
        ready: Boolean(draft.outcome.trim() && draft.who_its_for.trim()),
      },
      {
        label: "Cover image and alt text",
        ready: Boolean(effectiveCover && (!draft.image_url.trim() || draft.image_alt.trim())),
      },
      {
        label: "Paddle price connected",
        ready: Boolean(draft.paddle_price_id),
      },
      { label: "At least one lesson", ready: lessons.length > 0 },
      {
        label: "At least one ready video",
        ready: lessons.some((lesson) => lesson.stream_status === "ready"),
      },
      {
        label: "Free preview selected",
        ready: lessons.some((lesson) => lesson.preview_free && lesson.stream_status === "ready"),
      },
      { label: "Supporting recipe linked", ready: recipeLinks.length > 0 },
      { label: "Movement guide linked", ready: guideCount > 0 },
    ],
    [draft, effectiveCover, guideCount, lessons, recipeLinks.length],
  );
  const launchBlockers = launchChecks.filter((check) => !check.ready);

  async function addRecipe(recipeId: string) {
    if (!initial.id || !recipeId || recipeLinks.some((link) => link.recipe_id === recipeId)) return;
    const { error: relationError } = await supabase
      .from("program_recipes")
      .insert({ program_id: initial.id, recipe_id: recipeId, position: recipeLinks.length + 1 });
    if (relationError) {
      setError(relationError.message);
      return;
    }
    await loadRecipeLinks();
  }

  async function removeRecipe(recipeId: string) {
    if (!initial.id) return;
    const { error: relationError } = await supabase
      .from("program_recipes")
      .delete()
      .eq("program_id", initial.id)
      .eq("recipe_id", recipeId);
    if (relationError) {
      setError(relationError.message);
      return;
    }
    await loadRecipeLinks();
  }

  async function moveRecipe(index: number, delta: number) {
    if (!initial.id) return;
    const target = index + delta;
    if (target < 0 || target >= recipeLinks.length) return;
    const next = [...recipeLinks];
    const current = next[index];
    const swap = next[target];
    if (!current || !swap) return;
    next[index] = swap;
    next[target] = current;
    const results = await Promise.all(
      next.map((link, position) =>
        supabase
          .from("program_recipes")
          .update({ position: position + 1 })
          .eq("program_id", initial.id!)
          .eq("recipe_id", link.recipe_id),
      ),
    );
    const relationError = results.find((result) => result.error)?.error;
    if (relationError) {
      setError(relationError.message);
      return;
    }
    setRecipeLinks(next.map((link, position) => ({ ...link, position: position + 1 })));
  }

  const save = async () => {
    if (!draft.name.trim() || !draft.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const saved = await saveAdminProgram({ data: { id: draft.id, ...draftToPayload(draft) } });
      if (!draft.id) {
        await onSaved();
        return;
      }
      const nextDraft = rowToDraft({ ...saved, fallback_image_url: draft.fallback_image_url });
      setDraft(nextDraft);
      setBaseline(nextDraft);
      setSaveMessage("Program saved. You can keep editing.");
      await onRefresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  };

  const saveUploadedCover = async (imageUrl: string) => {
    const nextDraft = { ...draft, image_url: imageUrl };
    setDraft(nextDraft);
    setImageMessage(null);
    if (!nextDraft.id) return;
    if (!nextDraft.name.trim() || !nextDraft.slug.trim()) {
      setImageMessage("Cover uploaded. Save the program to keep it on this new draft.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveAdminProgram({ data: { id: nextDraft.id, ...draftToPayload(nextDraft) } });
      setBaseline(nextDraft);
      await onRefresh();
      setImageMessage("Cover uploaded and saved to this program.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  };

  const deleteProgram = async () => {
    if (!draft.id) return;
    setDeleting(true);
    setError(null);
    let impact: Awaited<ReturnType<typeof getProgramDeleteImpact>>;
    try {
      impact = await getProgramDeleteImpact({ data: { programId: draft.id } });
    } catch (cause) {
      setError(`Could not check linked records: ${cause instanceof Error ? cause.message : String(cause)}`);
      setDeleting(false);
      return;
    }
    const orderCount = impact.orders;
    const entitlementCount = impact.entitlements;
    if (orderCount || entitlementCount) {
      setError(`This program cannot be deleted because it has ${orderCount} order${orderCount === 1 ? "" : "s"} and ${entitlementCount} customer access record${entitlementCount === 1 ? "" : "s"}. Unpublish it instead to preserve purchase history.`);
      setDeleting(false);
      return;
    }
    const lessonCount = impact.lessons;
    const moduleCount = impact.modules;
    if (!window.confirm(`Delete “${draft.name}”? This also removes ${moduleCount} module${moduleCount === 1 ? "" : "s"}, ${lessonCount} lesson${lessonCount === 1 ? "" : "s"}, and its guide/recipe links. This cannot be undone.`)) { setDeleting(false); return; }
    try {
      await deleteAdminProgram({ data: { programId: draft.id } });
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-border bg-background">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {draft.id ? "Editing program" : "New program"}
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight">
              {draft.name || "Untitled program"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeSafely}
            aria-label="Close"
            className="rounded-sm border border-border p-1.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 border-b border-border bg-card">
          {programEditorSections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`min-h-16 border-r border-border px-2 py-3 text-left last:border-r-0 ${section === item.id ? "bg-ink text-ink-foreground" : "hover:bg-secondary"}`}
            >
              <span className="block text-xs font-extrabold">{item.label}</span>
              <span className={`mt-1 hidden text-[10px] leading-tight sm:block ${section === item.id ? "text-ink-foreground/65" : "text-muted-foreground"}`}>{item.description}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-[72px_1fr] gap-4 border border-border bg-card p-4">
            <div className="aspect-square overflow-hidden bg-secondary">
              {effectiveCover ? <img src={effectiveCover} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center font-mono text-[9px] uppercase text-muted-foreground">No cover</div>}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><Tag tone={draft.published ? "accent" : "muted"}>{draft.published ? "Published" : "Draft"}</Tag>{isDirty && <Tag tone="warn">Unsaved</Tag>}</div>
              <p className="mt-2 truncate text-sm font-extrabold">{draft.name || "Untitled program"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{lessons.length} lesson{lessons.length === 1 ? "" : "s"} · {draft.paddle_price_id ? "Price connected" : "No price"} · {effectiveCover ? (draft.image_url ? "Program cover" : "Lesson thumbnail fallback") : "No storefront image"}</p>
            </div>
          </div>
          {section === "content" && draft.id && (
            <div className="border border-border bg-secondary/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">Curriculum & videos</p>
                  <p className="mt-1 text-xs text-muted-foreground">{lessons.length ? `${lessons.length} lessons connected` : "Add the first lesson and video."}</p>
                </div>
                <Link to="/admin/programs" search={{ view: "curriculum", program: draft.id }} className="inline-flex min-h-10 shrink-0 items-center rounded-sm bg-ink px-3 text-xs font-bold text-ink-foreground"><FileVideo className="mr-1.5 h-4 w-4" /> Manage</Link>
              </div>
            </div>
          )}
          {section === "commerce" && draft.id && (
            <div
              className={`border p-4 ${launchBlockers.length ? "border-amber-500/50 bg-amber-50/40" : "border-lime-500/50 bg-lime-50/40"}`}
            >
              <div className="flex items-start gap-3">
                {launchBlockers.length ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                ) : (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                )}
                <div>
                  <p className="text-sm font-extrabold">
                    {launchBlockers.length
                      ? `${launchBlockers.length} readiness suggestions`
                      : "All readiness suggestions complete"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    These checks are editorial guidance only. Administrators can publish at any
                    time, including while a program is still being assembled.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {launchChecks.map((check) => (
                  <span
                    key={check.label}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${check.ready ? "text-foreground" : "text-amber-800"}`}
                  >
                    {check.ready ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {check.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {section === "overview" && <><Field
            label="Program name"
            value={draft.name}
            onChange={(value) => update("name", value)}
          />
          <Field label="URL slug" value={draft.slug} onChange={(value) => update("slug", value)} />
          <TextArea
            label="Outcome / promise"
            value={draft.outcome}
            onChange={(value) => update("outcome", value)}
          />
          <TextArea
            label="Who it is for"
            value={draft.who_its_for}
            onChange={(value) => update("who_its_for", value)}
          />
          </>}
          {section === "presentation" && <><div className="grid grid-cols-2 gap-3">
            <Field
              label="Format"
              value={draft.format}
              onChange={(value) => update("format", value)}
            />
            <Field
              label="Duration"
              value={draft.duration_label}
              onChange={(value) => update("duration_label", value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Level" value={draft.level} onChange={(value) => update("level", value)} />
            <Field
              label="Featured rank"
              value={draft.featured_rank}
              onChange={(value) => update("featured_rank", value)}
              type="number"
            />
          </div>
          <Field
            label="Regions (comma-separated)"
            value={draft.regions}
            onChange={(value) => update("regions", value)}
          />
          <Field
            label="Goals (comma-separated)"
            value={draft.goals}
            onChange={(value) => update("goals", value)}
          />
          <div className="border border-border bg-card p-4">
            <ImageUploadField
              value={draft.image_url}
              alt={draft.image_alt}
              folder={`programs/${draft.id ?? (draft.slug || "new")}`}
              bucket="program-images"
              label="Program cover image"
              onChange={(value) => update("image_url", value)}
              onUploaded={(value) => { void saveUploadedCover(value); }}
              onAltChange={(value) => update("image_alt", value)}
            />
            {!draft.image_url && draft.fallback_image_url && <p className="mt-3 border-l-2 border-accent px-3 text-xs leading-5 text-muted-foreground">No dedicated cover is set. The storefront currently uses the first available lesson thumbnail shown above.</p>}
            {imageMessage && <p className="mt-2 text-xs font-medium text-emerald-700">{imageMessage}</p>}
          </div></>}
          {section === "commerce" && <><details className="border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-extrabold">Paddle and access settings</summary>
            <div className="mt-4 space-y-4">
          <Field label="Paddle product ID" value={draft.paddle_product_id} onChange={(value) => update("paddle_product_id", value)} />
          {draft.id && <PaddlePricePanel programId={draft.id} productId={draft.paddle_product_id.trim()} priceId={draft.paddle_price_id} onChanged={({ productId, priceId }) => { update("paddle_product_id", productId); update("paddle_price_id", priceId); void onRefresh(); }} />}
              <Field
                label="Entitlement key"
                value={draft.entitlement_key}
                onChange={(value) => update("entitlement_key", value)}
              />
            </div>
          </details>
          <div className="grid grid-cols-2 gap-3 border border-border bg-card p-3">
            <Toggle
              label="Feature on homepage"
              checked={draft.featured}
              onChange={(value) => update("featured", value)}
            />
            <Toggle
              label="Publish program"
              checked={draft.published}
              onChange={(value) => update("published", value)}
            />
          </div></>}
          {section === "content" && draft.id && (
            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Related Posture & Movement</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose and order the supporting guidance included with this program.
                  </p>
                </div>
                <Link
                  to="/programs/$programSlug"
                  params={{ programSlug: draft.slug }}
                  search={{ preview: "admin" }}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-bold underline"
                >
                  Sales-page preview <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <select
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) void addRecipe(event.target.value);
                  event.target.value = "";
                }}
                className="mt-4 w-full rounded-sm border border-border bg-background px-3 py-2 text-xs"
              >
                <option value="">Add Posture & Movement content…</option>
                {recipes
                  .filter((recipe) => !recipeLinks.some((link) => link.recipe_id === recipe.id))
                  .map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.title}
                    </option>
                  ))}
              </select>
              <div className="mt-3 space-y-2">
                {recipeLinks.map((link, index) => {
                  const recipe = recipes.find((item) => item.id === link.recipe_id);
                  return (
                    <div
                      key={link.recipe_id}
                      className="flex items-center gap-2 border border-border px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 text-xs font-bold">
                        {recipe?.title ?? link.recipe_id}
                      </span>
                      <Tag tone={recipe?.published ? "accent" : "muted"}>
                        {recipe?.published ? "live" : "draft"}
                      </Tag>
                      {!recipe?.image_url && <Tag tone="warn">no image</Tag>}
                      <Btn disabled={index === 0} onClick={() => void moveRecipe(index, -1)}>
                        <ArrowUp className="h-3 w-3" />
                      </Btn>
                      <Btn
                        disabled={index === recipeLinks.length - 1}
                        onClick={() => void moveRecipe(index, 1)}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Btn>
                      <Btn onClick={() => void removeRecipe(link.recipe_id)}>
                        <Trash2 className="h-3 w-3" />
                      </Btn>
                    </div>
                  );
                })}
                {!recipeLinks.length && (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    No supporting content linked yet.
                  </p>
                )}
              </div>
            </div>
          )}
          {section === "commerce" && <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            New sales use Paddle. Historical Stripe identifiers remain stored only for old orders.
          </p>}
          {error && (
            <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {saveMessage && !error && (
            <p className="border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              {saveMessage}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-4">
          <div>{draft.id && <Btn disabled={saving || deleting} onClick={() => void deleteProgram()}><Trash2 className="mr-1.5 h-4 w-4" />{deleting ? "Checking…" : "Delete program"}</Btn>}</div>
          <div className="flex items-center gap-2"><Btn onClick={closeSafely}>{isDirty ? "Discard" : "Close"}</Btn>
          <Btn variant="ink" disabled={saving || deleting} onClick={() => void save()}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save program"}
          </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </span>
  );
}

function PaddlePricePanel({ programId, productId, priceId, onChanged }: { programId: string; productId: string; priceId: string; onChanged: (result: { productId: string; priceId: string }) => void }) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [livePrice, setLivePrice] = useState<string | null>(null);
  const [priceStatus, setPriceStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!priceId) { setLivePrice(null); setPriceStatus("idle"); return; }
    setPriceStatus("loading");
    void getProgramPrice({ data: { priceId } })
      .then((result) => { setLivePrice(result.price); setPriceStatus(result.price ? "ready" : "unavailable"); })
      .catch(() => { setLivePrice(null); setPriceStatus("unavailable"); });
  }, [priceId]);

  const savePrice = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setMessage("Enter a price greater than zero."); return; }
    setWorking(true); setMessage(null);
    try {
      const result = await updateProgramPrice({ data: { programId, productId: productId || null, amount: value, currency } });
      onChanged({ productId: result.productId, priceId: result.priceId }); setLivePrice(result.livePrice); setAmount("");
      setPriceStatus(result.livePrice ? "ready" : "unavailable");
      setMessage(`Paddle product and price saved${result.previousArchived ? "; previous price archived" : ""}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Price update failed."); }
    finally { setWorking(false); }
  };

  return <div className="space-y-3 border border-border bg-card p-4">
    <div><Label>Live Paddle price</Label><p className="text-sm font-bold">{priceStatus === "loading" ? "Checking Paddle…" : priceStatus === "unavailable" ? "Unavailable — check Paddle configuration" : livePrice ?? "No price set"}</p></div>
    {!productId && <p className="text-xs text-muted-foreground">No Paddle product yet. Saving a price will create and connect it automatically.</p>}
    <div className="grid grid-cols-[1fr_7rem] gap-3"><Field label="New amount" type="number" value={amount} onChange={setAmount} /><Field label="Currency" value={currency} onChange={(value) => setCurrency(value.toUpperCase())} /></div><Btn variant="ink" disabled={working} onClick={() => void savePrice()}>{working ? "Updating…" : productId ? "Save Paddle price" : "Create Paddle product & price"}</Btn>
    {message && <p className="text-xs text-muted-foreground">{message}</p>}
  </div>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"
      />
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="min-h-9 break-all rounded-sm border border-border bg-secondary/50 px-3 py-2 font-mono text-[10px] text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-lime"
      />
      {label}
    </label>
  );
}
