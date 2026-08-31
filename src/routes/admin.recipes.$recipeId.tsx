import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, ExternalLink, Plus, Save, X } from "lucide-react";
import { PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { detectKoreanText } from "@/lib/recipe-import";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/recipes/$recipeId")({
  head: () => ({
    meta: [
      { title: "Recipe review — LegitBodyFix Admin" },
      {
        name: "description",
        content: "Review an imported recipe field by field, then publish it individually.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecipeReview,
});

type RecipeRow = {
  id: string;
  title: string;
  slug: string;
  goal: string | null;
  summary: string | null;
  instructions: string | null;
  safety_notes: string | null;
  assessment_clues: string | null;
  dosage: string | null;
  evidence: string | null;
  regions: string[];
  equipment: string[];
  symptoms_goals: string[];
  movement_functions: string[];
  progression_level: string | null;
  session_minutes: number | null;
  image_url: string | null;
  image_alt: string | null;
  notion_url: string | null;
  review_status: string;
  published: boolean;
  version: number;
};

type LinkRow = { role: string; muscle_id: string; muscles: { name: string; published: boolean } | null };
type MuscleOption = { id: string; name: string; anatomical_group: string; published: boolean };
type ProgramOption = { id: string; name: string; published: boolean };
type ProgramLink = { program_id: string; position: number | null; programs: { name: string; published: boolean } | null };
type GuideOption = { id: string; slug: string; title: string; published: boolean };
type GuideLink = { guide_id: string; position: number | null; guides: { slug: string; title: string; published: boolean } | null };

const EDITABLE = [
  ["goal", "Goal"],
  ["summary", "Summary"],
  ["instructions", "Instructions"],
  ["safety_notes", "Safety notes"],
  ["assessment_clues", "Assessment clues"],
  ["dosage", "Dosage"],
  ["evidence", "Evidence"],
] as const;

/** Mirrors the database publish trigger so the admin sees the blockers before saving. */
function publishBlockers(record: RecipeRow) {
  const missing: string[] = [];
  if (!record.title?.trim()) missing.push("title");
  if (!record.goal?.trim()) missing.push("goal");
  if (!record.instructions?.trim()) missing.push("instructions");
  if (!record.safety_notes?.trim()) missing.push("safety notes");
  if (!record.regions.length) missing.push("at least one region");

  const blockers = missing.length ? [`Missing required field(s): ${missing.join(", ")}.`] : [];
  const korean = detectKoreanText({
    title: record.title,
    goal: record.goal,
    summary: record.summary,
    instructions: record.instructions,
    safety_notes: record.safety_notes,
    assessment_clues: record.assessment_clues,
  });
  if (korean.length)
    blockers.push(`Korean text suspected in: ${korean.join(", ")} — translate before publishing.`);
  return blockers;
}

function RecipeReview() {
  const { recipeId } = Route.useParams();
  const [record, setRecord] = useState<RecipeRow | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [programLinks, setProgramLinks] = useState<ProgramLink[]>([]);
  const [guideLinks, setGuideLinks] = useState<GuideLink[]>([]);
  const [muscles, setMuscles] = useState<MuscleOption[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [guides, setGuides] = useState<GuideOption[]>([]);
  const [muscleQuery, setMuscleQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<"tight" | "weak">("tight");
  const [status, setStatus] = useState("Loading recipe…");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("recipes").select("*").eq("id", recipeId).single();
    if (error || !data) {
      setStatus(`Could not load this recipe: ${error?.message ?? "not found"}`);
      return;
    }
    setRecord(data as RecipeRow);
    setStatus(`Version ${data.version} loaded · review status ${data.review_status}.`);

    const [muscleLinksResult, programLinksResult, guideLinksResult, musclesResult, programsResult, guidesResult] = await Promise.all([
      supabase.from("recipe_muscles").select("role, muscle_id, muscles(name, published)").eq("recipe_id", recipeId),
      supabase.from("program_recipes").select("program_id, position, programs(name, published)").eq("recipe_id", recipeId).order("position"),
      supabase.from("guide_recipes").select("guide_id, position, guides(slug, title, published)").eq("recipe_id", recipeId).order("position"),
      supabase.from("muscles").select("id, name, anatomical_group, published").order("name"),
      supabase.from("programs").select("id, name, published").order("name"),
      supabase.from("guides").select("id, slug, title, published").order("title"),
    ]);
    setLinks((muscleLinksResult.data ?? []) as unknown as LinkRow[]);
    setProgramLinks((programLinksResult.data ?? []) as unknown as ProgramLink[]);
    setGuideLinks((guideLinksResult.data ?? []) as unknown as GuideLink[]);
    setMuscles((musclesResult.data ?? []) as MuscleOption[]);
    setPrograms((programsResult.data ?? []) as ProgramOption[]);
    setGuides((guidesResult.data ?? []) as GuideOption[]);
  }, [recipeId]);

  useEffect(() => {
    void load();
  }, [load]);

  function setField<K extends keyof RecipeRow>(field: K, value: RecipeRow[K]) {
    setRecord((current) => (current ? { ...current, [field]: value } : current));
  }

  async function addMuscle(muscleId: string) {
    if (links.some((link) => link.muscle_id === muscleId && link.role === selectedRole)) return;
    const { error } = await supabase.from("recipe_muscles").insert({ recipe_id: recipeId, muscle_id: muscleId, role: selectedRole });
    if (error) { setStatus(`Could not link muscle: ${error.message}`); return; }
    setMuscleQuery("");
    setStatus("Muscle relation added.");
    await load();
  }

  async function removeMuscle(muscleId: string, role: string) {
    const { error } = await supabase.from("recipe_muscles").delete().eq("recipe_id", recipeId).eq("muscle_id", muscleId).eq("role", role as "tight" | "weak");
    if (error) { setStatus(`Could not remove muscle: ${error.message}`); return; }
    setStatus("Muscle relation removed.");
    await load();
  }

  async function toggleProgram(programId: string) {
    const existing = programLinks.find((link) => link.program_id === programId);
    const result = existing
      ? await supabase.from("program_recipes").delete().eq("program_id", programId).eq("recipe_id", recipeId)
      : await supabase.from("program_recipes").insert({ program_id: programId, recipe_id: recipeId, position: programLinks.length + 1 });
    if (result.error) { setStatus(`Could not update program relation: ${result.error.message}`); return; }
    setStatus(existing ? "Recipe removed from program." : "Recipe added to program.");
    await load();
  }

  async function toggleGuide(guideId: string) {
    const existing = guideLinks.find((link) => link.guide_id === guideId);
    const result = existing
      ? await supabase.from("guide_recipes").delete().eq("guide_id", guideId).eq("recipe_id", recipeId)
      : await supabase.from("guide_recipes").insert({ guide_id: guideId, recipe_id: recipeId, position: guideLinks.length + 1 });
    if (result.error) { setStatus(`Could not update posture relation: ${result.error.message}`); return; }
    setStatus(existing ? "Recipe removed from posture page." : "Recipe added to posture page.");
    await load();
  }

  async function save(publish?: boolean) {
    if (!record) return;
    setBusy(true);
    const patch: Record<string, unknown> = {
      title: record.title,
      goal: record.goal,
      summary: record.summary,
      instructions: record.instructions,
      safety_notes: record.safety_notes,
      assessment_clues: record.assessment_clues,
      dosage: record.dosage,
      evidence: record.evidence,
      regions: record.regions,
      image_url: record.image_url,
      image_alt: record.image_alt,
    };
    if (publish === true) patch["published"] = true;
    if (publish === false) {
      patch["published"] = false;
      patch["review_status"] = "needs_data_review";
    }

    const { data, error } = await supabase
      .from("recipes")
      .update(patch as never)
      .eq("id", record.id)
      .select("*")
      .single();
    setBusy(false);

    if (error || !data) {
      setStatus(`Save failed: ${error?.message ?? "unknown error"}`);
      return;
    }
    setRecord(data as RecipeRow);
    setStatus(
      publish === true
        ? `Published as version ${data.version}. The public page is live.`
        : publish === false
          ? "Unpublished and returned to data review."
          : `Saved as version ${data.version}. Still unpublished.`,
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
        <p className="rounded-sm border border-border bg-secondary/50 px-4 py-3 text-sm">{status}</p>
      </div>
    );
  }

  const blockers = publishBlockers(record);

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead
        title={record.title}
        meta={`${record.slug} · version ${record.version} · ${record.published ? "published" : record.review_status}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/recipes"
              className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Recipes
            </Link>
            {record.published && (
              <Link
                to="/recipes/$slug"
                params={{ slug: record.slug }}
                target="_blank"
                className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-bold"
              >
                Public preview <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => void save()}
              disabled={busy}
              className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-bold disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" /> Save draft
            </button>
            {record.published ? (
              <button
                type="button"
                onClick={() => void save(false)}
                disabled={busy}
                className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-bold disabled:opacity-40"
              >
                Unpublish
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void save(true)}
                disabled={busy || blockers.length > 0}
                className="inline-flex min-h-10 items-center gap-2 rounded-sm bg-accent px-4 py-2 text-xs font-bold text-accent-foreground disabled:opacity-40"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Publish
              </button>
            )}
          </div>
        }
      />

      <p className="mt-4 rounded-sm border border-border bg-secondary/50 px-4 py-3 text-sm">
        {status}
      </p>

      {blockers.length > 0 && (
        <Panel className="mt-4 border-destructive/40 p-4">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Blocked from publishing
          </p>
          <ul className="mt-2 space-y-1 text-sm text-destructive">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.7fr)]">
        <Panel className="grid gap-4 p-5">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Title
            </span>
            <input
              value={record.title}
              onChange={(event) => setField("title", event.target.value)}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Regions (comma separated)
            </span>
            <input
              value={record.regions.join(", ")}
              onChange={(event) =>
                setField(
                  "regions",
                  event.target.value
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                )
              }
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          {EDITABLE.map(([field, label]) => (
            <label key={field} className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </span>
              <textarea
                value={record[field] ?? ""}
                onChange={(event) => setField(field, event.target.value)}
                rows={field === "instructions" ? 10 : 3}
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          ))}
        </Panel>

        <div className="space-y-4">
          <Panel className="p-4">
            <ImageUploadField
              value={record.image_url ?? ""}
              alt={record.image_alt ?? ""}
              folder={`recipes/${record.id}`}
              bucket="recipe-images"
              label="Recipe cover image"
              onChange={(url) => setField("image_url", url || null)}
              onAltChange={(alt) => setField("image_alt", alt || null)}
            />
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Manual replacements are copied to permanent Supabase Storage. The original Notion source link remains available below for traceability.
            </p>
          </Panel>

          <Panel className="overflow-hidden">
            {record.image_url ? (
              <div className="grid min-h-72 place-items-center bg-secondary/30 p-4"><img
                src={record.image_url}
                alt={record.image_alt ?? record.title}
                className="max-h-[32rem] w-full object-contain"
              /></div>
            ) : (
              <div className="grid h-72 place-items-center text-xs text-muted-foreground">
                No cover image
              </div>
            )}
            <div className="border-t border-border p-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {record.image_url ? (record.image_url.includes("supabase") ? "permanent storage" : "external URL — verify/re-host") : "missing image"} · {record.progression_level ?? "no level"} ·{" "}
              {record.session_minutes ? `${record.session_minutes} min` : "no duration"}
            </div>
          </Panel>

          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Muscle links ({links.length})
            </p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {links.length ? (
                links.map((link) => (
                  <li key={`${link.role}-${link.muscle_id}`} className="flex items-center gap-2">
                    <Tag tone={link.role === "tight" ? "ink" : "muted"}>{link.role}</Tag>
                    <span>{link.muscles?.name ?? link.muscle_id}</span>
                    {!link.muscles?.published && (
                      <span className="text-muted-foreground">(muscle unpublished)</span>
                    )}
                    <button type="button" onClick={() => void removeMuscle(link.muscle_id, link.role)} aria-label={`Remove ${link.muscles?.name ?? link.muscle_id}`} className="ml-auto rounded-sm border border-border p-1 hover:bg-secondary"><X className="h-3 w-3" /></button>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">No confident matches were linked.</li>
              )}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Fuzzy matches from the Notion import are never linked automatically — check the import
              preview if a relation looks missing.
            </p>
            <div className="mt-4 border-t border-border pt-4"><div className="flex gap-2"><select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as "tight" | "weak")} className="rounded-sm border border-border bg-background px-2 text-xs"><option value="tight">Overactive / restricted</option><option value="weak">Underactive / capacity</option></select><input value={muscleQuery} onChange={(event) => setMuscleQuery(event.target.value)} placeholder="Search muscle…" className="min-w-0 flex-1 rounded-sm border border-border bg-background px-3 py-2 text-xs" /></div>{muscleQuery.trim() && <div className="mt-2 max-h-48 overflow-y-auto border border-border">{muscles.filter((muscle) => `${muscle.name} ${muscle.anatomical_group}`.toLowerCase().includes(muscleQuery.toLowerCase())).slice(0, 12).map((muscle) => <button key={muscle.id} type="button" onClick={() => void addMuscle(muscle.id)} className="flex w-full items-center justify-between border-b border-border/60 px-3 py-2 text-left text-xs last:border-0 hover:bg-secondary"><span><strong>{muscle.name}</strong><span className="ml-2 text-muted-foreground">{muscle.anatomical_group}</span></span><Plus className="h-3.5 w-3.5" /></button>)}</div>}</div>
          </Panel>

          <Panel className="p-4"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Included with programs ({programLinks.length})</p><div className="mt-3 space-y-2">{programs.map((program) => { const linked = programLinks.some((link) => link.program_id === program.id); return <label key={program.id} className="flex cursor-pointer items-center gap-3 rounded-sm border border-border px-3 py-2 text-xs hover:bg-secondary"><input type="checkbox" checked={linked} onChange={() => void toggleProgram(program.id)} className="h-4 w-4 accent-lime" /><span className="flex-1 font-bold">{program.name}</span><Tag tone={program.published ? "accent" : "muted"}>{program.published ? "live" : "draft"}</Tag></label>; })}{!programs.length && <p className="text-xs text-muted-foreground">Create a program before linking this recipe.</p>}</div></Panel>

          <Panel className="p-4"><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Shown on posture pages ({guideLinks.length})</p><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Select every posture or condition guide where this recipe should appear. Only published guide + recipe pairs are public.</p><div className="mt-3 space-y-2">{guides.map((guide) => { const linked = guideLinks.some((link) => link.guide_id === guide.id); return <label key={guide.id} className="flex cursor-pointer items-center gap-3 rounded-sm border border-border px-3 py-2 text-xs hover:bg-secondary"><input type="checkbox" checked={linked} onChange={() => void toggleGuide(guide.id)} className="h-4 w-4 accent-lime" /><span className="flex-1"><strong className="block">{guide.title}</strong><span className="text-[10px] text-muted-foreground">/{guide.slug}</span></span><Tag tone={guide.published ? "accent" : "muted"}>{guide.published ? "live" : "draft"}</Tag></label>; })}{!guides.length && <p className="text-xs text-muted-foreground">No posture guides are available yet.</p>}</div></Panel>

          {record.notion_url && (
            <Panel className="p-4 text-xs">
              <a
                href={record.notion_url}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline"
              >
                Open source page in Notion
              </a>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

