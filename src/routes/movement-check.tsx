import { useState, type ComponentType } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowLeft, ArrowRight, BadgeAlert, Bone, Check, CheckCircle2, Dumbbell, Footprints, Hand, HeartPulse, Move3d, Play, Rotate3d, Search, ShieldAlert, Sparkles, UserRoundSearch } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/movement-check")({
  head: () => ({ meta: [
    { title: "Free Movement Check | LegitBodyFix" },
    { name: "description", content: "Choose a safe starting point: check pain, screen whole-body movement, or explore a specific area." },
  ] }),
  component: MovementCheck,
});

type PathId = "pain" | "screen" | "area";
type Icon = ComponentType<{ className?: string }>;

const entryPaths: Array<{ id: PathId; number: string; icon: Icon; eyebrow: string; title: string; copy: string; action: string }> = [
  { id: "pain", number: "01", icon: HeartPulse, eyebrow: "Start with safety", title: "I have pain", copy: "Check whether self-guided movement is an appropriate next step before testing performance.", action: "Check my symptoms" },
  { id: "screen", number: "02", icon: Move3d, eyebrow: "I am not in pain", title: "Screen my movement", copy: "Use a whole-body movement pattern, then narrow down what deserves a closer look.", action: "Start the screen" },
  { id: "area", number: "03", icon: UserRoundSearch, eyebrow: "I know where to look", title: "Choose an area or muscle", copy: "Skip the general screen and explore the body region or muscle you already have in mind.", action: "Choose an area" },
];

const redFlags = [
  "A recent major injury, fall, collision, or visible deformity",
  "New numbness, marked weakness, loss of balance, or spreading symptoms",
  "Chest pain, breathing difficulty, fever, or feeling systemically unwell",
  "Loss of bladder or bowel control, or numbness around the saddle area",
  "Severe, rapidly worsening, or unrelenting pain",
];

const patterns: Array<{ icon: Icon; name: string; focus: string; featured?: boolean }> = [
  { icon: Move3d, name: "Overhead squat", focus: "A broad first look at ankle, hip, trunk, thoracic, and overhead coordination.", featured: true },
  { icon: Footprints, name: "Step", focus: "Single-leg support, balance, and left-to-right control." },
  { icon: Activity, name: "Split stance", focus: "Lunge position, deceleration, and lower-body asymmetry." },
  { icon: Hand, name: "Shoulder reach", focus: "Shoulder, scapular, and upper-back mobility." },
  { icon: Bone, name: "Straight-leg raise", focus: "Hip separation with the pelvis kept controlled." },
  { icon: Dumbbell, name: "Trunk push", focus: "Whole-trunk control during symmetrical arm loading." },
  { icon: Rotate3d, name: "Rotary control", focus: "Cross-body coordination and multi-plane stability." },
];

const squatObservations = [
  { id: "clear", label: "The movement felt comfortable and controlled", next: "Compare a step or split-stance pattern", reason: "A squat can look clear while single-leg or split-stance control still differs from side to side." },
  { id: "heels", label: "My heels lifted or I could not reach depth", next: "Check ankle motion, then hip motion", reason: "Both areas can change squat depth. Test them separately before deciding what influenced the pattern." },
  { id: "knees", label: "My knees moved inward or felt difficult to control", next: "Try the step and split-stance checks", reason: "Single-leg and split-stance tasks add useful information about foot, hip, and trunk control." },
  { id: "shift", label: "I shifted or rotated toward one side", next: "Compare left and right in a step pattern", reason: "A side-to-side comparison helps determine whether the difference appears under single-leg support." },
  { id: "trunk", label: "My trunk leaned far forward", next: "Separate ankle, hip, and overhead reach", reason: "Forward lean is not specific to one tight muscle. Checking each contributor is more useful than guessing from appearance." },
  { id: "arms", label: "My arms dropped forward or overhead position was difficult", next: "Check shoulder reach and upper-back movement", reason: "Shoulder, scapular, thoracic, and even lower-body limits can change the overhead squat position." },
  { id: "pain", label: "The movement caused pain", next: "Stop the performance screen", reason: "Pain changes the pathway. Do not use squat appearance to choose a corrective exercise; use the pain and safety route instead." },
];

