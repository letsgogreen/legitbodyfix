import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CircleAlert, Dumbbell, Layers3 } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { StartingPrograms } from "@/components/site/StartingPrograms";
import { RegionThumbnail } from "@/components/site/RegionThumbnail";
import { LearnNav } from "@/components/site/LearnNav";
import { listRegionMuscleGroups } from "@/lib/region-muscle-groups.functions";
import { listRegionRecipes } from "@/lib/recipes.functions";
import {
  bodyRegions,
  findBodyRegion,
  type RegionResource,
} from "@/data/body-regions";

type MovementCheckSearch = { region?: string };

const learnBrowseLinks = [
  {
    title: "Posture & movement",
    description: "Practical articles for mobility, control, and movement preparation.",
    to: "/recipes" as const,
    icon: BookOpen,
  },
  {
    title: "Conditions",
    description: "Educational references for common musculoskeletal conditions and injuries.",
    to: "/conditions" as const,
    icon: CircleAlert,
  },
];

export const Route = createFileRoute("/movement-check")({
  validateSearch: (search): MovementCheckSearch => {
    if (typeof search["region"] === "string") return { region: search["region"] };
    return {};
  },
  loaderDeps: ({ search }) => ({ region: findBodyRegion(search["region"])?.slug ?? null }),
  loader: async ({ deps }) => {
    if (!deps.region) return { muscleGroups: [], recipeData: { recipes: [], failed: false } };
    const [muscleGroups, recipeData] = await Promise.all([
      listRegionMuscleGroups({ data: { region: deps.region as "head-neck" | "shoulder-arm" | "spine-rib-cage" | "hip-pelvis" | "knee" | "ankle-foot" } }),
      listRegionRecipes({ data: { region: deps.region as "head-neck" | "shoulder-arm" | "spine-rib-cage" | "hip-pelvis" | "knee" | "ankle-foot" } }),
    ]);
    return { muscleGroups, recipeData };
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
  const { muscleGroups, recipeData } = Route.useLoaderData();
  const region = findBodyRegion(regionSlug);
  if (!region) return <LearnOverview />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <LearnNav active="regions" region={region.slug} />
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <p className="font-mono text-xs font-bold tracking-[0.16em] text-muted-foreground">
              START BY BODY REGION
            </p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.55fr)] lg:items-start">
              <div>
                <h1 className="text-4xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
                  {region.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {region.intro}
                </p>
                <p className="mt-6 max-w-lg border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted-foreground">
                  This is a starting map, not a diagnosis. Choose the resource that best matches your
                  current goal and stop if symptoms worsen.
                </p>
              </div>
              <RegionThumbnail region={region} />
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

        <section className="border-b border-border bg-secondary/35">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[0.33fr_1fr] lg:px-8 lg:py-20">
            <div>
              <Dumbbell className="h-5 w-5" aria-hidden="true" />
              <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Follow a progression</p>
              <h2 className="mt-3 text-3xl font-extrabold uppercase">Related programs</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Explore published programs for this area. Review current details and pricing on each program page.</p>
            </div>
            <div className="min-w-0">
              <StartingPrograms region={region.slug} title={region.title} learnHref="#learning-resources" />
            </div>
          </div>
        </section>
        <div id="learning-resources" className="scroll-mt-24">
        <ResourceSection
          icon={BookOpen}
          eyebrow="Try a focused starting point"
          title="Articles & recipes"
          description="Published learning resources for this area, maintained in our article library."
          resources={recipeData.recipes.map((recipe) => ({ title: recipe.title, description: recipe.summary || recipe.goal || "Read the full article.", href: `/recipes/${encodeURIComponent(recipe.slug)}`, meta: "Read article" }))}
          kind="recipe"
        />
        {!recipeData.recipes.length && <div className="mx-auto max-w-7xl px-5 pb-12 lg:px-8" role={recipeData.failed ? "alert" : "status"}>
          <p className="text-sm text-muted-foreground">{recipeData.failed ? "We couldn’t load articles. Please reload this page to try again." : "No published articles are assigned to this area yet."}</p>
          <a href="/recipes" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold underline">Browse the article library</a>
        </div>}
        </div>

        <section className="border-b border-border bg-secondary/35">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:px-8 lg:py-16">
            <div className="max-w-2xl">
              <CircleAlert className="h-5 w-5" aria-hidden="true" />
              <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Understand symptoms and injuries
              </p>
              <h2 className="mt-3 text-3xl font-extrabold uppercase">
                {region.title} condition guides
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Review educational references related to this area, including common presentations,
                screening considerations, and signs that may need professional assessment.
              </p>
            </div>
            <Link
              to="/conditions"
              search={{ region: region.slug }}
              preload="intent"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3 text-sm font-bold text-ink-foreground outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Browse related conditions
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

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
            {muscleGroups.length ? (
              <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
                {muscleGroups.map(group => (
                  <a key={group.name} href={group.href} className="group flex min-w-0 flex-col bg-card outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground">
                    <div className="flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border bg-white">
                      {group.imageUrl ? <img src={group.imageUrl} alt={group.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-contain p-4 transition-transform group-hover:scale-105" onError={event => { event.currentTarget.style.display = 'none'; }} /> : <span className="text-sm text-muted-foreground">Anatomy reference</span>}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="font-mono text-[10px] uppercase tracking-widest">Muscle group · {group.count} {group.count === 1 ? 'muscle' : 'muscles'}</p>
                      <h3 className="mt-5 text-xl font-extrabold">{group.name}</h3>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{group.description}</p>
                      <span className="mt-auto flex min-h-11 items-center gap-2 pt-5 text-sm font-bold">Explore muscles <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                    </div>
                  </a>
                ))}
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

function LearnOverview() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <LearnNav active="regions" />
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:py-12 lg:px-8">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Learn · Start here</p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl lg:text-6xl">Explore movement from one clear starting point.</h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Choose the body area most relevant today. You can then move between articles, conditions, anatomy, and programs without losing that context.</p>
              </div>
              <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted-foreground">This library is educational, not a diagnosis. Choose a comfortable starting point and stop if symptoms worsen.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
            <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Browse by body region</p><h2 className="mt-2 text-2xl font-extrabold uppercase">Where do you want to start?</h2></div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">6 regions</span>
          </div>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {bodyRegions.map((item, index) => (
              <Link key={item.slug} to="/movement-check" search={{ region: item.slug }} preload="intent" className="group flex min-h-48 flex-col bg-card p-6 outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground">
                <span className="font-mono text-[10px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 text-2xl font-extrabold uppercase">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <span className="mt-auto flex items-center justify-between pt-6 text-sm font-bold">Explore this region <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-secondary/35">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Already know what you need?</p>
            <h2 className="mt-2 text-2xl font-extrabold uppercase">Browse by resource type</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {learnBrowseLinks.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  search={{ region: undefined }}
                  preload="intent"
                  className="group border border-border bg-card p-6 outline-none transition-colors hover:border-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  <h3 className="mt-8 text-xl font-extrabold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <span className="mt-6 flex items-center gap-2 text-sm font-bold">
                    Browse resources
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
              <a
                href="/knowledge.html?type=muscles"
                className="group border border-border bg-card p-6 outline-none transition-colors hover:border-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
              >
                <Layers3 className="h-5 w-5" aria-hidden="true" />
                <h3 className="mt-8 text-xl font-extrabold">Muscle dictionary</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Explore anatomy, attachments, actions, and movement relationships.</p>
                <span className="mt-6 flex items-center gap-2 text-sm font-bold">
                  Browse anatomy
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
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
