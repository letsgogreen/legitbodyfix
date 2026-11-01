import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import { getRecipeLibraryLeads } from "@/lib/admin-recipe-library-leads.functions";

type Lead = { id: string; email: string; created_at: string; updated_at: string; source_path: string };

export const Route = createFileRoute("/admin/recipe-library-leads")({
  head: () => ({ meta: [{ title: "Recipe library leads — LegitBodyFix Admin" }, { name: "robots", content: "noindex" }] }),
  component: RecipeLibraryLeadsPage,
});

function RecipeLibraryLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    void getRecipeLibraryLeads()
      .then(({ leads: rows }) => setLeads(rows))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load leads."))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHead title="Recipe library leads" meta={loading ? "Loading email captures" : `${leads.length} unique email captures`} />
      {error ? <Panel className="mt-6 border-destructive p-4 text-sm text-destructive">{error}</Panel> : null}
      {!error && !loading && leads.length === 0 ? <Panel className="mt-6 p-8 text-center text-sm text-muted-foreground">No recipe-library emails have been captured yet.</Panel> : null}
      <div className="mt-6 space-y-3">
        {leads.map((lead) => (
          <Panel key={lead.id} className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
            <p className="min-w-0 flex-1 break-all text-sm font-bold">{lead.email}</p>
            <Tag>{lead.source_path}</Tag>
            <time className="text-xs text-muted-foreground" dateTime={lead.updated_at}>Last opened {new Date(lead.updated_at).toLocaleString()}</time>
          </Panel>
        ))}
      </div>
    </div>
  );
}
