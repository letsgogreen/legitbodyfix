import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
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
  stripe_price_lookup_key: string;
  stripe_price_id: string;
  stripe_product_id: string;
  entitlement_key: string;
  image_url: string;
  image_alt: string;
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
  stripe_price_lookup_key: "",
  stripe_price_id: "",
  stripe_product_id: "",
  entitlement_key: "",
  image_url: "",
  image_alt: "",
  featured: false,
  featured_rank: "",
  published: false,
};

export const Route = createFileRoute("/ver1/admin/programs")({
  head: () => ({
    meta: [
      { title: "Programs — LegitBodyFix Admin" },
      { name: "description", content: "Manage live LegitBodyFix programs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProgramsView,
});

function ProgramsView() {
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [editing, setEditing] = useState<ProgramDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = async () => {
    setLoading(true);
    setError(null);
    const { data, error: readError } = await supabase
      .from("programs")
      .select("*")
      .order("featured_rank", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false });
    if (readError) setError(readError.message);
    else setPrograms(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void loadPrograms();
  }, []);

  const liveCount = useMemo(
    () => programs.filter((program) => program.published).length,
    [programs],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead
        title="Programs"
        meta={`${programs.length} programs · ${liveCount} published · live Supabase data`}
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
                <Th>Stripe lookup key</Th>
                <Th>Status</Th>
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
                    {program.stripe_price_lookup_key || "Not connected"}
                  </Td>
                  <Td>
                    <Tag tone={program.published ? "accent" : "muted"}>
                      {program.published ? "Published" : "Draft"}
                    </Tag>
                  </Td>
                  <Td className="font-mono text-xs text-muted-foreground">
                    {new Date(program.updated_at).toLocaleDateString()}
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to="/ver1/admin/lessons"
                        search={{ program: program.id }}
                        className="inline-flex min-h-9 items-center rounded-sm border border-border px-3 text-xs font-bold"
                      >
                        <FileVideo className="mr-1.5 h-3.5 w-3.5" /> Videos
                      </Link>
                      <Btn onClick={() => setEditing(rowToDraft(program))}>Edit</Btn>
                    </div>
                  </Td>
                </tr>
              ))}
              {!programs.length && (
                <tr>
                  <Td colSpan={6} className="py-12 text-center text-muted-foreground">
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
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
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
    stripe_price_lookup_key: program.stripe_price_lookup_key ?? "",
    stripe_price_id: program.stripe_price_id ?? "",
    stripe_product_id: program.stripe_product_id ?? "",
    entitlement_key: program.entitlement_key ?? "",
    image_url: program.image_url ?? "",
    image_alt: program.image_alt ?? "",
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

function ProgramDrawer({
  initial,
  onClose,
  onSaved,
}: {
  initial: ProgramDraft;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeOption[]>([]);
  const [recipeLinks, setRecipeLinks] = useState<RecipeLink[]>([]);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [guideCount, setGuideCount] = useState(0);
  const update = <K extends keyof ProgramDraft>(key: K, value: ProgramDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

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
        ready: Boolean(draft.image_url.trim() && draft.image_alt.trim()),
      },
      {
        label: "Stripe price connected",
        ready: Boolean(draft.stripe_price_id || draft.stripe_price_lookup_key.trim()),
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
    [draft, guideCount, lessons, recipeLinks.length],
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
    if (!initial.published && draft.published && launchBlockers.length) {
      setError(`Cannot publish yet: ${launchBlockers.map((item) => item.label).join(", ")}.`);
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: draft.name.trim(),
      slug: draft.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-"),
      outcome: draft.outcome.trim() || null,
      who_its_for: draft.who_its_for.trim() || null,
      format: draft.format.trim() || null,
      duration_label: draft.duration_label.trim() || null,
      level: draft.level.trim() || null,
      regions: csv(draft.regions),
      goals: csv(draft.goals),
      stripe_price_lookup_key: draft.stripe_price_lookup_key.trim() || null,
      entitlement_key: draft.entitlement_key.trim() || null,
      image_url: draft.image_url.trim() || null,
      image_alt: draft.image_alt.trim() || null,
      featured: draft.featured,
      featured_rank: draft.featured_rank ? Number(draft.featured_rank) : null,
      published: draft.published,
    };
    const result = draft.id
      ? await supabase.from("programs").update(payload).eq("id", draft.id)
      : await supabase.from("programs").insert(payload);
    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }
    await onSaved();
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
            onClick={onClose}
            aria-label="Close"
            className="rounded-sm border border-border p-1.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {draft.id && (
            <div className="flex items-center justify-between gap-4 border border-border bg-secondary/40 p-4">
              <div>
                <p className="text-sm font-bold">Curriculum & videos</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload lessons, choose video frames, and preview playback.
                </p>
              </div>
              <Link
                to="/ver1/admin/lessons"
                search={{ program: draft.id }}
                className="inline-flex min-h-10 shrink-0 items-center rounded-sm bg-ink px-3 text-xs font-bold text-ink-foreground"
              >
                <FileVideo className="mr-1.5 h-4 w-4" /> Manage
              </Link>
            </div>
          )}
          {draft.id && (
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
                      ? `${launchBlockers.length} launch items remaining`
                      : "Ready for launch"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    A program should have a clear offer, a working price, playable curriculum, a
                    free preview, and useful supporting content before publication.
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
          <Field
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
          <div className="grid grid-cols-2 gap-3">
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
          <Field
            label="Stripe price lookup key"
            value={draft.stripe_price_lookup_key}
            onChange={(value) => update("stripe_price_lookup_key", value)}
          />
          {draft.id && (
            <div className="grid grid-cols-2 gap-3">
              <ReadOnly label="Stripe price ID" value={draft.stripe_price_id || "Not resolved"} />
              <ReadOnly
                label="Stripe product ID"
                value={draft.stripe_product_id || "Not connected"}
              />
            </div>
          )}
          <Field
            label="Entitlement key"
            value={draft.entitlement_key}
            onChange={(value) => update("entitlement_key", value)}
          />
          <div className="border border-border bg-card p-4">
            <ImageUploadField
              value={draft.image_url}
              alt={draft.image_alt}
              folder={`programs/${draft.id ?? (draft.slug || "new")}`}
              label="Program cover image"
              onChange={(value) => update("image_url", value)}
              onAltChange={(value) => update("image_alt", value)}
            />
          </div>
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
          </div>
          {draft.id && (
            <div className="border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Linked corrective recipes</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Order the supporting material included with this program.
                  </p>
                </div>
                <Link
                  to="/library/$programSlug"
                  params={{ programSlug: draft.slug }}
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
                <option value="">Add a recipe…</option>
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
                    No recipes linked yet.
                  </p>
                )}
              </div>
            </div>
          )}
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Prices remain controlled by Stripe. This page stores only the lookup key used to
            retrieve the live price.
          </p>
          {error && (
            <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="ink" disabled={saving} onClick={() => void save()}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save program"}
          </Btn>
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
