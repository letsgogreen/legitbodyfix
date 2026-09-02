import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Dumbbell, Layers3 } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MuscleCard } from "@/components/site/MuscleCard";
import { listPublishedMuscles } from "@/lib/muscles.functions";
import type { Muscle } from "@/lib/muscles";
import {
  bodyRegions,
  findBodyRegion,
  type RegionResource,
} from "@/data/body-regions";

type MovementCheckSearch = { region?: string };

export const Route = createFileRoute("/movement-check")({
  loader: () => listPublishedMuscles(),
  validateSearch: (search): MovementCheckSearch => {
    if (typeof search["region"] === "string") return { region: search["region"] };
    return {};
  },
  head: () => ({
    meta: [
      { title: "Choose Your Starting Point | LegitBodyFix" },
      {
        name: "description",
        content:
          "Explore relevant programs, correction recipes, and muscle groups by body region.",
      },
    ],
  }),
  component: MovementCheck,
});

function ResourceCard({
  resource,
  kind,
}: {
  resource: RegionResource;
  kind: "program" | "recipe";
}) {
  return (
    <a
      href={resource.href}
      className="group flex min-w-0 flex-col rounded-sm border border-border bg-card p-5 outline-none transition-colors hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {kind === "program" ? "Guided program" : "Free recipe"}
        </span>
        {kind === "program" && (
          <span
            className={`rounded-sm px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${
              resource.available
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted-foreground"
            }`}
          >
            {resource.available ? "Available" : "In development"}
          </span>
        )}
      </div>
      <h3 className="mt-6 text-xl font-extrabold leading-tight">{resource.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {resource.description}
      </p>
      <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-4">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {resource.meta || (kind === "recipe" ? "Read the recipe" : "View program")}
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
    </a>
  );
}

function MovementCheck() {
  const { region: regionSlug } = Route.useSearch();
  const { muscles } = Route.useLoaderData();
  const region = findBodyRegion(regionSlug) || bodyRegions[0];
  if (!region) return null;
  const regionMuscles = muscles.filter((muscle) => muscleBelongsToRegion(muscle, region.slug)).slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <p className="font-mono text-xs font-bold tracking-[0.16em] text-muted-foreground">
              START BY BODY REGION
            </p>
            <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.55fr)] lg:items-end">
              <div>
                <h1 className="text-4xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
                  {region.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {region.intro}
                </p>
              </div>
              <p className="max-w-lg border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted-foreground lg:justify-self-end">
                This is a starting map, not a diagnosis. Choose the resource that best matches your
                current goal and stop if symptoms worsen.
              </p>
            </div>

            <nav className="mt-10 flex flex-wrap gap-2" aria-label="Choose a body region">
              {bodyRegions.map((item) => (
                <Link
                  key={item.slug}
                  to="/movement-check"
                  search={{ region: item.slug }}
                  aria-current={region.slug === item.slug ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-sm border px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    region.slug === item.slug
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:border-foreground/50"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        <ResourceSection
          icon={Dumbbell}
          eyebrow="Follow a progression"
          title="Related programs"
          description="Structured sessions connect individual exercises into a guided sequence."
          resources={region.programs}
          kind="program"
          tinted
        />
        <ResourceSection
          icon={BookOpen}
          eyebrow="Try a focused starting point"
          title="Correction recipes"
          description="Free, short sequences with dosage, regressions, progressions, and a reassessment."
          resources={region.recipes}
          kind="recipe"
        />

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <Layers3 className="h-5 w-5" aria-hidden="true" />
                <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Understand the anatomy
                </p>
                <h2 className="mt-3 text-3xl font-extrabold uppercase">{region.title} muscle dictionary</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Explore the anatomy, attachments, actions, and source-linked illustrations for this region.
                </p>
              </div>
              <Link to="/muscles" className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-ink px-5 py-3 text-sm font-bold text-ink-foreground">Browse all muscles <ArrowRight className="h-4 w-4" /></Link>
            </div>
            {regionMuscles.length ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {regionMuscles.map((muscle) => <MuscleCard key={muscle.id} muscle={muscle} />)}
              </div>
            ) : (
              <div className="mt-10 border border-border bg-secondary px-5 py-8 text-sm text-muted-foreground">Muscle entries for this region are being prepared.</div>
            )}
          </div>
        </section>

        <section className="bg-accent text-accent-foreground">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] opacity-65">
                Want the complete anatomy library?
              </p>
              <h2 className="mt-2 text-2xl font-extrabold uppercase sm:text-3xl">
                Browse all muscles and movement relationships.
              </h2>
            </div>
            <Link
              to="/muscles"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-bold text-ink-foreground outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-foreground"
            >
              Open the muscle atlas <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

const regionMusclePatterns: Record<string, RegExp> = {
  "head-neck": /head|neck|cervical|suboccipital|trapezius|scalene|hyoid/i,
  "shoulder-arm": /shoulder|scap|rotator|deltoid|pectoral|arm|forearm|hand|biceps|triceps/i,
  "spine-rib-cage": /spine|spinal|back|thoracic|rib|intercostal|diaphragm|abdomen|abdominal|oblique|erector/i,
  "hip-pelvis": /hip|pelvi|glute|adductor|groin|iliopsoas|thigh/i,
  knee: /knee|quadriceps|hamstring|patellar|poplite|thigh|gastrocnemius/i,
  "ankle-foot": /ankle|foot|toe|hallux|calf|lower leg|tibial|fibular|perone|plantar|gastrocnemius|soleus/i,
};

function muscleBelongsToRegion(muscle: Muscle, regionSlug: string) {
  const pattern = regionMusclePatterns[regionSlug];
  if (!pattern) return false;
  return pattern.test([muscle.bodyMap, muscle.group, muscle.family, muscle.title].filter(Boolean).join(" "));
}

function ResourceSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  resources,
  kind,
  tinted = false,
}: {
  icon: typeof Dumbbell;
  eyebrow: string;
  title: string;
  description: string;
  resources: RegionResource[];
  kind: "program" | "recipe";
  tinted?: boolean;
}) {
  return (
    <section className={`border-b border-border ${tinted ? "bg-secondary/35" : ""}`}>
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.33fr_1fr]">
          <div>
            <Icon className="h-5 w-5" aria-hidden="true" />
            <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold uppercase">{title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <div className={`grid gap-4 sm:grid-cols-2 ${kind === "recipe" ? "xl:grid-cols-3" : ""}`}>
            {resources.map((resource) => (
              <ResourceCard key={resource.title} resource={resource} kind={kind} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
