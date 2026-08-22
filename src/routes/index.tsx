import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  Dumbbell,
  Footprints,
  HeartPulse,
  Move3d,
  Rotate3d,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundSearch,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import heroImage from "@/assets/hero-training.jpg";
import { programs } from "@/data/programs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LegitBodyFix — Find Your Next Move" },
      {
        name: "description",
        content:
          "Understand what may be limiting your movement and follow a focused progression back to the activities that matter to you.",
      },
      { property: "og:title", content: "LegitBodyFix — Find Your Next Move" },
      {
        property: "og:description",
        content: "Start with a movement check, a body area, or a focused movement program.",
      },
    ],
  }),
  component: Index,
});

const starts = [
  {
    icon: HeartPulse,
    label: "I have pain",
    title: "Start with safety",
    copy: "Check whether self-guided movement is the right next step.",
  },
  {
    icon: Move3d,
    label: "I am not in pain",
    title: "Screen my movement",
    copy: "Begin broad, then narrow down what deserves a closer look.",
  },
  {
    icon: Search,
    label: "I know where to look",
    title: "Choose an area or muscle",
    copy: "Go directly to the region or structure already on your mind.",
  },
];

const method = [
  { number: "01", name: "Check", copy: "Choose pain, a whole-body screen, or a specific area." },
  { number: "02", name: "Understand", copy: "Separate what you notice from what still needs testing." },
  { number: "03", name: "Rebuild", copy: "Follow mobility, control, strength, and load in a useful order." },
  { number: "04", name: "Apply", copy: "Bring the result back to training, sport, and daily movement." },
];

const regions = [
  { slug: "head-neck", icon: UserRoundSearch, name: "Head & neck", detail: "Neck movement, head position, and upper-back contribution" },
  { slug: "shoulder-arm", icon: Dumbbell, name: "Shoulder & arm", detail: "Scapula, shoulder, elbow, wrist, and overhead movement" },
  { slug: "spine-rib-cage", icon: Rotate3d, name: "Spine & rib cage", detail: "Breathing, rotation, flexion, extension, and trunk control" },
  { slug: "hip-pelvis", icon: Move3d, name: "Hip & pelvis", detail: "Hip motion, pelvic control, squatting, and hinging" },
  { slug: "knee", icon: Activity, name: "Knee", detail: "Knee tolerance, single-leg control, and return to loading" },
  { slug: "ankle-foot", icon: Footprints, name: "Ankle & foot", detail: "Ankle mobility, balance, gait, and foot mechanics" },
];

