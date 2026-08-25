import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { bodyRegions, findBodyRegion } from "@/data/body-regions";

type MovementCheckSearch = {
  region?: string;
};

export const Route = createFileRoute("/movement-check")({
  validateSearch: (search): MovementCheckSearch => {
    if (typeof search["region"] === "string") return { region: search["region"] };
    return {};
  },
  head: () => ({
    meta: [
      { title: "Free 5-Minute Movement Check | LegitBodyFix" },
      {
        name: "description",
        content:
          "A five-minute movement check to find your starting point and choose the right path back to training.",
      },
      { property: "og:title", content: "Free 5-Minute Movement Check | LegitBodyFix" },
      {
        property: "og:description",
        content: "Find what's limiting your movement and pick a better starting point.",
      },
    ],
  }),
  component: MovementCheck,
});

function MovementCheck() {
  const { region: regionSlug } = Route.useSearch();
  const region = findBodyRegion(regionSlug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-24 lg:px-8">
        <p className="font-mono text-xs tracking-widest text-muted-foreground">
          STEP 01 / MOVEMENT CHECK
        </p>
        <h1 className="mt-4 text-4xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
          Find what's limiting your movement.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground">
          {region
            ? `You started from: ${region.title} — the full check is coming soon.`
            : "The full guided check is coming soon. Choose a body region to preview a starting path."}
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {bodyRegions.map((item) => (
            <Link
              key={item.slug}
              to="/movement-check"
              search={{ region: item.slug }}
              aria-current={region?.slug === item.slug ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-sm border px-3 py-2 font-mono text-xs tracking-wide outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                region?.slug === item.slug
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground/50"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="mt-12 inline-flex min-h-11 items-center rounded-sm border border-foreground px-5 py-3 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Back home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
