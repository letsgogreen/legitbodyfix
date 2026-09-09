import { Link } from "@tanstack/react-router";
import { bodyRegions, findBodyRegion } from "@/data/body-regions";

export function LearnRegionFilter({ region, to, noun }: { region?: string | undefined; to: "/recipes" | "/conditions"; noun: string }) {
  const activeRegion = findBodyRegion(region);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Filter by body region</p>
          <h2 className="mt-2 text-xl font-extrabold">{activeRegion ? `${activeRegion.title} ${noun}` : "Explore every region"}</h2>
        </div>
        {activeRegion ? <Link to={to} search={{ region: undefined }} className="inline-flex min-h-11 items-center text-xs font-bold underline underline-offset-4">Clear region</Link> : null}
      </div>
      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-wrap lg:px-0" aria-label={`Filter ${noun} by body region`}>
        <Link to={to} search={{ region: undefined }} aria-current={!activeRegion ? "page" : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-sm border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wide ${!activeRegion ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}>All regions</Link>
        {bodyRegions.map((item) => <Link key={item.slug} to={to} search={{ region: item.slug }} aria-current={activeRegion?.slug === item.slug ? "page" : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-sm border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wide ${activeRegion?.slug === item.slug ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}>{item.title}</Link>)}
      </div>
    </div>
  );
}
