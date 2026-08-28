import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileUp, Plus, Search } from "lucide-react";
import { Btn, PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { detectKoreanText } from "@/lib/recipe-import";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/recipes/")({
  head: () => ({
    meta: [
      { title: "Recipe library — LegitBodyFix Admin" },
      {
        name: "description",
        content: "Review imported corrective exercise recipes and publish them one by one.",
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
  safety_notes: string | null;
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
  const [state, setState] = useState("Loading recipes…");

  useEffect(() => {
    void supabase
      .from("recipes")
      .select(
        "id, title, slug, goal, summary, instructions, safety_notes, regions, progression_level, review_status, published, updated_at",
      )
      .order("title")
      .then(({ data, error }) => {
        if (error) {
          setState(`Could not load recipes: ${error.message}`);
          return;
        }
        setRows((data ?? []) as Row[]);
        setState(`${data?.length ?? 0} recipe(s) in the database.`);
      });
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) => row.title.toLowerCase().includes(q) || row.slug.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const publishedCount = rows.filter((row) => row.published).length;

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
        title="Recipe library"
        meta={`${publishedCount} published · ${rows.length - publishedCount} in review`}
        actions={
          <><Btn variant="ink" onClick={() => void createRecipe()}><Plus className="h-3.5 w-3.5" /> New recipe</Btn><Link
            to="/admin/recipes/import"
            className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-xs font-bold"
          >
            <FileUp className="h-3.5 w-3.5" aria-hidden="true" /> Notion import
          </Link></>
        }
      />

      <Panel className="mt-5 flex flex-wrap items-center gap-3 p-4">
        <label className="relative flex-1 min-w-56">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title or slug"
            className="w-full rounded-sm border border-border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </label>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {state}
        </span>
      </Panel>

      <Panel className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr>
              <Th>Recipe</Th>
              <Th>Status</Th>
              <Th>Regions</Th>
              <Th>Level</Th>
              <Th>Flags</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const korean = koreanFieldsOf(row);
              return (
                <tr key={row.id}>
                  <Td>
                    <span className="font-semibold">{row.title}</span>
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      {row.slug}
                    </span>
                  </Td>
                  <Td>
                    <Tag tone={row.published ? "accent" : "muted"}>
                      {row.published ? "published" : row.review_status}
                    </Tag>
                  </Td>
                  <Td className="text-xs">{row.regions.join(" · ") || "—"}</Td>
                  <Td className="text-xs">{row.progression_level ?? "—"}</Td>
                  <Td className="text-xs">
                    {korean.length ? <Tag tone="warn">Korean text</Tag> : "—"}
                  </Td>
                  <Td>
                    <Link
                      to="/admin/recipes/$recipeId"
                      params={{ recipeId: row.id }}
                      className="inline-flex min-h-8 items-center rounded-sm border border-border px-2.5 py-1 text-xs font-bold"
                    >
                      Review
                    </Link>
                  </Td>
                </tr>
              );
            })}
            {!visible.length && (
              <tr>
                <Td colSpan={6} className="text-xs text-muted-foreground">
                  No recipes match.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