const areas: Array<{ icon: Icon; name: string; detail: string }> = [
  { icon: UserRoundSearch, name: "Head & neck", detail: "Neck movement, head position, and upper-back contribution" },
  { icon: Dumbbell, name: "Shoulder & arm", detail: "Scapula, shoulder, elbow, wrist, and overhead movement" },
  { icon: Rotate3d, name: "Spine & rib cage", detail: "Breathing, rotation, flexion, extension, and trunk control" },
  { icon: Move3d, name: "Hip & pelvis", detail: "Hip motion, pelvic control, squatting, and hinging" },
  { icon: Activity, name: "Knee", detail: "Knee tolerance, single-leg control, and return to loading" },
  { icon: Footprints, name: "Ankle & foot", detail: "Ankle mobility, balance, gait, and foot mechanics" },
];

function MovementCheck() {
  const [path, setPath] = useState<PathId | null>(null);
  const [selectedPattern, setSelectedPattern] = useState("Overhead squat");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [hasRedFlag, setHasRedFlag] = useState<boolean | null>(null);
  const reset = () => { setPath(null); setSelectedArea(null); setHasRedFlag(null); };

  return <div className="min-h-screen bg-background text-foreground">
    <SiteNav />
    <main>
      <section className="border-b border-border"><div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.65fr)] lg:items-end">
          <div><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Free movement check</p><h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.9] sm:text-7xl lg:text-8xl">Start with what you know.</h1></div>
          <div className="border-l-2 border-accent pl-5 lg:mb-2"><p className="text-lg font-semibold leading-snug">You do not need to know the diagnosis—or the exact muscle—to begin.</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Choose the route that best describes your situation. We suggest the next useful check, not label a condition.</p></div>
        </div>
      </div></section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
        {path === null ? <EntryChoice onChoose={setPath} /> : <div>
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 text-sm font-bold hover:underline"><ArrowLeft className="h-4 w-4" /> Change starting point</button>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Route {entryPaths.findIndex((item) => item.id === path) + 1} of 3</p>
          </div>
          {path === "pain" && <PainPath hasRedFlag={hasRedFlag} onAnswer={setHasRedFlag} />}
          {path === "screen" && <ScreenPath selected={selectedPattern} onSelect={setSelectedPattern} />}
          {path === "area" && <AreaPath selected={selectedArea} onSelect={setSelectedArea} />}
        </div>}
      </section>

      <section className="border-t border-border bg-secondary/50"><div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 text-sm text-muted-foreground md:grid-cols-[auto_1fr] lg:px-8"><ShieldAlert className="h-5 w-5 text-foreground" /><p className="max-w-4xl leading-relaxed">This educational check does not diagnose an injury or replace individualized medical care. Stop if a movement causes pain, dizziness, numbness, or a sense of instability.</p></div></section>
    </main><SiteFooter />
  </div>;
}

function EntryChoice({ onChoose }: { onChoose: (id: PathId) => void }) {
  return <div><div className="flex items-end justify-between gap-6"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Step 01 / Choose a route</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">What brings you here today?</h2></div><p className="hidden max-w-sm text-right text-sm text-muted-foreground md:block">One answer is enough. You can change routes at any time.</p></div>
    <div className="mt-7 grid gap-4 lg:grid-cols-3">{entryPaths.map(({ id, number, icon: IconView, eyebrow, title, copy, action }) => <button key={id} type="button" onClick={() => onChoose(id)} className="group flex min-h-[19rem] flex-col rounded-sm border border-border bg-card p-6 text-left transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-foreground hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-8">
      <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold tracking-widest text-muted-foreground">{number}</span><span className="grid h-11 w-11 place-items-center rounded-full bg-secondary group-hover:bg-accent"><IconView className="h-5 w-5" /></span></div>
      <p className="mt-9 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p><h3 className="mt-2 text-2xl font-extrabold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p><span className="mt-auto flex items-center gap-2 pt-8 text-sm font-bold">{action} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
    </button>)}</div>
  </div>;
}

