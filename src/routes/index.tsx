import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Armchair,
  BookOpen,
  Compass,
  Dumbbell,
  Footprints,
  Gauge,
  LineChart,
  MoveVertical,
  Repeat,
  Target,
  Timer,
  Video,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import heroImage from "@/assets/hero-training.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LegitBodyFix — Build More Ways to Move" },
      {
        name: "description",
        content:
          "Assess what's limiting you, restore the movement you need, and rebuild the strength to return to training with confidence.",
      },
      { property: "og:title", content: "LegitBodyFix — Build More Ways to Move" },
      {
        property: "og:description",
        content:
          "A movement system for active adults: assess, restore, rebuild, and apply it back to real training.",
      },
    ],
  }),
  component: Index,
});

const situations = [
  { icon: MoveVertical, text: "My hips feel locked up every time I squat." },
  { icon: Activity, text: "My lower back stays stiff after deadlifts." },
  { icon: Dumbbell, text: "My shoulder bothers me overhead." },
  { icon: Footprints, text: "I'm nervous about getting back into running." },
  {
    icon: Armchair,
    text: "Sitting all day makes everything feel stuck before I even start training.",
  },
];

const steps = [
  { n: "01", name: "ASSESS", copy: "Find out what's actually limiting you." },
  { n: "02", name: "RESTORE", copy: "Rebuild the mobility, breathing, and control you need." },
  { n: "03", name: "REBUILD", copy: "Restore strength, stability, and load tolerance." },
  { n: "04", name: "APPLY", copy: "Bring it back into squats, hinges, overhead work, or running." },
];

const usps = [
  {
    icon: Target,
    title: "Assess before exercise",
    copy: "We find your starting point instead of giving everyone the same routine.",
  },
  {
    icon: Repeat,
    title: "Restore, then rebuild",
    copy: "We don't stop at mobility — we progress into control, strength, and load.",
  },
  {
    icon: Compass,
    title: "Apply to real movement",
    copy: "Everything connects back to your squat, hinge, overhead work, or running.",
  },
  {
    icon: BookOpen,
    title: "Education without overwhelm",
    copy: "We give you what you need to know, not a full anatomy course.",
  },
  {
    icon: LineChart,
    title: "Clear progression",
    copy: "You'll always know when to advance, modify, or stop.",
  },
  {
    icon: Gauge,
    title: "Mid-priced personalization",
    copy: "More structure than free videos. More affordable than 1:1 coaching.",
  },
];

const entryPaths = [
  { icon: MoveVertical, name: "Squat & Hip", copy: "For lifters who feel pinched or stuck at depth." },
  { icon: Activity, name: "Hinge & Low Back", copy: "For stiff mornings and cautious deadlifts." },
  { icon: Dumbbell, name: "Shoulder & Overhead", copy: "For pressing, pulling, and reaching overhead." },
  { icon: Footprints, name: "Run & Return", copy: "For getting back to mileage on your terms." },
  { icon: Armchair, name: "Desk & Daily Life", copy: "For long sitting days before training starts." },
];

const products = [
  { name: "5-Minute Movement Check", copy: "Free starting-point assessment", price: "$0" },
  { name: "7-Day Movement Reset", copy: "Short intro program", price: "$12" },
  {
    name: "4-Week Movement Reset",
    copy: "Core program",
    price: "$59",
    featured: true,
  },
  { name: "8-Week Build & Return", copy: "Extended progression", price: "$129" },
  { name: "Video Form Review", copy: "Personal 1:1 video feedback", price: "$69", icon: Video },
  { name: "Complete Movement System", copy: "Full bundle", price: "$179" },
  { name: "Movement Library", copy: "Ongoing monthly access", price: "$24/mo" },
];

const articles = [
  { title: "Why your squat feels tight", tag: "SQUAT & HIP", minutes: "4 MIN" },
  { title: "A simple overhead reach check", tag: "SHOULDER", minutes: "3 MIN" },
  { title: "How to add load after mobility work", tag: "PROGRESSION", minutes: "6 MIN" },
];

