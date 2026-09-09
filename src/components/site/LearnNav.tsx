import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const sections = [
  ["regions", "/movement-check", "Body regions"],
  ["muscles", "/knowledge.html?type=muscles", "Muscle dictionary"],
  ["posture", "/recipes", "Posture & movement"],
  ["conditions", "/conditions", "Conditions"],
] as const;

const muscleRegions: Record<string, string> = {
  "head-neck": "head-neck",
  "shoulder-arm": "shoulder-scapula",
  "spine-rib-cage": "thoracic-spine",
  "hip-pelvis": "pelvis-hip",
  knee: "knee",
  "ankle-foot": "foot-ankle",
};

export function LearnNav({ active, region }: { active: (typeof sections)[number][0]; region?: string | undefined }) {
  const regionSearch = region ? { region } : {};
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

  const tabClass = (id: (typeof sections)[number][0]) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-sm border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 ${active === id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/50"}`;

  return (
    <nav className="border-b border-border bg-secondary/25" aria-label="Learn sections">
      <div ref={tabs} className="mx-auto flex max-w-7xl snap-x gap-2 overflow-x-auto overscroll-x-contain px-5 py-3 lg:px-8">
        {sections.map(([id, href, label]) => id === "muscles" ? (
          <a key={id} href={`${href}${region && muscleRegions[region] ? `&region=${muscleRegions[region]}` : ""}`} aria-current={active === id ? "page" : undefined} className={`${tabClass(id)} snap-start`}>
            {label}
          </a>
        ) : id === "regions" ? (
          <Link key={id} to="/movement-check" search={regionSearch} preload="intent" aria-current={active === id ? "page" : undefined} className={`${tabClass(id)} snap-start`}>{label}</Link>
        ) : id === "posture" ? (
          <Link key={id} to="/recipes" search={{ region }} preload="intent" aria-current={active === id ? "page" : undefined} className={`${tabClass(id)} snap-start`}>{label}</Link>
        ) : (
          <Link key={id} to="/conditions" search={{ region }} preload="intent" aria-current={active === id ? "page" : undefined} className={`${tabClass(id)} snap-start`}>{label}</Link>
        ))}
      </div>
    </nav>
  );
}
