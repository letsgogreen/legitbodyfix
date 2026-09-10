import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileDown, Plus, Search } from "lucide-react";
import { AdminLoadingState, Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import { detectKoreanText } from "@/lib/recipe-import";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/recipes/")({
  head: () => ({
    meta: [
      { title: "Postures — LegitBodyFix Admin" },
      {
        name: "description",
        content: "Manage posture guidance and corrective exercise content from one workspace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRecipes,
});

type Row = {
  id: string;
  title: string;
  slug: string;
  goal: string | null;
  summary: string | null;
  instructions: string | null;
  assessment_clues: string | null;
  dosage: string | null;
  safety_notes: string | null;
  evidence: string | null;
  image_url: string | null;
  regions: string[];
  progression_level: string | null;
  review_status: string;
  published: boolean;
  updated_at: string;
};

export function koreanFieldsOf(row: {
  title: string;
  goal: string | null;
  summary: string | null;
  instructions: string | null;
  safety_notes: string | null;
}) {
  return detectKoreanText({
    title: row.title,
    goal: row.goal,
    summary: row.summary,
    instructions: row.instructions,
    safety_notes: row.safety_notes,
  });
}

function AdminRecipes() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [publication, setPublication] = useState<"all" | "published" | "draft">("all");
  const [completion, setCompletion] = useState<"all" | "complete" | "incomplete">("all");
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");

  useEffect(() => {
    void supabase
      .from("recipes")
      .select(
        "id, title, slug, goal, summary, instructions, assessment_clues, dosage, safety_notes, evidence, image_url, regions, progression_level, review_status, published, updated_at",
      )
      .order("title")
      .then(({ data, error }) => {
        if (error) {
          setState(`Could not load recipes: ${error.message}`);
          setLoading(false);
          return;
        }
        setRows((data ?? []) as Row[]);
        setLoading(false);
      });
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !q || row.title.toLowerCase().includes(q) || row.slug.toLowerCase().includes(q) || row.regions.some((region) => region.includes(q));
      const matchesPublication = publication === "all" || (publication === "published" ? row.published : !row.published);
      const issueCount = missingFields(row).length + (koreanFieldsOf(row).length ? 1 : 0);
      const matchesCompletion = completion === "all" || (completion === "complete" ? issueCount === 0 : issueCount > 0);
      return matchesQuery && matchesPublication && matchesCompletion;
    });
  }, [rows, query, publication, completion]);

  const publishedCount = rows.filter((row) => row.published).length;
  const incompleteCount = rows.filter((row) => missingFields(row).length > 0 || koreanFieldsOf(row).length > 0).length;

  async function createRecipe() {
    const suffix = Date.now().toString(36);
    const { data, error } = await supabase
      .from("recipes")
      .insert({ title: "Untitled recipe", slug: `untitled-recipe-${suffix}`, review_status: "draft" })
      .select("id")
      .single();
    if (error || !data) { setState(`Could not create recipe: ${error?.message ?? "unknown error"}`); return; }
    await navigate({ to: "/admin/recipes/$recipeId", params: { recipeId: data.id } });
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead
        title="Postures"
        meta={loading ? "Loading postures…" : `${publishedCount} published · ${rows.length - publishedCount} in review · postures are the canonical content type`}
        actions={
          <><Btn variant="ink" onClick={() => void createRecipe()}><Plus className="h-3.5 w-3.5" /> New content</Btn><Link
            to="/admin/recipes/scrape"
            className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border bg-accent px-3 py-2 text-xs font-bold text-accent-foreground"
          >
            <FileDown className="h-3.5 w-3.5" aria-hidden="true" /> Collect sources
          </Link></>
        }
      />

      <Panel className="mt-5 border-l-4 border-l-accent p-4">
        <p className="text-sm font-bold">One movement-content workflow</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Create posture guidance and corrective exercises here as recipes. Import and migration
          utilities are kept under Advanced tools so this library stays focused on daily editing.
        </p>
      </Panel>

      <Panel className="mt-4 flex flex-wrap items-center gap-3 p-4">
        <label className="relative flex-1 min-w-56">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, slug, or body region"
            className="w-full rounded-sm border border-border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </label>
        <select value={publication} onChange={(event) => setPublication(event.target.value as typeof publication)} className="min-h-10 rounded-sm border border-border bg-background px-3 text-xs font-bold"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option></select>
        <select value={completion} onChange={(event) => setCompletion(event.target.value as typeof completion)} className="min-h-10 rounded-sm border border-border bg-background px-3 text-xs font-bold"><option value="all">All completeness</option><option value="incomplete">Needs work</option><option value="complete">Complete</option></select>
      </Panel>

      <div className="my-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold">Posture library</h2>{loading ? <div className="mt-2 h-4 w-72 animate-pulse bg-secondary" aria-hidden="true" /> : <p className="mt-1 text-sm text-muted-foreground">{rows.length} total · {publishedCount} published · {rows.length - publishedCount} drafts · {incompleteCount} need work</p>}</div>{!loading && <p className="text-sm text-muted-foreground">{visible.length} shown</p>}</div>

      {loading ? <AdminLoadingState label="Loading postures" rows={6} /> : state ? <Panel className="border-l-4 border-l-destructive p-5 text-sm">{state}</Panel> : visible.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.map((row) => {
          const missing = missingFields(row);
          const korean = koreanFieldsOf(row);
          const issueCount = missing.length + (korean.length ? 1 : 0);
          return <Link key={row.id} to="/admin/recipes/$recipeId" params={{ recipeId: row.id }} className="group flex min-h-52 flex-col border border-border bg-card p-5 transition hover:border-foreground hover:bg-secondary/30 focus-visible:outline focus-visible:outline-2">
            <div className="flex items-start justify-between gap-3"><Tag tone={row.published ? "accent" : "muted"}>{row.published ? "Published" : "Draft"}</Tag>{issueCount > 0 ? <Tag tone="warn">{issueCount} {issueCount === 1 ? "issue" : "issues"}</Tag> : <Tag tone="accent">Complete</Tag>}</div>
            <h3 className="mt-5 text-lg font-bold leading-tight group-hover:underline">{row.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{row.regions.join(" · ") || "No body region"}{row.progression_level ? ` · ${row.progression_level.replaceAll("_", " ")}` : ""}</p>
            {missing.length > 0 && <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">Missing: {missing.join(", ")}</p>}
            {korean.length > 0 && <p className="mt-1 text-xs text-destructive">Korean text needs review</p>}
            <p className="mt-auto pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Open editor →</p>
          </Link>;
        })}</div>
      ) : <div className="border border-dashed border-border px-5 py-14 text-center"><h3 className="font-bold">No matching postures</h3><p className="mt-2 text-sm text-muted-foreground">Try a different search or filter.</p><button type="button" onClick={() => { setQuery(""); setPublication("all"); setCompletion("all"); }} className="mt-4 min-h-11 border border-border px-4 font-bold">Clear filters</button></div>}
    </div>
  );
}

function missingFields(row: Row) {
  return [
    ["goal", row.goal], ["summary", row.summary], ["instructions", row.instructions],
    ["assessment", row.assessment_clues], ["dosage", row.dosage], ["safety", row.safety_notes],
    ["evidence", row.evidence], ["body region", row.regions.length ? "set" : ""],
  ].filter(([, value]) => !value?.trim()).map(([label]) => label);
}

