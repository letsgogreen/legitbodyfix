const sections = [
  ["regions", "/movement-check", "Body regions"],
  ["muscles", "/knowledge.html?type=muscles", "Muscle dictionary"],
  ["posture", "/recipes", "Posture"],
  ["conditions", "/conditions", "Conditions"],
] as const;

export function LearnNav({ active }: { active: (typeof sections)[number][0] }) {
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = tabs.current;
    const selected = container?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!container || !selected) return;
    const bounds = container.getBoundingClientRect();
    const target = selected.getBoundingClientRect();
    if (target.right > bounds.right || target.left < bounds.left) {
      container.scrollLeft += target.left - bounds.left - 20;
    }
  }, [active]);
  return (
    <nav className="border-b border-border bg-secondary/25" aria-label="Learn sections">
      <div ref={tabs} className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 lg:px-8">
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
import { useEffect, useRef } from "react";
