import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import { lessons, programs } from "@/lib/admin-mock";

export const Route = createFileRoute("/ver1/admin/lessons")({
  head: () => ({
    meta: [
      { title: "Lessons & videos — LegitBodyFix Admin" },
      { name: "description", content: "Mock lesson list grouped by module with duration and status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LessonsView,
});

function LessonsView() {
  const [programId, setProgramId] = useState(programs[0]!.id);
  const list = lessons.filter((l) => l.programId === programId);
  const modules = [...new Set(list.map((l) => l.module))];

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead
        title="Lessons & videos"
        meta="Placeholder thumbnails · no upload or playback"
        actions={<Btn variant="ink">Add lesson</Btn>}
      />

      <div className="mt-5 flex flex-wrap gap-2">
        {programs.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProgramId(p.id)}
            className={`rounded-sm border px-3 py-1.5 text-xs font-bold transition-colors ${
              p.id === programId
                ? "border-ink bg-ink text-ink-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        {modules.map((m) => (
          <Panel key={m}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em]">{m}</h2>
              <span className="font-mono text-[11px] text-muted-foreground">
                {list.filter((l) => l.module === m).length} lessons
              </span>
            </div>
            <ul className="divide-y divide-border/70">
              {list
                .filter((l) => l.module === m)
                .map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-secondary/50">
                    <div className="grid h-12 w-20 shrink-0 place-items-center rounded-sm border border-border bg-secondary">
                      <Play className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-40 flex-1">
                      <p className="text-sm font-medium">
                        <span className="font-mono text-xs text-muted-foreground">
                          {String(l.index).padStart(2, "0")}
                        </span>{" "}
                        {l.title}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">{l.duration} · mp4 placeholder</p>
                    </div>
                    <Tag tone={l.status === "Published" ? "accent" : "muted"}>{l.status}</Tag>
                    <Btn>Edit</Btn>
                  </li>
                ))}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}

