import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Route as RouteIcon, ScanSearch, Waypoints } from "lucide-react";
import { BodyRegionGrid } from "@/components/site/BodyRegionGrid";
import { FeaturedPrograms } from "@/components/site/FeaturedPrograms";
import { HeroBodyMap } from "@/components/site/HeroBodyMap";
import { HowItWorks } from "@/components/site/HowItWorks";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { getHomepageRegionData } from "@/lib/homepage.functions";
import { getPublicPrograms } from "@/lib/public-programs.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [regionResult, programResult] = await Promise.allSettled([
      getHomepageRegionData(),
      getPublicPrograms(),
    ]);

    return {
      regionData: regionResult.status === "fulfilled" ? regionResult.value : null,
      programs: programResult.status === "fulfilled" ? programResult.value : [],
      regionLoadFailed: regionResult.status === "rejected",
      programLoadFailed: programResult.status === "rejected",
    };
  },
  head: () => ({
    meta: [
      { title: "LegitBodyFix — Move Better With a Plan" },
      {
        name: "description",
        content:
          "Choose what feels limited, check your starting point, and follow a focused program built for your movement goal.",
      },
      { property: "og:title", content: "LegitBodyFix — Move Better With a Plan" },
      {
        property: "og:description",
        content: "Clear movement guidance and focused progressions for active adults.",
      },
    ],
  }),
  component: PhaseOneHomepage,
});

const differentiators = [
  {
    icon: ScanSearch,
    title: "Choose a starting point",
    description: "Find a useful starting point instead of collecting another random routine.",
  },
  {
    icon: Waypoints,
    title: "Follow a real progression",
    description:
      "Build movement through an intentional sequence, not a list of isolated exercises.",
  },
  {
    icon: RouteIcon,
    title: "Return to real movement",
    description:
      "Connect the work back to training, daily activity, and the goals that matter to you.",
  },
];

function PhaseOneHomepage() {
  const { regionData, programs, regionLoadFailed, programLoadFailed } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main>
        <section className="overflow-hidden border-b border-border">
          <div className="mx-auto grid max-w-[1220px] items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
            <div className="min-w-0">
              <p className="inline-block bg-accent px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent-foreground">
                Movement education for everyday life and training
              </p>
              <h1 className="original-hero-title mt-[26px] max-w-[620px] text-[clamp(3.5rem,5.6vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.065em]">
                <span className="block">Move</span>
                <span className="block">better.</span>
                <span className="original-outline block">Start</span>
                <span className="original-outline block">here.</span>
              </h1>
              <p className="mt-6 max-w-[550px] text-lg leading-[1.65] text-muted-foreground">
                Stiff after sitting? Unsure where to begin with your movement? Find relevant anatomy
                and articles, then explore a guided program when you want more structure.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/start"
                  className="inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-6 py-3.5 text-center text-sm font-bold text-accent-foreground outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Find my starting point
                </Link>
                <a
                  href="#regions"
                  className="inline-flex min-h-11 items-center justify-center rounded-sm border border-foreground px-6 py-3.5 text-center text-sm font-bold outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Explore free resources
                </a>
              </div>
              <p className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground">
                Free articles & anatomy · Optional paid programs · Learn at your pace
              </p>
              <Link
                to="/library"
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"
              >
                Already purchased? Open your library{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mx-auto w-full min-w-0">
              <HeroBodyMap />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="choose-path-title"
          className="border-b border-border bg-secondary/30"
        >
          <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
            <h2 id="choose-path-title" className="text-2xl font-extrabold">
              Choose the kind of help you need.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "01 / FIND YOUR DIRECTION",
                  title: "Not sure where to start?",
                  body: "Choose your area and goal to find relevant resources. A starting point, not a diagnosis.",
                  href: "/start",
                  action: "Find my starting point",
                },
                {
                  label: "02 / FREE LEARNING",
                  title: "Understand your movement.",
                  body: "Browse anatomy, movement articles, and condition guides before deciding what to explore.",
                  href: "#regions",
                  action: "Explore by body region",
                },
                {
                  label: "03 / PAID PROGRAMS",
                  title: "Prefer a guided session?",
                  body: "Review each program’s focus, contents, and current price before choosing. No subscription.",
                  href: "#programs",
                  action: "Compare programs",
                },
              ].map((path) => (
                <a
                  key={path.href}
                  href={path.href}
                  className="group flex min-w-0 flex-col border border-border bg-card p-6 transition-colors hover:border-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                    {path.label}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{path.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{path.body}</p>
                  <span className="mt-auto flex min-h-11 items-center gap-2 pt-6 text-sm font-bold">
                    {path.action}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="regions" className="scroll-mt-24 border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-end">
              <div>
                <p className="font-mono text-xs font-bold tracking-[0.16em] text-muted-foreground">
                  START BY BODY REGION
                </p>
                <h2 className="mt-4 text-3xl font-extrabold uppercase sm:text-5xl">
                  Where do you want to start?
                </h2>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:justify-self-end">
                Whether a squat feels restricted, overhead movement feels uncertain, or sitting
                leaves you stiff, begin with the area that feels most relevant.
              </p>
            </div>
            <div className="mt-10">
              <BodyRegionGrid initialData={regionData} loadFailed={regionLoadFailed} />
            </div>
          </div>
        </section>

        <section id="programs" className="scroll-mt-24 border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-end">
              <div>
                <p className="font-mono text-xs font-bold tracking-[0.16em] text-muted-foreground">
                  OPTIONAL GUIDED PROGRAMS
                </p>
                <h2 className="mt-4 text-3xl font-extrabold uppercase sm:text-5xl">
                  Choose a program with a clear focus.
                </h2>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:justify-self-end">
                Compare the focus and contents before you buy. Each program page shows its current
                price and what is included. Purchased sessions live in your private library.
              </p>
            </div>
            <div className="mt-10">
              <FeaturedPrograms programs={programs} loadFailed={programLoadFailed} />
            </div>
          </div>
        </section>

        <section id="method" className="scroll-mt-24 border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <p className="font-mono text-xs font-bold tracking-[0.16em] text-muted-foreground">
              HOW IT WORKS
            </p>
            <h2 className="mt-4 text-3xl font-extrabold uppercase sm:text-5xl">
              Three steps. One clear direction.
            </h2>
            <div className="mt-10">
              <HowItWorks />
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-bold tracking-[0.16em] text-muted-foreground">
                WHY LEGITBODYFIX
              </p>
              <h2 className="mt-4 text-3xl font-extrabold uppercase leading-tight sm:text-5xl">
                More structure than another exercise list.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {differentiators.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="min-w-0 rounded-sm border border-border bg-card p-7"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <h3 className="mt-6 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-accent text-accent-foreground">
          <div className="mx-auto max-w-4xl px-5 py-24 text-center lg:px-8">
            <h2 className="text-4xl font-extrabold uppercase leading-[0.92] sm:text-6xl">
              Not sure where to begin?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-accent-foreground/75 sm:text-lg">
              Choose an area and how you prefer to learn. We will show you where to go next.
            </p>
            <Link
              to="/start"
              className="mt-9 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-ink px-8 py-3.5 text-sm font-bold text-ink-foreground outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
            >
              Find my starting point <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
