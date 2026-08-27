import { useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";

type SessionCategory =
  "Neck & shoulders" | "Ankle & foot" | "Hips & balance" | "Breathing & recovery";

type FeaturedSession = {
  id: string;
  level: "FOUNDATIONAL" | "INTERMEDIATE";
  moduleNumber: number;
  title: string;
  category: SessionCategory;
  durationMinutes: number;
  equipment: string;
  price: number;
  thumbnailUrl?: string;
  fallback: string;
};

const categories: Array<"All" | SessionCategory> = [
  "All",
  "Neck & shoulders",
  "Ankle & foot",
  "Hips & balance",
  "Breathing & recovery",
];

const sessions: FeaturedSession[] = [
  {
    id: "neck-alignment",
    level: "FOUNDATIONAL",
    moduleNumber: 1,
    title: "Neck Alignment",
    category: "Neck & shoulders",
    durationMinutes: 12,
    equipment: "Bodyweight",
    price: 45,
    thumbnailUrl:
      "https://pub-5fe73d4ab1934bd99b41f77568617c00.r2.dev/thumbnails/2026-07/1785162514945-a92a560beb9397100d6dfc71-neck.png",
    fallback: "from-stone-700 via-stone-800 to-neutral-950",
  },
  {
    id: "ankle-sprain-rehabilitation",
    level: "INTERMEDIATE",
    moduleNumber: 2,
    title: "Ankle Sprain Rehabilitation",
    category: "Ankle & foot",
    durationMinutes: 14,
    equipment: "Resistance band",
    price: 14,
    thumbnailUrl:
      "https://pub-5fe73d4ab1934bd99b41f77568617c00.r2.dev/thumbnails/2026-07/1785530416111-28bf1c484c1f7bb75f197f9a-ankle-sprain.jpg",
    fallback: "from-amber-900 via-stone-800 to-neutral-950",
  },
  {
    id: "pelvic-balance",
    level: "FOUNDATIONAL",
    moduleNumber: 3,
    title: "Pelvic Balance",
    category: "Hips & balance",
    durationMinutes: 15,
    equipment: "Bodyweight",
    price: 15,
    fallback: "from-stone-400 via-stone-600 to-neutral-950",
  },
  {
    id: "foot-mechanics",
    level: "FOUNDATIONAL",
    moduleNumber: 4,
    title: "Foot Mechanics",
    category: "Ankle & foot",
    durationMinutes: 10,
    equipment: "Bodyweight",
    price: 10,
    fallback: "from-zinc-300 via-stone-600 to-neutral-950",
  },
  {
    id: "walking-mechanics",
    level: "INTERMEDIATE",
    moduleNumber: 5,
    title: "Walking Mechanics",
    category: "Hips & balance",
    durationMinutes: 18,
    equipment: "Bodyweight",
    price: 16,
    fallback: "from-neutral-400 via-zinc-700 to-black",
  },
  {
    id: "breathing-fundamentals",
    level: "FOUNDATIONAL",
    moduleNumber: 6,
    title: "Breathing Fundamentals",
    category: "Breathing & recovery",
    durationMinutes: 8,
    equipment: "Guided",
    price: 8,
    fallback: "from-stone-300 via-neutral-600 to-stone-950",
  },
];

export function FeaturedPrograms() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const visibleSessions =
    activeCategory === "All"
      ? sessions
      : sessions.filter((session) => session.category === activeCategory);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" aria-label="Filter sessions by goal">
        <span className="mr-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Filter by goal
        </span>
        {categories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveCategory(category)}
              className={`min-h-9 border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive
                  ? "border-foreground bg-foreground text-[#c8ff2c]"
                  : "border-border bg-background text-foreground hover:border-foreground"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {visibleSessions.map((session) => (
          <a
            key={session.id}
            href={`/video.html?id=${encodeURIComponent(session.id)}`}
            aria-label={`View ${session.title} session`}
            className={`group relative isolate flex min-h-[23rem] overflow-hidden border border-neutral-800 bg-gradient-to-b ${session.fallback} p-5 text-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_7px_0_#c8ff2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff2c] focus-visible:ring-offset-2`}
          >
            {session.thumbnailUrl ? (
              <img
                src={session.thumbnailUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            ) : null}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-black/30 to-black/90" />

            <div className="flex w-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className="bg-[#c8ff2c] px-3 py-1 font-mono text-[10px] font-bold text-black">
                  {session.level}
                </span>
                <span className="grid size-9 place-items-center rounded-full border border-white/80 text-white transition group-hover:border-[#c8ff2c] group-hover:text-[#c8ff2c]">
                  <Play className="ml-0.5 size-4" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-auto">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#c8ff2c]">
                  Module {String(session.moduleNumber).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold leading-none tracking-tight">
                  {session.title}
                </h3>
                <p className="mt-2 font-mono text-[11px] font-medium text-white/90">
                  {session.durationMinutes} min · {session.equipment} · ${session.price}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/30 pt-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#c8ff2c]">
                    {session.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#c8ff2c]">
                    View session
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
