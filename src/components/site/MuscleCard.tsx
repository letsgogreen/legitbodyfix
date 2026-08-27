import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Muscle } from "@/lib/muscles";

export function MuscleCard({ muscle }: { muscle: Muscle }) {
  const imagePosition = muscle.cardImagePosition ?? "50% 50%";
  const imageScale = muscle.cardImageScale ?? 1;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-sm border border-border bg-card">
      <Link
        to="/muscles/$muscleId"
        params={{ muscleId: muscle.id }}
        className="relative block aspect-[4/3] overflow-hidden bg-secondary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <img
          src={muscle.imageUrl}
          alt={muscle.imageAlt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ objectPosition: imagePosition, transform: `scale(${imageScale})` }}
        />
        <span className="absolute left-3 top-3 rounded-sm border border-ink bg-background/95 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em]">
          {muscle.group}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {muscle.family && (
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {muscle.family}
          </p>
        )}
        <h2 className="mt-2 text-xl font-extrabold leading-tight tracking-tight">{muscle.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {muscle.actions}
        </p>
        <Link
          to="/muscles/$muscleId"
          params={{ muscleId: muscle.id }}
          className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View anatomy <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
