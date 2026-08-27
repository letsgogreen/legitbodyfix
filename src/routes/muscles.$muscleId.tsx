import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
      </article>
    </main>
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
