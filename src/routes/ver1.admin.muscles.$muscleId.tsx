import { type FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { PageHead, Panel } from "@/components/admin/AdminUI";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  findFixtureMuscle,
  getMuscleReadiness,
  muscleFromRow,
  type Muscle,
  type MuscleRow,
} from "@/lib/muscles";
import { getSupabaseClient } from "@/lib/supabase";

type EditableMuscle = Muscle & { version: number };

const ANATOMICAL_GROUPS = [
  "Head & neck",
  "Shoulder girdle",
  "Chest",
  "Upper back",
  "Deep back",
  "Abdomen",
  "Hip & pelvis",
  "Pelvic floor",
  "Upper arm",
  "Forearm & hand",
  "Anterior thigh",
  "Posterior thigh",
  "Lower leg",
  "Foot",
];
const BODY_REGIONS = [
  "head-neck",
  "shoulder-girdle",
  "chest",
  "upper-back",
  "deep-back",
  "abdomen",
  "hip-pelvis",
  "pelvic-floor",
  "upper-arm",
  "forearm-hand",
  "anterior-thigh",
  "posterior-thigh",
  "lower-leg",
  "foot",
];
const FUNCTION_TAGS = [
  "Flexion",
  "Extension",
  "Abduction",
  "Adduction",
  "Internal rotation",
  "External rotation",
  "Lateral flexion",
  "Scapular elevation",
  "Scapular depression",
  "Scapular protraction",
  "Scapular retraction",
  "Scapular upward rotation",
  "Scapular downward rotation",
  "Stabilization",
  "Inspiration",
  "Expiration",
];