const futureAreas = [
  "Knee capacity",
  "Hip mobility & control",
  "Spinal movement & scoliosis support",
  "Squat & hinge mechanics",
  "Scapular control",
  "Breathing & rib-cage movement",
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Movement guidance. Clear progression.
              </p>
              <h1 className="mt-5 text-5xl font-black uppercase leading-[0.88] sm:text-7xl lg:text-[5.8rem]">
                Find the limit.
                <br />
                Build the way forward.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Understand what may be influencing your movement, choose the right starting point,
                and follow a focused progression back to what you want to do.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/movement-check"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-4 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
                >
                  Find my starting point <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#programs"
                  className="inline-flex items-center justify-center rounded-sm border border-foreground px-6 py-4 text-sm font-bold hover:bg-secondary"
                >
                  Browse focused programs
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5" /> No random routine</span>
                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5" /> No diagnosis claims</span>
                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5" /> Built to progress</span>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
                <img
                  src={heroImage}
                  alt="Athlete training a squat pattern with controlled movement"
                  width={1024}
                  height={1280}
                  className="size-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 grid grid-cols-4 border-t border-white/20 bg-black/85 text-white backdrop-blur-sm">
                {method.map((item) => (
                  <div key={item.number} className="border-r border-white/15 px-2 py-3 text-center last:border-r-0 sm:px-3">
                    <span className="font-mono text-[8px] text-accent sm:text-[9px]">{item.number}</span>
                    <p className="mt-1 text-[9px] font-bold uppercase sm:text-[11px]">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="movement-check" className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Your first decision</p>
                <h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] sm:text-5xl">Start where you are.</h2>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground lg:justify-self-end">
                A useful starting point depends on whether you have pain, want a broad movement
                screen, or already know the body area you want to explore.
              </p>
            </div>

            <div className="mt-9 grid gap-px overflow-hidden rounded-sm border border-border bg-border lg:grid-cols-3">
              {starts.map(({ icon: Icon, label, title, copy }, index) => (
                <Link key={title} to="/movement-check" className="group flex min-h-60 flex-col bg-card p-7 hover:bg-accent sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">0{index + 1} / {label}</span>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-12 text-2xl font-extrabold">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{copy}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-bold">Choose this route <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="regions" className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <div className="grid overflow-hidden rounded-sm border border-foreground lg:grid-cols-[0.82fr_1.18fr]">
              <div className="flex flex-col bg-ink p-7 text-ink-foreground sm:p-10 lg:p-12">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Direct access by region</p>
                <h2 className="mt-4 text-4xl font-black uppercase leading-[0.92] sm:text-5xl">Already know where you want to start?</h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-foreground/65">
                  Skip the whole-body screen. Choose the area that feels limited, then narrow it down by movement or muscle.
                </p>
                <Link to="/movement-check" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent lg:mt-auto lg:pt-10">
                  Not sure? Take the guided check <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
                {regions.map(({ slug, icon: Icon, name, detail }) => (
                  <Link
                    key={slug}
                    to="/movement-check"
                    search={{ path: "area", area: slug }}
                    className="group flex min-h-52 flex-col bg-card p-6 transition-colors hover:bg-accent sm:p-7"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5" />
                      <ArrowRight className="h-4 w-4 opacity-35 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                    <h3 className="mt-9 text-xl font-extrabold">{name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="programs" className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Focused programs</p>
                <h2 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-[0.95] sm:text-6xl">One goal. A complete path.</h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Start with the problem that matters now. Each program is designed as a guided
                progression—not a loose collection of exercises.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {programs.map((program, index) => (
                <article key={program.title} className={`group grid min-h-[27rem] overflow-hidden rounded-sm border border-border ${index === 0 ? "bg-accent" : "bg-card"}`}>
                  <div className="aspect-[16/8] overflow-hidden border-b border-foreground/15 bg-white">
                    <img src={program.image} alt={program.imageAlt} loading="lazy" className="size-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="flex flex-1 flex-col p-7 sm:p-9">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{program.area}</span>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em]">{program.available ? "Available now" : "In preparation"}</span>
                    </div>
                    <h3 className="mt-6 max-w-lg text-3xl font-black uppercase leading-none sm:text-4xl">{program.title}</h3>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{program.summary}</p>
                    <div className="mt-auto flex items-end justify-between gap-4 border-t border-foreground/15 pt-5">
                      <div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{program.available ? "One-time access" : "Next release"}</p>{program.price && <p className="mt-1 text-xl font-extrabold">${program.price}</p>}</div>
                      <Link to="/programs/$programId" params={{ programId: program.id }} className="inline-flex items-center gap-2 text-sm font-bold">View program <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-sm bg-ink p-6 text-ink-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Not sure which one fits?</p><p className="mt-2 text-xl font-extrabold">Let the movement check choose the next useful path.</p></div>
              <Link to="/movement-check" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-accent px-6 py-4 text-sm font-bold text-accent-foreground">Take the free check <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        <section id="method" className="border-b border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">The LegitBodyFix method</p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] sm:text-6xl">Guidance between a free video and one-to-one care.</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Free videos give you options. We give those options an order, a reason, and a way to progress.</p>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-4">
              {method.map(({ number, name, copy }) => (
                <div key={number} className="min-h-56 bg-card p-7">
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-muted-foreground">{number}</span>
                  <h3 className="mt-10 text-2xl font-extrabold uppercase">{name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[{ icon: Target, title: "Specific", copy: "Built around a clear movement goal." }, { icon: ShieldCheck, title: "Responsible", copy: "Education and progression without diagnosis claims." }, { icon: Sparkles, title: "Practical", copy: "Designed to return to real activity—not endless correction." }].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="flex gap-4 rounded-sm border border-border bg-card p-5"><Icon className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{copy}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        <section id="library" className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-8 lg:py-24">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">The bigger system</p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] sm:text-6xl">Built beyond one body part.</h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">The current programs are the first releases, not the limit of the brand. LegitBodyFix is being built as a movement system that can expand across the whole body.</p>
              <Link to="/movement-check" className="mt-7 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4">Explore by body area <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="rounded-sm border border-border bg-card">
              <div className="border-b border-border p-6 sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">In development / Future program families</p></div>
              <div className="grid sm:grid-cols-2">{futureAreas.map((area, index) => <div key={area} className={`flex items-center gap-4 border-border p-5 ${index < 4 ? "border-b" : ""} ${index % 2 === 0 ? "sm:border-r" : ""}`}><span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span><p className="font-semibold">{area}</p></div>)}</div>
            </div>
          </div>
        </section>

        <section className="bg-accent text-accent-foreground">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-20">
            <div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">Your next step</p><h2 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-[0.92] sm:text-6xl">Do not guess the exercise. Find the starting point.</h2></div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Link to="/movement-check" className="inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-7 py-4 text-sm font-bold text-ink-foreground">Start the free check <ArrowRight className="h-4 w-4" /></Link><a href="#programs" className="inline-flex items-center justify-center gap-2 rounded-sm border border-foreground px-7 py-4 text-sm font-bold">Browse programs</a></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
