import { programs } from "@/data/programs";

export function FeaturedPrograms() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {programs.map((program) => (
        <article
          key={program.id}
          className="flex min-w-0 flex-col rounded-sm border border-border bg-card p-6 sm:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Guided program
            </span>
            <span className="rounded-sm border border-foreground px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
              Coming soon
            </span>
          </div>
          <h3 className="mt-8 text-2xl font-extrabold leading-tight">{program.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {program.description}
          </p>
          <p className="mt-8 border-t border-border pt-5 font-mono text-lg font-bold">
            {program.displayPrice}
          </p>
        </article>
      ))}
    </div>
  );
}
