import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { getPublishedMuscle } from "@/lib/muscles.functions";

export const Route = createFileRoute("/muscles/$muscleId")({
  loader: async ({ params }) => {
    const muscle = await getPublishedMuscle({ data: { id: params.muscleId } });
    if (!muscle) throw notFound();
    return muscle;
  },
  errorComponent: () => (
    <main className="mx-auto max-w-3xl px-5 py-24">
      <h1 className="text-3xl font-extrabold">Muscle unavailable</h1>
      <p className="mt-3 text-muted-foreground">Please try again in a moment.</p>
    </main>
  ),
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-5 py-24">
      <h1 className="text-3xl font-extrabold">Muscle not published</h1>
      <p className="mt-3 text-muted-foreground">
        This entry is not part of the published library yet.
      </p>
      <Link to="/muscles" className="mt-6 inline-flex text-sm font-bold underline">
        Back to muscle library
      </Link>
    </main>
  ),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | LegitBodyFix Muscle Library` },
          { name: "description", content: loaderData.actions },
        ]
      : [{ title: "Muscle not found | LegitBodyFix" }],
  }),
  component: MuscleDetail,
});

function MuscleDetail() {
  const muscle = Route.useLoaderData();
  const imagePosition = muscle.cardImagePosition ?? "50% 50%";
  const imageScale = muscle.cardImageScale ?? 1;

  return (
    <main>
      <article className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
        <Link
          to="/muscles"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to muscle library
        </Link>

        <div className="mt-8 grid overflow-hidden rounded-sm border border-border bg-card lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <figure className="flex min-h-[22rem] flex-col border-b border-border bg-secondary lg:min-h-[42rem] lg:border-b-0 lg:border-r">
            <div className="flex flex-1 items-center justify-center overflow-hidden p-5 sm:p-8">
              <img
                src={muscle.imageUrl}
                alt={muscle.imageAlt}
                referrerPolicy="no-referrer"
                className="max-h-[36rem] w-full object-contain"
                style={{ objectPosition: imagePosition, transform: `scale(${imageScale})` }}
              />
            </div>
            <figcaption className="border-t border-border bg-card px-5 py-4 text-xs leading-relaxed text-muted-foreground">
              {muscle.imageCredit}{" "}
              <a
                href={muscle.imageCreditUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-foreground underline underline-offset-4"
              >
                Image source <ExternalLink className="inline h-3 w-3" aria-hidden="true" />
              </a>
            </figcaption>
          </figure>

          <div className="p-6 sm:p-10 lg:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {muscle.group}
              {muscle.family ? ` / ${muscle.family}` : ""}
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[0.95] tracking-[-0.045em] sm:text-6xl">
              {muscle.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{muscle.actions}</p>

            <dl className="mt-10 divide-y divide-border border-y border-border">
              <DetailTerm term="Origin" description={muscle.origin} />
              <DetailTerm term="Insertion" description={muscle.insertion} />
              <DetailTerm term="Primary actions" description={muscle.actions} />
            </dl>

            <div className="mt-8 rounded-sm border border-border bg-secondary p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Anatomy source
              </p>
              <p className="mt-2 text-sm leading-relaxed">{muscle.sourceName}</p>
              <a
                href={muscle.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4"
              >
                Open reference <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
              Educational anatomy reference only. This page does not diagnose pain, injury, or
              movement limitations.
            </p>
          </div>
        </div>

        {(muscle.guides.length > 0 || muscle.recipes.length > 0 || muscle.programs.length > 0) && (
          <section
            className="mt-12 border-t border-border pt-10"
            aria-labelledby="next-steps-title"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  From anatomy to action
                </p>
                <h2
                  id="next-steps-title"
                  className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl"
                >
                  Explore the movement, not just the muscle.
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end">
                A single muscle rarely explains a movement by itself. Use the related guides and
                recipes to see how this anatomy may contribute, then choose a focused program when
                you want a complete progression.
              </p>
            </div>

            {muscle.guides.length > 0 && (
              <ConnectionGroup label="Movement guides">
                {muscle.guides.map((guide) => (
                  <Link
                    key={guide.slug}
                    to="/guides/$slug"
                    params={{ slug: guide.slug }}
                    className="group border border-border bg-card p-5 transition-colors hover:bg-secondary"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {guide.role ? `${guide.role} contributor` : "Related movement pattern"}
                    </p>
                    <h3 className="mt-3 text-xl font-extrabold">{guide.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {guide.pattern_summary}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                      Understand the pattern
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </ConnectionGroup>
            )}

            {muscle.recipes.length > 0 && (
              <ConnectionGroup label="Corrective exercise recipes">
                {muscle.recipes.map((recipe) => (
                  <Link
                    key={recipe.slug}
                    to="/recipes/$slug"
                    params={{ slug: recipe.slug }}
                    className="group overflow-hidden border border-border bg-card transition-colors hover:bg-secondary"
                  >
                    <div className="grid h-48 place-items-center border-b border-border bg-white p-3">
                      {recipe.image_url ? (
                        <img
                          src={recipe.image_url}
                          alt={recipe.image_alt ?? ""}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Visual pending
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {recipe.role === "tight" ? "Mobility focus" : "Capacity focus"}
                      </p>
                      <h3 className="mt-3 text-xl font-extrabold">{recipe.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {recipe.goal ?? recipe.summary}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                        Open the recipe
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </ConnectionGroup>
            )}

            {muscle.programs.length > 0 && (
              <div className="mt-8 grid gap-5 bg-ink p-6 text-ink-foreground sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime">
                    Complete guided progressions
                  </p>
                  <h3 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                    Ready to follow a focused plan?
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-foreground/70">
                    These programs include this muscle through a related guide or corrective recipe.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  {muscle.programs.map((program) => (
                    <Link
                      key={program.slug}
                      to="/library/$programSlug"
                      params={{ programSlug: program.slug }}
                      className="inline-flex min-h-12 items-center justify-between gap-5 border border-ink-foreground/30 px-4 text-sm font-bold hover:bg-ink-foreground hover:text-ink"
                    >
                      {program.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </article>
    </main>
  );
}

function ConnectionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function DetailTerm({ term, description }: { term: string; description: string }) {
  return (
    <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr] sm:gap-5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {term}
      </dt>
      <dd className="text-sm leading-relaxed">{description}</dd>
    </div>
  );
}
