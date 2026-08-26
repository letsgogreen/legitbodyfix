import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/ver1/admin/content")({
  head: () => ({
    meta: [
      { title: "Website content — LegitBodyFix Admin" },
      {
        name: "description",
        content: "Mock three-pane editor for homepage sections, fields and live preview.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContentView,
});

type Field = { label: string; value: string; multiline?: boolean };
type Section = { id: string; name: string; note: string; fields: Field[] };

const sections: Section[] = [
  {
    id: "hero",
    name: "Hero",
    note: "Above the fold",
    fields: [
      { label: "Headline", value: "Move better with a plan." },
      { label: "Subhead", value: "One region at a time. Checked, progressed, returned to real movement.", multiline: true },
      { label: "Primary CTA", value: "Find my starting point" },
      { label: "Secondary CTA", value: "Browse programs" },
    ],
  },
  {
    id: "regions",
    name: "Body regions",
    note: "6 entries",
    fields: [
      { label: "Section label", value: "Start where it hurts" },
      { label: "Region list", value: "Head & neck, Shoulder & arm, Spine & rib cage, Hip & pelvis, Knee, Ankle & foot", multiline: true },
    ],
  },
  {
    id: "programs",
    name: "Featured programs",
    note: "4 cards · all coming soon",
    fields: [
      { label: "Section label", value: "Programs" },
      { label: "Status note", value: "Coming soon — join the list to hear first." },
    ],
  },
  {
    id: "how",
    name: "How it works",
    note: "3 steps",
    fields: [
      { label: "Step 1", value: "Choose your focus" },
      { label: "Step 2", value: "Check your starting point" },
      { label: "Step 3", value: "Follow your program" },
    ],
  },
  {
    id: "cta",
    name: "Final CTA",
    note: "Single action",
    fields: [{ label: "Headline", value: "Find my starting point" }],
  },
  {
    id: "footer",
    name: "Footer",
    note: "Legal + links",
    fields: [
      {
        label: "Disclaimer",
        value: "Educational content only. Not a substitute for medical diagnosis or treatment.",
        multiline: true,
      },
    ],
  },
];

function ContentView() {
  const [activeId, setActiveId] = useState(sections[0]!.id);
  const active = sections.find((s) => s.id === activeId)!;

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead
        title="Website content"
        meta="Three-pane mock · edits are not saved"
        actions={
          <>
            <Btn>Discard</Btn>
            <Btn variant="ink" disabled>
              Publish (disabled)
            </Btn>
          </>
        }
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-[200px_1fr_1fr]">
        <Panel className="h-max">
          <p className="border-b border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Sections
          </p>
          <ul className="p-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={`w-full rounded-sm px-2.5 py-2 text-left text-sm font-medium transition-colors ${
                    s.id === activeId
                      ? "bg-ink text-ink-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {s.name}
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] opacity-70">
                    {s.note}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="h-max">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-bold">{active.name}</h2>
            <Tag>Draft</Tag>
          </div>
          <div className="space-y-4 p-4">
            {active.fields.map((f) => (
              <label key={f.label} className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {f.label}
                </span>
                {f.multiline ? (
                  <textarea
                    defaultValue={f.value}
                    rows={3}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    defaultValue={f.value}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                  />
                )}
              </label>
            ))}
          </div>
        </Panel>

        <Panel className="h-max">
          <p className="border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Preview · {active.name}
          </p>
          <div className="space-y-3 p-5">
            {active.fields.map((f, i) => (
              <p
                key={f.label}
                className={
                  i === 0
                    ? "text-2xl font-extrabold leading-tight tracking-tight"
                    : "text-sm text-muted-foreground"
                }
              >
                {f.value}
              </p>
            ))}
            <p className="pt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Static mock preview
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

