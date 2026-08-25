import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Btn, PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { programs, type Program } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/programs")({
  head: () => ({
    meta: [
      { title: "Programs — LegitBodyFix Admin" },
      { name: "description", content: "Mock list of LegitBodyFix programs with status and price." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProgramsView,
});

function ProgramsView() {
  const [editing, setEditing] = useState<Program | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead
        title="Programs"
        meta={`${programs.length} programs · mock data`}
        actions={<Btn variant="ink">New program</Btn>}
      />

      <Panel className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr>
              <Th>Program</Th>
              <Th>Region</Th>
              <Th className="text-right">Price</Th>
              <Th className="text-right">Lessons</Th>
              <Th>Status</Th>
              <Th>Updated</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/50">
                <Td className="font-medium">{p.title}</Td>
                <Td className="text-muted-foreground">{p.region}</Td>
                <Td className="text-right font-mono text-xs">${p.price}</Td>
                <Td className="text-right font-mono text-xs">{p.lessons}</Td>
                <Td>
                  <Tag tone={p.status === "Live" ? "accent" : "muted"}>{p.status}</Tag>
                </Td>
                <Td className="font-mono text-xs text-muted-foreground">{p.updated}</Td>
                <Td className="text-right">
                  <Btn onClick={() => setEditing(p)}>Edit</Btn>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {editing && <ProgramDrawer program={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProgramDrawer({ program, onClose }: { program: Program; onClose: () => void }) {
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const touch = () => {
    setDirty(true);
    setSaved(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true">
      <div className="flex h-full w-full max-w-lg flex-col border-l border-border bg-background">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Editing program
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight">{program.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-sm border border-border p-1.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <Field label="Title" defaultValue={program.title} onChange={touch} />
          <Field label="Body region" defaultValue={program.region} onChange={touch} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="List price (mock, USD)" defaultValue={String(program.price)} onChange={touch} />
            <div>
              <Label>Status</Label>
              <select
                defaultValue={program.status}
                onChange={touch}
                className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"
              >
                <option>Coming soon</option>
                <option>Live</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Short description</Label>
            <textarea
              rows={4}
              onChange={touch}
              defaultValue="A staged progression for one region: check where you are, restore the missing range, then load it back into real movement."
              className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"
            />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Price shown here is catalog copy only — it does not touch any payment system.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {dirty ? "Unsaved changes" : saved ? "Saved" : "No changes"}
          </span>
          <div className="flex gap-2">
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn
              variant="ink"
              disabled={!dirty}
              onClick={() => {
                setDirty(false);
                setSaved(true);
              }}
            >
              Save changes
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

function Field({
  label,
  defaultValue,
  onChange,
}: {
  label: string;
  defaultValue: string;
  onChange: () => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        defaultValue={defaultValue}
        onChange={onChange}
        className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm"
      />
    </div>
  );
}
