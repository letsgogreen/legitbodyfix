import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { bodyRegions } from "@/data/body-regions";

export function BodyRegionGrid() {
  return (
    <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {bodyRegions.map((region) => (
        <Link
          key={region.slug}
          to="/movement-check"
          search={{ region: region.slug }}
          className="group min-w-0 bg-card p-6 outline-none transition-colors hover:bg-secondary focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold">{region.title}</h3>
            <ArrowRight
              className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{region.description}</p>
        </Link>
      ))}
    </div>
  );
}