function PainPath({ hasRedFlag, onAnswer }: { hasRedFlag: boolean | null; onAnswer: (answer: boolean) => void }) {
  return <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Pain route / Safety first</p><h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] sm:text-5xl">Do any of these apply?</h2><p className="mt-5 max-w-md leading-relaxed text-muted-foreground">Pain changes the pathway. Before checking movement performance, rule out signs that need prompt professional assessment.</p></div>
    <div className="rounded-sm border border-border bg-card"><ul className="divide-y divide-border">{redFlags.map((flag) => <li key={flag} className="flex gap-3 px-5 py-4 text-sm leading-relaxed sm:px-7"><BadgeAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> {flag}</li>)}</ul>
      <div className="grid gap-3 border-t border-border p-5 sm:grid-cols-2 sm:p-7"><button type="button" onClick={() => onAnswer(true)} className={`rounded-sm border px-5 py-4 text-sm font-bold ${hasRedFlag === true ? "border-foreground bg-foreground text-background" : "border-border"}`}>Yes, one or more</button><button type="button" onClick={() => onAnswer(false)} className={`rounded-sm border px-5 py-4 text-sm font-bold ${hasRedFlag === false ? "border-accent bg-accent" : "border-border"}`}>No, none of these</button></div>
      {hasRedFlag !== null && <div className={`border-t p-6 sm:p-8 ${hasRedFlag ? "border-red-300 bg-red-50" : "border-border bg-secondary/50"}`}><p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]">Recommended next step</p><h3 className="mt-2 text-xl font-extrabold">{hasRedFlag ? "Pause self-testing and seek appropriate care." : "Use a gentle regional check."}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hasRedFlag ? "A qualified healthcare professional can assess these symptoms and tell you when self-guided movement is appropriate." : "Pain still deserves context. Choose the painful area, keep every movement comfortable, and stop if symptoms increase."}</p></div>}
    </div>
  </div>;
}

function ScreenPath({ selected, onSelect }: { selected: string; onSelect: (name: string) => void }) {
  const [started, setStarted] = useState(false);
  const [observation, setObservation] = useState<string | null>(null);
  const current = patterns.find((item) => item.name === selected) ?? patterns[0];
  const result = squatObservations.find((item) => item.id === observation);
  const choosePattern = (name: string) => {
    onSelect(name);
    setStarted(false);
    setObservation(null);
  };
  return <div><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Whole-body route / No current pain</p><h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] sm:text-5xl">Start broad. Then narrow it down.</h2></div><p className="max-w-md text-sm leading-relaxed text-muted-foreground">The overhead squat is the broadest first look. Other patterns reveal what a squat can hide, especially asymmetry and trunk control.</p></div>
    {!started && <><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{patterns.map(({ icon: IconView, name, focus, featured }) => { const active = selected === name; return <button key={name} type="button" onClick={() => choosePattern(name)} className={`relative min-h-48 rounded-sm border p-5 text-left transition-colors ${active ? "border-foreground bg-accent" : "border-border bg-card hover:border-foreground/50"} ${featured ? "md:col-span-2" : ""}`}>{featured && <span className="absolute right-4 top-4 bg-foreground px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-background">Start here</span>}<IconView className="h-5 w-5" /><h3 className="mt-10 text-xl font-extrabold">{name}</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{focus}</p></button>; })}</div>
    <div className="mt-5 grid gap-5 rounded-sm bg-ink p-6 text-ink-foreground sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Selected check</p><h3 className="mt-2 text-2xl font-extrabold">{current.name}</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-foreground/65">{current.focus} The result chooses the next check—not a diagnosis or a weak muscle from appearance alone.</p></div><button type="button" onClick={() => setStarted(true)} className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-4 text-sm font-bold text-accent-foreground"><Play className="h-4 w-4" /> Begin this check</button></div></>}

    {started && <div className="mt-8 overflow-hidden rounded-sm border border-foreground bg-card">
      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="border-b border-border bg-ink p-6 text-ink-foreground lg:border-b-0 lg:border-r sm:p-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Step 02 / Perform</p>
          <h3 className="mt-3 text-3xl font-black uppercase">{selected}</h3>
          {selected === "Overhead squat" ? <ol className="mt-7 space-y-5 text-sm leading-relaxed text-ink-foreground/75">
            <li className="flex gap-3"><span className="font-mono text-accent">01</span><span>Stand with feet around shoulder width and toes facing comfortably forward.</span></li>
            <li className="flex gap-3"><span className="font-mono text-accent">02</span><span>Reach both arms overhead. Use a light stick only if it helps you keep the position consistent.</span></li>
            <li className="flex gap-3"><span className="font-mono text-accent">03</span><span>Perform up to three comfortable squats. Use front and side video if available.</span></li>
          </ol> : <p className="mt-6 text-sm leading-relaxed text-ink-foreground/70">Perform three comfortable repetitions without forcing range. Compare sides where the pattern allows it, and stop immediately if it causes pain.</p>}
          <button type="button" onClick={() => { setStarted(false); setObservation(null); }} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-ink-foreground/70 hover:text-ink-foreground"><ArrowLeft className="h-4 w-4" /> Choose another check</button>
        </div>
        <div className="p-6 sm:p-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Step 03 / What did you notice?</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Choose the closest observation. This does not identify a diagnosis or a single muscle cause.</p>
          <div className="mt-6 grid gap-2">{(selected === "Overhead squat" ? squatObservations : squatObservations.filter((item) => ["clear", "shift", "trunk", "pain"].includes(item.id))).map((item) => <button key={item.id} type="button" onClick={() => setObservation(item.id)} className={`flex items-center gap-3 rounded-sm border px-4 py-3 text-left text-sm font-semibold transition-colors ${observation === item.id ? "border-foreground bg-accent" : "border-border hover:border-foreground/50"}`}>{observation === item.id ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <span className="h-5 w-5 shrink-0 rounded-full border border-border" />}{item.label}</button>)}</div>
          {result && <div className={`mt-6 rounded-sm border-l-4 p-5 ${result.id === "pain" ? "border-red-500 bg-red-50" : "border-accent bg-secondary"}`}><p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Recommended next check</p><h4 className="mt-2 text-xl font-extrabold">{result.next}</h4><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.reason}</p>{result.id === "pain" ? <button type="button" onClick={() => { setStarted(false); setObservation(null); }} className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline">Return and choose the pain route <ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={() => { const next = result.id === "arms" ? "Shoulder reach" : result.id === "clear" || result.id === "knees" || result.id === "shift" ? "Step" : "Straight-leg raise"; choosePattern(next); }} className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline">Select the next check <ArrowRight className="h-4 w-4" /></button>}</div>}
        </div>
      </div>
    </div>}
  </div>;
}

