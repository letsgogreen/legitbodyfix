import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import {
  GuideLibrary,
  type GuideLibraryItem,
  type GuideLibraryStatus,
} from "@/components/admin/GuideLibrary";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Guide = Database["public"]["Tables"]["guides"]["Row"];
type Recipe = Pick<
  Database["public"]["Tables"]["recipes"]["Row"],
  "id" | "title" | "published" | "image_url"
>;
type Muscle = Pick<Database["public"]["Tables"]["muscles"]["Row"], "id" | "name" | "published">;
type Program = Pick<Database["public"]["Tables"]["programs"]["Row"], "id" | "name" | "published">;
type RecipeLink = { recipe_id: string; position: number | null };
type MuscleLink = { muscle_id: string; role: "tight" | "weak" | null };
type ProgramLink = { program_id: string; position: number | null };
type GuideRecipeIndexLink = { guide_id: string; recipe_id: string; position: number | null };
type GuideMuscleIndexLink = { guide_id: string };
type GuideProgramIndexLink = { guide_id: string };

type GuideSearch = {
  guide?: string;
  q?: string;
  status?: GuideLibraryStatus;
  region?: string;
};
type GuideSearchPatch = {
  [Key in keyof GuideSearch]?: GuideSearch[Key] | undefined;
};

const blankGuide = (): Guide => ({
  id: "",
  slug: "",
  title: "",
  pattern_summary: null,
  common_regions: [],
  self_check: null,
  watch_for: null,
  published: false,
  published_at: null,
  review_status: "draft",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const Route = createFileRoute("/ver1/admin/guides")({
  validateSearch: (search: Record<string, unknown>): GuideSearch => {
    const parsed: GuideSearch = {};
    if (typeof search["guide"] === "string") parsed.guide = search["guide"];
    if (typeof search["q"] === "string") parsed.q = search["q"];
    if (
      search["status"] === "draft" ||
      search["status"] === "published" ||
      search["status"] === "needs-review"
    )
      parsed.status = search["status"];
    if (typeof search["region"] === "string") parsed.region = search["region"];
    return parsed;
  },
  head: () => ({
    meta: [
      { title: "Posture guides — LegitBodyFix Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GuideEditor,
});

function GuideEditor() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [guideLibrary, setGuideLibrary] = useState<GuideLibraryItem[]>([]);
  const [draft, setDraft] = useState<Guide | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [recipeLinks, setRecipeLinks] = useState<RecipeLink[]>([]);
  const [muscleLinks, setMuscleLinks] = useState<MuscleLink[]>([]);
  const [programLinks, setProgramLinks] = useState<ProgramLink[]>([]);
  const [status, setStatus] = useState("Loading guides…");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadIndex = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const [
      guideResult,
      recipeResult,
      muscleResult,
      programResult,
      recipeLinkResult,
      muscleLinkResult,
      programLinkResult,
    ] = await Promise.all([
      supabase.from("guides").select("*").order("title"),
      supabase.from("recipes").select("id,title,published,image_url").order("title"),
      supabase.from("muscles").select("id,name,published").order("name"),
      supabase.from("programs").select("id,name,published").order("name"),
      supabase.from("guide_recipes").select("guide_id,recipe_id,position"),
      supabase.from("guide_muscles").select("guide_id"),
      supabase.from("guide_programs").select("guide_id"),
    ]);
    const error =
      guideResult.error ??
      recipeResult.error ??
      muscleResult.error ??
      programResult.error ??
      recipeLinkResult.error ??
      muscleLinkResult.error ??
      programLinkResult.error;
    if (error) {
      setLoadError(`Could not load guide controls: ${error.message}`);
      setStatus("Guide library unavailable.");
      setLoading(false);
      return;
    }
    const nextGuides = guideResult.data ?? [];
    const nextRecipes = recipeResult.data ?? [];
    const indexRecipeLinks = (recipeLinkResult.data ?? []) as GuideRecipeIndexLink[];
    const indexMuscleLinks = (muscleLinkResult.data ?? []) as GuideMuscleIndexLink[];
    const indexProgramLinks = (programLinkResult.data ?? []) as GuideProgramIndexLink[];
    const recipeById = new Map(nextRecipes.map((recipe) => [recipe.id, recipe]));
    const recipesByGuide = new Map<string, GuideRecipeIndexLink[]>();
    const muscleCountByGuide = new Map<string, number>();
    const programCountByGuide = new Map<string, number>();
    for (const link of indexRecipeLinks) {
      const existing = recipesByGuide.get(link.guide_id) ?? [];
      existing.push(link);
      recipesByGuide.set(link.guide_id, existing);
    }
    for (const link of indexMuscleLinks) {
      muscleCountByGuide.set(link.guide_id, (muscleCountByGuide.get(link.guide_id) ?? 0) + 1);
    }
    for (const link of indexProgramLinks) {
      programCountByGuide.set(link.guide_id, (programCountByGuide.get(link.guide_id) ?? 0) + 1);
    }
    setGuides(nextGuides);
    setRecipes(nextRecipes);
    setMuscles(muscleResult.data ?? []);
    setPrograms(programResult.data ?? []);
    setGuideLibrary(
      nextGuides.map((guide) => {
        const guideRecipeLinks = (recipesByGuide.get(guide.id) ?? []).sort(
          (a, b) =>
            (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER),
        );
        const primaryRecipe = guideRecipeLinks
          .map((link) => recipeById.get(link.recipe_id))
          .find((recipe): recipe is Recipe => Boolean(recipe?.image_url));
        return {
          id: guide.id,
          slug: guide.slug,
          title: guide.title,
          patternSummary: guide.pattern_summary,
          regions: guide.common_regions,
          published: guide.published,
          reviewStatus: guide.review_status,
          imageUrl: primaryRecipe?.image_url ?? null,
          imageAlt: primaryRecipe ? `${guide.title} — ${primaryRecipe.title}` : "",
          recipeCount: guideRecipeLinks.length,
          muscleCount: muscleCountByGuide.get(guide.id) ?? 0,
          programCount: programCountByGuide.get(guide.id) ?? 0,
        };
      }),
    );
    setStatus(`${nextGuides.length} guides loaded.`);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadIndex();
  }, [loadIndex]);

  useEffect(() => {
    if (!search.guide || !guides.length || draft?.id === search.guide) return;
    const requestedGuide = guides.find((guide) => guide.id === search.guide);
    if (requestedGuide) void selectGuide(requestedGuide);
  }, [search.guide, guides, draft?.id]);

  async function selectGuide(guide: Guide) {
    setDraft({ ...guide });
    const [r, m, p] = await Promise.all([
      supabase
        .from("guide_recipes")
        .select("recipe_id,position")
        .eq("guide_id", guide.id)
        .order("position"),
      supabase.from("guide_muscles").select("muscle_id,role").eq("guide_id", guide.id),
      supabase
        .from("guide_programs")
        .select("program_id,position")
        .eq("guide_id", guide.id)
        .order("position"),
    ]);
    const error = r.error ?? m.error ?? p.error;
    if (error) {
      setStatus(`Could not load relationships: ${error.message}`);
      return;
    }
    setRecipeLinks((r.data ?? []) as RecipeLink[]);
    setMuscleLinks((m.data ?? []) as MuscleLink[]);
    setProgramLinks((p.data ?? []) as ProgramLink[]);
    setStatus(`Editing ${guide.title}.`);
  }

  function createGuide() {
    setDraft(blankGuide());
    setRecipeLinks([]);
    setMuscleLinks([]);
    setProgramLinks([]);
    void navigate({
      search: (previous) => ({ ...previous, guide: "new" }),
    });
  }

  function openGuide(guideId: string) {
    const guide = guides.find((item) => item.id === guideId);
    if (!guide) return;
    void navigate({ search: (previous) => ({ ...previous, guide: guideId }) });
    void selectGuide(guide);
  }

  function closeGuide() {
    setDraft(null);
    setRecipeLinks([]);
    setMuscleLinks([]);
    setProgramLinks([]);
    setStatus(`${guides.length} guides loaded.`);
    void navigate({
      replace: true,
      search: (previous) => {
        const { guide: _guide, ...rest } = previous;
        return rest;
      },
    });
  }

  function updateLibrarySearch(patch: GuideSearchPatch) {
    void navigate({
      replace: true,
      search: (previous) => {
        const next = { ...previous, ...patch };
        return Object.fromEntries(
          Object.entries(next).filter(([, value]) => value !== undefined && value !== ""),
        ) as GuideSearch;
      },
    });
  }

  const blockers = useMemo(() => {
    if (!draft) return [];
    return [
      !draft.title.trim() && "title",
      !draft.slug.trim() && "slug",
      !draft.pattern_summary?.trim() && "pattern summary",
      !draft.self_check?.trim() && "self-check",
      !draft.watch_for?.trim() && "watch-for guidance",
    ].filter(Boolean) as string[];
  }, [draft]);

  async function save(publish?: boolean) {
    if (!draft) return;
    setBusy(true);
    const payload = {
      title: draft.title.trim(),
      slug: draft.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-"),
      pattern_summary: draft.pattern_summary?.trim() || null,
      common_regions: draft.common_regions,
      self_check: draft.self_check?.trim() || null,
      watch_for: draft.watch_for?.trim() || null,
      published: publish ?? draft.published,
      ...(publish === false ? { review_status: "draft" as const } : {}),
    };
    const result = draft.id
      ? await supabase.from("guides").update(payload).eq("id", draft.id).select("*").single()
      : await supabase.from("guides").insert(payload).select("*").single();
    setBusy(false);
    if (result.error || !result.data) {
      setStatus(`Save failed: ${result.error?.message ?? "unknown error"}`);
      return;
    }
    await loadIndex();
    await selectGuide(result.data);
    void navigate({
      replace: true,
      search: (previous) => ({ ...previous, guide: result.data.id }),
    });
    setStatus(
      publish === true
        ? "Guide published."
        : publish === false
          ? "Guide unpublished."
          : "Guide saved.",
    );
  }

  async function addRecipe(recipeId: string) {
    if (!draft?.id || !recipeId || recipeLinks.some((x) => x.recipe_id === recipeId)) return;
    const { error } = await supabase
      .from("guide_recipes")
      .insert({ guide_id: draft.id, recipe_id: recipeId, position: recipeLinks.length + 1 });
    if (error) {
      setStatus(error.message);
      return;
    }
    await selectGuide(draft);
  }

  async function removeRecipe(recipeId: string) {
    if (!draft?.id) return;
    const { error } = await supabase
      .from("guide_recipes")
      .delete()
      .eq("guide_id", draft.id)
      .eq("recipe_id", recipeId);
    if (error) {
      setStatus(error.message);
      return;
    }
    await selectGuide(draft);
  }

  async function moveRecipe(index: number, delta: number) {
    if (!draft?.id) return;
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
          .from("guide_recipes")
          .update({ position: position + 1 })
          .eq("guide_id", draft.id)
          .eq("recipe_id", link.recipe_id),
      ),
    );
    const error = results.find((result) => result.error)?.error;
    if (error) {
      setStatus(error.message);
      return;
    }
    setRecipeLinks(next.map((link, position) => ({ ...link, position: position + 1 })));
  }

  async function addMuscle(muscleId: string) {
    if (!draft?.id || !muscleId || muscleLinks.some((x) => x.muscle_id === muscleId)) return;
    const { error } = await supabase
      .from("guide_muscles")
      .insert({ guide_id: draft.id, muscle_id: muscleId, role: "tight" });
    if (error) {
      setStatus(error.message);
      return;
    }
    await selectGuide(draft);
  }

  async function setMuscleRole(muscleId: string, role: "tight" | "weak") {
    if (!draft?.id) return;
    const { error } = await supabase
      .from("guide_muscles")
      .update({ role })
      .eq("guide_id", draft.id)
      .eq("muscle_id", muscleId);
    if (error) {
      setStatus(error.message);
      return;
    }
    setMuscleLinks((current) =>
      current.map((link) => (link.muscle_id === muscleId ? { ...link, role } : link)),
    );
  }

  async function removeMuscle(muscleId: string) {
    if (!draft?.id) return;
    const { error } = await supabase
      .from("guide_muscles")
      .delete()
      .eq("guide_id", draft.id)
      .eq("muscle_id", muscleId);
    if (error) {
      setStatus(error.message);
      return;
    }
    await selectGuide(draft);
  }

  async function toggleProgram(programId: string) {
    if (!draft?.id) return;
    const linked = programLinks.some((x) => x.program_id === programId);
    const result = linked
      ? await supabase
          .from("guide_programs")
          .delete()
          .eq("guide_id", draft.id)
          .eq("program_id", programId)
      : await supabase
          .from("guide_programs")
          .insert({ guide_id: draft.id, program_id: programId, position: programLinks.length + 1 });
    if (result.error) {
      setStatus(result.error.message);
      return;
    }
    await selectGuide(draft);
  }

  const recipeById = (id: string) => recipes.find((item) => item.id === id);
  const muscleById = (id: string) => muscles.find((item) => item.id === id);

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8">
      <PageHead
        title={draft ? draft.title || "New posture guide" : "Choose a guide to edit"}
        meta={
          draft
            ? "Guide ↔ recipe ↔ muscle ↔ program control"
            : "Review posture guides, relationships, and publication readiness"
        }
        actions={
          <>
            {draft && (
              <Btn onClick={closeGuide}>
                <ArrowLeft className="h-4 w-4" /> Back to guides
              </Btn>
            )}
            <Btn variant="ink" onClick={createGuide}>
              <Plus className="h-4 w-4" /> New guide
            </Btn>
          </>
        }
      />
      {draft ? (
        <>
          <p className="mt-4 border border-border bg-secondary/40 px-4 py-3 text-sm" role="status">
            {status}
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
            <div className="space-y-5">
              <Panel className="space-y-4 p-5">
                <Field
                  label="Title"
                  value={draft.title}
                  onChange={(value) => setDraft({ ...draft, title: value })}
                />
                <Field
                  label="Slug"
                  value={draft.slug}
                  onChange={(value) => setDraft({ ...draft, slug: value })}
                />
                <Field
                  label="Regions (comma separated)"
                  value={draft.common_regions.join(", ")}
                  onChange={(value) => setDraft({ ...draft, common_regions: csv(value) })}
                />
                <Area
                  label="Pattern summary"
                  value={draft.pattern_summary ?? ""}
                  onChange={(value) => setDraft({ ...draft, pattern_summary: value })}
                />
                <Area
                  label="Self-check"
                  value={draft.self_check ?? ""}
                  onChange={(value) => setDraft({ ...draft, self_check: value })}
                />
                <Area
                  label="Watch for / safety"
                  value={draft.watch_for ?? ""}
                  onChange={(value) => setDraft({ ...draft, watch_for: value })}
                />
                <div className="flex flex-wrap gap-2">
                  <Btn variant="ink" disabled={busy} onClick={() => void save()}>
                    <Save className="h-4 w-4" /> Save
                  </Btn>
                  {draft.published ? (
                    <Btn disabled={busy} onClick={() => void save(false)}>
                      Unpublish
                    </Btn>
                  ) : (
                    <Btn
                      variant="accent"
                      disabled={busy || blockers.length > 0}
                      onClick={() => void save(true)}
                    >
                      Publish
                    </Btn>
                  )}
                  {draft.published && (
                    <Link
                      to="/guides/$slug"
                      params={{ slug: draft.slug }}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 text-xs font-bold"
                    >
                      Public page <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                {blockers.length > 0 && (
                  <p className="text-xs text-destructive">
                    Publish blocked: {blockers.join(", ")} required.
                  </p>
                )}
              </Panel>
              {draft.id && (
                <>
                  <RelationPanel
                    title="Corrective recipes"
                    options={recipes.filter(
                      (item) => !recipeLinks.some((link) => link.recipe_id === item.id),
                    )}
                    optionLabel={(item) => item.title}
                    onAdd={addRecipe}
                  >
                    {recipeLinks.map((link, index) => {
                      const recipe = recipeById(link.recipe_id);
                      return (
                        <RelationRow
                          key={link.recipe_id}
                          name={recipe?.title ?? link.recipe_id}
                          {...(recipe ? { live: recipe.published } : {})}
                          {...(!recipe?.image_url ? { warning: "missing image" } : {})}
                        >
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
                        </RelationRow>
                      );
                    })}
                  </RelationPanel>
                  <RelationPanel
                    title="Muscles involved"
                    options={muscles.filter(
                      (item) => !muscleLinks.some((link) => link.muscle_id === item.id),
                    )}
                    optionLabel={(item) => item.name}
                    onAdd={addMuscle}
                  >
                    {muscleLinks.map((link) => {
                      const muscle = muscleById(link.muscle_id);
                      return (
                        <RelationRow
                          key={link.muscle_id}
                          name={muscle?.name ?? link.muscle_id}
                          {...(muscle ? { live: muscle.published } : {})}
                        >
                          <select
                            value={link.role ?? "tight"}
                            onChange={(event) =>
                              void setMuscleRole(
                                link.muscle_id,
                                event.target.value as "tight" | "weak",
                              )
                            }
                            className="rounded-sm border border-border bg-background px-2 py-1 text-xs"
                          >
                            <option value="tight">Restricted</option>
                            <option value="weak">Capacity</option>
                          </select>
                          <Btn onClick={() => void removeMuscle(link.muscle_id)}>
                            <Trash2 className="h-3 w-3" />
                          </Btn>
                        </RelationRow>
                      );
                    })}
                  </RelationPanel>
                  <Panel className="p-5">
                    <h2 className="text-lg font-extrabold">Related programs</h2>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {programs.map((program) => (
                        <label
                          key={program.id}
                          className="flex items-center gap-3 border border-border px-3 py-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={programLinks.some((link) => link.program_id === program.id)}
                            onChange={() => void toggleProgram(program.id)}
                            className="h-4 w-4 accent-lime"
                          />
                          <span className="flex-1 font-bold">{program.name}</span>
                          <Tag tone={program.published ? "accent" : "muted"}>
                            {program.published ? "live" : "draft"}
                          </Tag>
                        </label>
                      ))}
                    </div>
                  </Panel>
                </>
              )}
            </div>
            <Panel className="h-fit overflow-hidden">
              <div className="border-b border-border bg-secondary/50 px-4 py-3 font-mono text-[10px] uppercase tracking-[.14em]">
                Public-page preview
              </div>
              <div className="p-6">
                <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">
                  Movement guide
                </p>
                <h2 className="mt-3 text-4xl font-extrabold uppercase leading-[.95]">
                  {draft.title || "Untitled guide"}
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {draft.pattern_summary ||
                    "Add a pattern summary to preview the guide introduction."}
                </p>
                <div className="mt-6 border-t border-border pt-5">
                  <h3 className="font-extrabold uppercase">Exercise recipes</h3>
                  <div className="mt-3 grid gap-2">
                    {recipeLinks.map((link) => {
                      const recipe = recipeById(link.recipe_id);
                      return (
                        <div key={link.recipe_id} className="flex gap-3 border border-border p-3">
                          {recipe?.image_url && (
                            <img
                              src={recipe.image_url}
                              alt=""
                              className="h-16 w-20 object-contain"
                            />
                          )}
                          <div>
                            <strong className="text-sm">{recipe?.title ?? link.recipe_id}</strong>
                            {!recipe?.published && (
                              <p className="text-[10px] text-destructive">Not visible publicly</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </>
      ) : (
        <GuideLibrary
          guides={guideLibrary}
          loading={loading}
          error={loadError}
          query={search.q ?? ""}
          status={search.status ?? "all"}
          region={search.region ?? ""}
          onQueryChange={(q) => updateLibrarySearch({ q: q || undefined })}
          onStatusChange={(nextStatus) =>
            updateLibrarySearch({ status: nextStatus === "all" ? undefined : nextStatus })
          }
          onRegionChange={(region) => updateLibrarySearch({ region: region || undefined })}
          onSelect={openGuide}
          onCreate={createGuide}
          onRetry={() => void loadIndex()}
        />
      )}
    </div>
  );
}

function csv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
function Field({
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
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}
function Area({
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
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">
      {children}
    </span>
  );
}
function RelationPanel<T extends { id: string }>({
  title,
  options,
  optionLabel,
  onAdd,
  children,
}: {
  title: string;
  options: T[];
  optionLabel: (item: T) => string;
  onAdd: (id: string) => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <Panel className="p-5">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <select
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) void onAdd(event.target.value);
          event.target.value = "";
        }}
        className="mt-3 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">Add…</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {optionLabel(item)}
          </option>
        ))}
      </select>
      <div className="mt-3 space-y-2">{children}</div>
    </Panel>
  );
}
function RelationRow({
  name,
  live,
  warning,
  children,
}: {
  name: string;
  live?: boolean;
  warning?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border border-border px-3 py-2">
      <span className="min-w-40 flex-1 text-sm font-bold">{name}</span>
      <Tag tone={live ? "accent" : "muted"}>{live ? "live" : "draft"}</Tag>
      {warning && <Tag tone="warn">{warning}</Tag>}
      {children}
    </div>
  );
}