export const Route = createFileRoute("/ver1/admin/muscles/$muscleId")({
  loader: ({ params }) => {
    // The database is the source of truth; the fixture is only a first-paint fallback.
    return (
      findFixtureMuscle(params.muscleId) ?? {
        id: params.muscleId,
        title: params.muscleId,
        group: "Unassigned",
        origin: "",
        insertion: "",
        actions: "",
        imageUrl: "",
        imageAlt: "",
        imageCredit: "",
        imageCreditUrl: "",
        sourceName: "",
        sourceUrl: "",
        relatedVideoIds: "",
        published: false,
      }
    );
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Muscle"} — LegitBodyFix Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MuscleEditor,
});

function MuscleEditor() {
  const fallback = Route.useLoaderData();
  const [record, setRecord] = useState<EditableMuscle>({ ...fallback, version: 1 });
  const [status, setStatus] = useState("Loading database record…");
  const [saving, setSaving] = useState(false);
  const [relationshipCounts, setRelationshipCounts] = useState({ guides: 0, recipes: 0 });

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setStatus("Supabase is not configured. Editing is locked.");
      return;
    }

    void Promise.all([
      client.from("muscles").select("*").eq("id", fallback.id).single(),
      client
        .from("guide_muscles")
        .select("guide_id", { count: "exact", head: true })
        .eq("muscle_id", fallback.id),
      client
        .from("recipe_muscles")
        .select("recipe_id", { count: "exact", head: true })
        .eq("muscle_id", fallback.id),
    ]).then(([{ data, error }, guideResult, recipeResult]) => {
      if (error || !data) {
        setStatus("Database record unavailable. Run the verified muscle import first.");
        return;
      }
      setRecord(fromDatabase(data));
      setRelationshipCounts({
        guides: guideResult.count ?? 0,
        recipes: recipeResult.count ?? 0,
      });
      setStatus(`Version ${data.version} loaded from Supabase.`);
    });
  }, [fallback.id]);

  function setField<K extends keyof EditableMuscle>(field: K, value: EditableMuscle[K]) {
    setRecord((current) => ({ ...current, [field]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;

    setSaving(true);
    setStatus("Saving…");
    const { data, error } = await client
      .from("muscles")
      .update(toDatabase(record))
      .eq("id", record.id)
      .eq("version", record.version)
      .select("*")
      .single();
    setSaving(false);

    if (error || !data) {
      setStatus("Save failed or the record changed elsewhere. Reload before trying again.");
      return;
    }

    setRecord(fromDatabase(data));
    setStatus(`Saved as version ${data.version}. The previous version is preserved.`);
  }

  const canSave = status.includes("loaded") || status.startsWith("Saved as version");
  const readiness = getMuscleReadiness(record);

  return (
    <form onSubmit={save} className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead
        title={record.title}
        meta={`${record.group} · version ${record.version}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/ver1/admin/muscles"
              className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Library
            </Link>
            <Link
              to="/muscles/$muscleId"
              params={{ muscleId: record.id }}
              target="_blank"
              className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-bold"
            >
              Public page <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              type="submit"
              disabled={!canSave || saving}
              className="inline-flex min-h-10 items-center gap-2 rounded-sm bg-ink px-4 py-2 text-xs font-bold text-ink-foreground disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        }
      />

      <p className="mt-4 rounded-sm border border-border bg-secondary/50 px-4 py-3 text-sm">
        {status}
      </p>

      <Panel className="mt-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Publication readiness
            </p>
            <p className="mt-1 text-lg font-extrabold">{readiness.label}</p>
          </div>
          {readiness.issues.length > 0 ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Complete or approve: {readiness.issues.join(", ")}.
            </p>
          ) : (
            <p className="text-sm font-bold">All required fields are ready for final review.</p>
          )}
        </div>
      </Panel>

      <Panel className="mt-4 grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Content relationships
          </p>
          <p className="mt-2 text-sm leading-6">
            Connected to <strong>{relationshipCounts.guides} guides</strong> and{" "}
            <strong>{relationshipCounts.recipes} recipes</strong>. Published connections appear
            automatically on this muscle's public page; programs inherit through those links.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/ver1/admin/guides"
            className="inline-flex min-h-10 items-center rounded-sm border border-border px-3 text-xs font-bold"
          >
            Manage guides
          </Link>
          <Link
            to="/ver1/admin/recipes"
            className="inline-flex min-h-10 items-center rounded-sm border border-border px-3 text-xs font-bold"
          >
            Manage recipes
          </Link>
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.2fr)]">
        <Panel className="overflow-hidden lg:sticky lg:top-5 lg:self-start">
          <div className="grid min-h-[24rem] place-items-center bg-white p-5">
            <img
              src={record.imageUrl}
              alt={record.imageAlt}
              referrerPolicy="no-referrer"
              className="max-h-[32rem] w-full object-contain"
            />
          </div>
          <div className="space-y-4 border-t border-border p-4">
            <ImageUploadField
              value={record.imageUrl}
              alt={record.imageAlt}
              folder={`muscles/${record.id}`}
              label="Muscle image"
              onChange={(v) => {
                setField("imageUrl", v);
                setField("imageStatus", "pending");
              }}
              onAltChange={(v) => setField("imageAlt", v)}
            />
            <Field
              label="Image credit"
              value={record.imageCredit}
              onChange={(v) => setField("imageCredit", v)}
            />
            <Field
              label="Image credit URL"
              value={record.imageCreditUrl}
              onChange={(v) => setField("imageCreditUrl", v)}
            />
            <SelectField
              label="Image review"
              value={record.imageStatus ?? "pending"}
              onChange={(v) => setField("imageStatus", v)}
              options={[
                ["pending", "Pending review"],
                ["approved", "Approved"],
                ["replacement_requested", "Replacement requested"],
                ["missing", "Missing"],
              ]}
            />
          </div>
        </Panel>

        <Panel className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Muscle name" value={record.title} onChange={(v) => setField("title", v)} />
          <Field
            label="Anatomical group"
            value={record.group}
            onChange={(v) => setField("group", v)}
            suggestions={ANATOMICAL_GROUPS}
          />
          <Field
            label="Family"
            value={record.family ?? ""}
            onChange={(v) => setField("family", v)}
          />
          <Field
            label="Body map region"
            value={record.bodyMap ?? ""}
            onChange={(v) => setField("bodyMap", v)}
            suggestions={BODY_REGIONS}
          />
          <TextArea label="Origin" value={record.origin} onChange={(v) => setField("origin", v)} />
          <TextArea
            label="Insertion"
            value={record.insertion}
            onChange={(v) => setField("insertion", v)}
          />
          <div className="sm:col-span-2">
            <div className="mb-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em]">
                Quick function classification
              </p>
              <div className="flex flex-wrap gap-2">
                {FUNCTION_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const current = record.actions.trim();
                      if (!current.toLowerCase().includes(tag.toLowerCase()))
                        setField("actions", current ? `${current}; ${tag}` : tag);
                    }}
                    className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium hover:border-foreground"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Use canonical labels first, then add anatomy-specific detail below.
              </p>
            </div>
            <TextArea
              label="Functions and actions"
              value={record.actions}
              onChange={(v) => setField("actions", v)}
            />
          </div>
          <Field
            label="Anatomy source name"
            value={record.sourceName}
            onChange={(v) => setField("sourceName", v)}
          />
          <Field
            label="Anatomy source URL"
            value={record.sourceUrl}
            onChange={(v) => setField("sourceUrl", v)}
          />
          <SelectField
            label="Content review"
            value={record.reviewStatus ?? "draft"}
            onChange={(v) => setField("reviewStatus", v)}
            options={[
              ["draft", "Draft"],
              ["needs_data_review", "Needs data review"],
              ["needs_image_review", "Needs image review"],
              ["needs_anatomy_review", "Needs anatomy review"],
              ["ready_to_publish", "Ready to publish"],
              ["published", "Published"],
              ["archived", "Archived"],
            ]}
          />
          <label className="flex min-h-11 items-center gap-3 rounded-sm border border-border px-3 text-sm font-bold sm:col-span-2">
            <input
              type="checkbox"
              checked={record.published}
              disabled={!record.published && readiness.key !== "ready"}
              onChange={(event) => setField("published", event.target.checked)}
              className="h-4 w-4 disabled:opacity-40"
            />
            {readiness.key === "ready" || record.published
              ? "Published on the public muscle library"
              : "Complete the readiness checklist before publishing"}
          </label>
        </Panel>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  suggestions,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
}) {
  const listId = suggestions
    ? `options-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : undefined;
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.1em]">
      {label}
      <input
        value={value}
        list={listId}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-sm border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal"
      />
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
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
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.1em]">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="resize-y rounded-sm border border-border bg-background px-3 py-2 text-sm font-normal leading-6 normal-case tracking-normal"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.1em]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-sm border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function fromDatabase(row: Record<string, unknown>): EditableMuscle {
  const base = muscleFromRow(row as unknown as MuscleRow);
  return { ...base, version: Number(row["version"] ?? 1) };
}

function toDatabase(record: EditableMuscle) {
  return {
    name: record.title,
    anatomical_group: record.group,
    muscle_family: record.family || null,
    origin: record.origin,
    insertion: record.insertion,
    description: record.actions,
    image_url: record.imageUrl,
    image_alt: record.imageAlt,
    image_credit: record.imageCredit,
    image_source_url: record.imageCreditUrl || null,
    source_name: record.sourceName,
    source_url: record.sourceUrl,
    body_map: record.bodyMap || null,
    review_status: record.reviewStatus ?? "draft",
    image_status: record.imageStatus ?? "pending",
    published: record.published,
  };
}