function AreaPath({ selected, onSelect }: { selected: string | null; onSelect: (name: string) => void }) {
  const current = areas.find((item) => item.name === selected);
  return <div><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Regional route / Direct access</p><h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] sm:text-5xl">Where do you want to start?</h2></div><div className="flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-3 text-sm text-muted-foreground"><Search className="h-4 w-4" /> Region first. Muscle second.</div></div>
    <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">{areas.map(({ icon: IconView, name, detail }) => { const active = selected === name; return <button key={name} type="button" onClick={() => onSelect(name)} className={`group min-h-52 p-6 text-left transition-colors sm:p-7 ${active ? "bg-accent" : "bg-card hover:bg-secondary"}`}><div className="flex items-center justify-between"><IconView className="h-5 w-5" />{active ? <Check className="h-5 w-5" /> : <ArrowRight className="h-4 w-4 opacity-35 group-hover:opacity-100" />}</div><h3 className="mt-10 text-xl font-extrabold">{name}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p></button>; })}</div>
    {current && <div className="mt-5 flex flex-col gap-5 rounded-sm border border-foreground bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Your starting area</p><h3 className="mt-2 text-2xl font-extrabold">{current.name}</h3><p className="mt-1 text-sm text-muted-foreground">Next: choose a movement, condition, or specific muscle in this region.</p></div><Link to="/" hash="programs" className="inline-flex items-center justify-center gap-2 rounded-sm bg-foreground px-6 py-4 text-sm font-bold text-background">Explore this area <ArrowRight className="h-4 w-4" /></Link></div>}
    <div className="mt-5 flex items-start gap-3 rounded-sm bg-secondary p-5 text-sm text-muted-foreground"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-foreground" /><p>If you know the muscle name already, the muscle atlas remains available as a direct shortcut rather than a required first step.</p></div>
  </div>;
}
