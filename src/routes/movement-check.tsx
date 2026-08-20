import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/movement-check")({
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

const paths = [
  "Squat & Hip",
  "Hinge & Low Back",
  "Shoulder & Overhead",
  "Run & Return",
  "Desk & Daily Life",
];

function MovementCheck() {
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
          The five-minute check is coming soon. Pick the area you want to work on and we'll point
          you to the right starting path.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {paths.map((p) => (
            <span
              key={p}
              className="rounded-sm border border-border bg-card px-3 py-2 font-mono text-xs tracking-wide"
            >
              {p}
            </span>
          ))}
        </div>

        <Link
          to="/"
          className="mt-12 inline-block rounded-sm border border-foreground px-5 py-3 text-sm font-bold"
        >
          Back home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