function Index() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeChip, setActiveChip] = useState(0);
  const [activePath, setActivePath] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
            <div className="min-w-0">
              <span className="inline-block bg-accent px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.18em] text-accent-foreground">
                MOVEMENT SYSTEM
              </span>
              <h1 className="mt-6 text-5xl font-extrabold uppercase leading-[0.92] sm:text-6xl lg:text-7xl">
                Build more ways to move.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Assess what's limiting you, restore the movement you need, and rebuild the strength
                to return to training with confidence.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/movement-check"
                  className="rounded-sm bg-accent px-6 py-4 text-center text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
                >
                  Take the Free Movement Check
                </Link>
                <a
                  href="#programs"
                  className="rounded-sm border border-foreground px-6 py-4 text-center text-sm font-bold transition-colors hover:bg-secondary"
                >
                  Explore Movement Reset
                </a>
              </div>
              <p className="mt-6 font-mono text-xs leading-relaxed text-muted-foreground">
                Evidence-informed · Built for active adults · No recurring subscription required
              </p>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
                <img
                  src={heroImage}
                  alt="Active adult training a loaded squat pattern in a bright studio"
                  width={1024}
                  height={1280}
                  className="size-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 left-4 bg-ink px-4 py-3 font-mono text-[11px] tracking-widest text-ink-foreground sm:left-6">
                ASSESS → RESTORE → REBUILD → APPLY
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <h2 className="text-3xl font-extrabold uppercase sm:text-5xl">Sound familiar?</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {situations.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex min-w-0 gap-4 rounded-sm border border-border bg-card p-6"
                >
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="min-w-0 text-base font-medium leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* System */}
        <section id="method" className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <h2 className="text-3xl font-extrabold uppercase sm:text-5xl">A system, not a guess.</h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-4">
              {steps.map((s, i) => {
                const active = activeStep === i;
                return (
                  <button
                    key={s.n}
                    type="button"
                    onMouseEnter={() => setActiveStep(i)}
                    onFocus={() => setActiveStep(i)}
                    onClick={() => setActiveStep(i)}
                    className={`min-w-0 p-7 text-left transition-colors ${
                      active ? "bg-accent text-accent-foreground" : "bg-card"
                    }`}
                  >
                    <span className="font-mono text-xs tracking-widest opacity-70">{s.n}</span>
                    <p className="mt-6 text-xl font-extrabold uppercase">{s.name}</p>
                    <p
                      className={`mt-2 text-sm leading-snug ${
                        active ? "text-accent-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {s.copy}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* USP */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-extrabold uppercase leading-tight sm:text-5xl">
                More than mobility. A system for returning movement to real activity.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                YouTube gives you exercises. LegitBodyFix gives you the order, progression, and
                context to use them.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {usps.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="rounded-sm border border-border bg-card p-7">
                  <Icon className="h-5 w-5" />
                  <p className="mt-5 text-lg font-bold">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Movement check CTA */}
        <section id="movement-check" className="bg-ink text-ink-foreground">
          <div className="mx-auto max-w-4xl px-5 py-24 text-center lg:px-8">
            <h2 className="text-3xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
              Find what's limiting your movement.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-ink-foreground/70">
              A five-minute check to help you choose a better starting point. No diagnosis — just
              clear movement guidance.
            </p>
            <Link
              to="/movement-check"
              className="mt-9 inline-block rounded-sm bg-accent px-8 py-4 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Take the Free Movement Check
            </Link>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {entryPaths.map((p, i) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setActiveChip(i)}
                  className={`rounded-sm border px-3 py-2 font-mono text-[11px] tracking-wide transition-colors ${
                    activeChip === i
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-ink-foreground/25 text-ink-foreground/70 hover:border-ink-foreground/60"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <h2 className="text-3xl font-extrabold uppercase sm:text-5xl">
              Start small. Go deeper when you're ready.
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.name}
                  className={`flex min-w-0 flex-col rounded-sm border bg-card p-7 ${
                    p.featured
                      ? "border-2 border-accent shadow-[0_20px_50px_-30px_oklch(0.16_0_0/40%)] lg:row-span-2 lg:p-10"
                      : "border-border"
                  }`}
                >
                  {p.featured && (
                    <span className="mb-5 inline-block w-fit bg-accent px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.18em] text-accent-foreground">
                      MOST POPULAR
                    </span>
                  )}
                  <p
                    className={`font-extrabold uppercase leading-tight ${
                      p.featured ? "text-2xl lg:text-3xl" : "text-lg"
                    }`}
                  >
                    {p.name}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.copy}</p>
                  <p
                    className={`mt-6 font-mono font-bold ${p.featured ? "text-5xl" : "text-3xl"}`}
                  >
                    {p.price}
                  </p>
                  <Link
                    to="/movement-check"
                    className={`mt-auto pt-7 text-sm font-bold ${
                      p.featured ? "" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.featured ? (
                      <span className="block rounded-sm bg-accent px-5 py-3.5 text-center text-accent-foreground">
                        Start the 4-Week Reset
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Get started <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core program */}
        <section id="programs" className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <h2 className="text-3xl font-extrabold uppercase sm:text-5xl">
              Assess. Restore. Rebuild. Apply.
            </h2>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              A four-week system for turning movement limitations into a structured
              return-to-training plan.
            </p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {entryPaths.map(({ icon: Icon, name, copy }, i) => {
                const active = activePath === i;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActivePath(i)}
                    className={`min-w-0 rounded-sm border p-6 text-left transition-colors ${
                      active ? "border-accent bg-card" : "border-border bg-card hover:border-foreground/40"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <p className="mt-5 text-base font-bold uppercase leading-tight">{name}</p>
                    <p className="mt-2 text-sm leading-snug text-muted-foreground">{copy}</p>
                    <span
                      className={`mt-5 block font-mono text-[11px] tracking-widest ${
                        active ? "text-foreground" : "text-muted-foreground/70"
                      }`}
                    >
                      {active ? "SELECTED" : "SELECT PATH"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <h2 className="text-3xl font-extrabold uppercase sm:text-5xl">
              Understand your body without the overwhelm.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {articles.map((a) => (
                <article key={a.title} className="min-w-0">
                  <div className="aspect-[16/10] rounded-sm bg-secondary" aria-hidden />
                  <div className="mt-4 flex items-center gap-3 font-mono text-[11px] tracking-widest text-muted-foreground">
                    <span>{a.tag}</span>
                    <Timer className="h-3.5 w-3.5" />
                    <span>{a.minutes}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold leading-snug">{a.title}</h3>
                </article>
              ))}
            </div>
            <a
              href="#pricing"
              className="mt-10 inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline"
            >
              Explore the Movement Library <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-accent text-accent-foreground">
          <div className="mx-auto max-w-4xl px-5 py-24 text-center lg:px-8">
            <h2 className="text-4xl font-extrabold uppercase leading-[0.92] sm:text-6xl">
              Stop guessing. Move with a plan.
            </h2>
            <p className="mt-5 text-lg text-accent-foreground/75">
              Don't stop training. Change how you rebuild.
            </p>
            <Link
              to="/movement-check"
              className="mt-9 inline-block rounded-sm bg-ink px-8 py-4 text-sm font-bold text-ink-foreground transition-transform hover:-translate-y-0.5"
            >
              Take the Free Movement Check
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
