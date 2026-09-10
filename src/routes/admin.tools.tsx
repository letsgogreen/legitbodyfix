import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, FileInput, Waypoints } from "lucide-react";
import { PageHead, Panel, Tag } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/tools")({
  head: () => ({
    meta: [
      { title: "Advanced tools — LegitBodyFix Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdvancedTools,
});

const tools = [
  {
    to: "/admin/recipes/import",
    title: "Import movement content",
    description: "Preview Notion records and bring them in as unpublished drafts.",
    label: "Notion import",
    icon: FileInput,
  },
  {
    to: "/admin/muscles/import",
    title: "Import muscle records",
    description: "Bulk-create anatomy records for manual review and publication.",
    label: "Bulk import",
    icon: Database,
  },
  {
    to: "/admin/guides",
    title: "Review legacy guide links",
    description: "Maintain old guide relationships while canonical content is migrated to recipes.",
    label: "Legacy",
    icon: Waypoints,
  },
] as const;

function AdvancedTools() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead
        title="Advanced tools"
        meta="Imports, migration, and legacy maintenance"
      />
      <Panel className="mt-5 border-l-4 border-l-accent p-4">
        <p className="text-sm font-bold">Use these only when the normal editor is not enough.</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Imports create reviewable drafts. They do not replace published content automatically.
        </p>
      </Panel>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="group flex min-h-52 flex-col border border-border bg-card p-5 transition-colors hover:border-foreground hover:bg-secondary/30 focus-visible:outline focus-visible:outline-2"
          >
            <div className="flex items-start justify-between gap-3">
              <tool.icon className="h-5 w-5" aria-hidden="true" />
              <Tag>{tool.label}</Tag>
            </div>
            <h2 className="mt-6 text-lg font-extrabold tracking-tight group-hover:underline">
              {tool.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
            <p className="mt-auto pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Open tool →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
