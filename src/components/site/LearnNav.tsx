const sections = [
  ["regions", "/movement-check", "Body regions"],
  ["muscles", "/knowledge.html?type=muscles", "Muscle dictionary"],
  ["posture", "/recipes", "Posture"],
  ["conditions", "/conditions", "Conditions"],
] as const;

export function LearnNav({ active }: { active: (typeof sections)[number][0] }) {
  return (
    <nav className="border-b border-border bg-secondary/25" aria-label="Learn sections">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 lg:px-8">
        {sections.map(([id, href, label]) => (
          <a key={id} href={href} aria-current={active === id ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-sm border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 ${active === id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/50"}`}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
