import type { LearningContent } from "@/lib/learning-content";

export function LearningContentEditor({
  value,
  onChange,
}: {
  value: LearningContent;
  onChange: (value: LearningContent) => void;
}) {
  const update = <K extends keyof LearningContent>(key: K, next: LearningContent[K]) =>
    onChange({ ...value, [key]: next });
  const lines = (text: string) =>
    text
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  return (
    <section className="border border-border bg-card">
      <div className="border-b border-border px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">
          Customer learning page
        </p>
        <h3 className="mt-1 text-base font-extrabold">What customers see after purchase</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Edit in the same order as the live learning page. Changes appear after you save the
          program.
        </p>
      </div>
      <div className="space-y-6 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Section label"
            value={value.eyebrow}
            onChange={(next) => update("eyebrow", next)}
          />
          <Field
            label="Main heading"
            value={value.title}
            onChange={(next) => update("title", next)}
          />
        </div>
        <TextArea
          label="Introduction"
          value={value.introduction}
          onChange={(next) => update("introduction", next)}
        />
        <EditorGroup title="Key ideas" description="Three ideas shown side by side on desktop.">
          {value.principles.map((item, index) => (
            <div key={index} className="grid gap-2 border border-border bg-background p-3">
              <Field
                label={`Idea ${index + 1} heading`}
                value={item.title}
                onChange={(next) =>
                  update(
                    "principles",
                    value.principles.map((entry, itemIndex) =>
                      itemIndex === index ? { ...entry, title: next } : entry,
                    ),
                  )
                }
              />
              <TextArea
                label="Explanation"
                value={item.body}
                onChange={(next) =>
                  update(
                    "principles",
                    value.principles.map((entry, itemIndex) =>
                      itemIndex === index ? { ...entry, body: next } : entry,
                    ),
                  )
                }
              />
            </div>
          ))}
        </EditorGroup>
        <TextArea
          label="Baseline checks — one item per line"
          value={value.checks.join("\n")}
          onChange={(next) => update("checks", lines(next))}
          rows={5}
        />
        <EditorGroup
          title="Practice sequence"
          description="The four-step path displayed below the baseline check."
        >
          {value.routine.map((item, index) => (
            <div
              key={item.step}
              className="grid gap-2 border border-border bg-background p-3 sm:grid-cols-[5rem_1fr]"
            >
              <Field
                label="Step"
                value={item.step}
                onChange={(next) =>
                  update(
                    "routine",
                    value.routine.map((entry, itemIndex) =>
                      itemIndex === index ? { ...entry, step: next } : entry,
                    ),
                  )
                }
              />
              <Field
                label="Heading"
                value={item.title}
                onChange={(next) =>
                  update(
                    "routine",
                    value.routine.map((entry, itemIndex) =>
                      itemIndex === index ? { ...entry, title: next } : entry,
                    ),
                  )
                }
              />
              <div className="sm:col-span-2">
                <TextArea
                  label="Explanation"
                  value={item.body}
                  onChange={(next) =>
                    update(
                      "routine",
                      value.routine.map((entry, itemIndex) =>
                        itemIndex === index ? { ...entry, body: next } : entry,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </EditorGroup>
        <TextArea
          label="Daily application — one item per line"
          value={value.habits.join("\n")}
          onChange={(next) => update("habits", lines(next))}
          rows={5}
        />
        <TextArea
          label="Safety notice"
          value={value.safety}
          onChange={(next) => update("safety", next)}
          rows={4}
        />
      </div>
    </section>
  );
}

function EditorGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-extrabold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">
      {children}
    </span>
  );
}
function Field({
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
      <input
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
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm leading-6"
      />
    </label>
  );
}
