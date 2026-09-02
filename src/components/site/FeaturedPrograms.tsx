import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Loader2, ShoppingBag } from "lucide-react";
import { getPublicPrograms, type PublicProgram } from "@/lib/public-programs.functions";
import { usePaddle } from "@/lib/usePaddle";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Neck & shoulders", "Ankle & foot", "Hips & balance", "Breathing & recovery"] as const;
type Category = (typeof categories)[number];

function categoryOf(program: PublicProgram): Exclude<Category, "All"> {
  const value = [...program.regions, ...program.goals].join(" ").toLowerCase();
  if (/ankle|foot|hallux|bunion/.test(value)) return "Ankle & foot";
  if (/hip|pelvi|balance|knee/.test(value)) return "Hips & balance";
  if (/breath|rib|recovery/.test(value)) return "Breathing & recovery";
  return "Neck & shoulders";
}

export function FeaturedPrograms() {
  const [programs, setPrograms] = useState<PublicProgram[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getPublicPrograms()
      .then((rows) => { if (active) setPrograms(rows); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Programs could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visiblePrograms = useMemo(
    () => activeCategory === "All" ? programs : programs.filter((program) => categoryOf(program) === activeCategory),
    [activeCategory, programs],
  );

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading programs…</div>;
  if (error) return <div className="border border-destructive/40 bg-destructive/5 px-5 py-8 text-sm text-destructive">{error}</div>;
  if (!programs.length) return <div className="border border-border bg-card px-6 py-12"><h3 className="text-2xl font-extrabold">Programs are being prepared.</h3><p className="mt-2 text-sm text-muted-foreground">Published programs will appear here automatically.</p></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" aria-label="Filter programs by goal">
        <span className="mr-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Filter by goal</span>
        {categories.map((category) => (
          <button key={category} type="button" aria-pressed={category === activeCategory} onClick={() => setActiveCategory(category)} className={`min-h-9 border px-3 text-xs font-bold transition-colors ${category === activeCategory ? "border-foreground bg-foreground text-accent" : "border-border bg-background hover:border-foreground"}`}>
            {category}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {visiblePrograms.map((program, index) => (
          <article key={program.id} className="group relative isolate flex min-h-[25rem] overflow-hidden bg-neutral-900 p-5 text-white shadow-sm transition duration-200 sm:aspect-square sm:min-h-0">
            {program.imageUrl && <img src={program.imageUrl} alt={program.imageAlt ?? ""} loading="lazy" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/5 via-black/20 to-black/90" />
            <div className="flex w-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className="bg-accent px-3 py-1 font-mono text-[10px] font-bold text-accent-foreground">{program.level?.toUpperCase() || "GUIDED"}</span>
                <Link to="/programs/$programSlug" params={{ programSlug: program.slug }} aria-label={`View ${program.name}`} className="grid size-10 place-items-center rounded-full border border-white/80 text-white transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"><ArrowUpRight className="h-4 w-4" /></Link>
              </div>
              <div className="mt-auto">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Program {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-2xl font-extrabold leading-none tracking-tight sm:text-[1.65rem]">{program.name}</h3>
                <p className="mt-3 font-mono text-[11px] text-white/90">{[program.duration, program.format, program.price].filter(Boolean).join(" · ")}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"><span>{categoryOf(program)}</span><Link to="/programs/$programSlug" params={{ programSlug: program.slug }} className="border-b border-accent text-accent transition-colors hover:text-white">View program →</Link></div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!visiblePrograms.length && <p className="mt-6 border border-border bg-card px-5 py-8 text-sm text-muted-foreground">No published programs in this category yet.</p>}
    </div>
  );
}

export function CheckoutButton({ program }: { program: PublicProgram }) {
  const { paddle, loading, error: configurationError } = usePaddle();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!program.paddlePriceId) return <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">Coming soon</span>;

  async function openCheckout() {
    setError(null);
    if (!paddle || !program.paddlePriceId) {
      setError("Checkout is still loading. Try again in a moment.");
      return;
    }
    setWorking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      paddle.Checkout.open({
        items: [{ priceId: program.paddlePriceId, quantity: 1 }],
        customer: email ? { email } : undefined,
        customData: {
          program_id: program.id,
          program_slug: program.slug,
        },
        settings: { successUrl: `${window.location.origin}/checkout/complete`, allowLogout: false },
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout could not be opened.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div>
      <button type="button" disabled={!paddle || working} onClick={() => void openCheckout()} className="inline-flex min-h-11 w-full items-center justify-between gap-3 bg-accent px-4 text-sm font-bold text-accent-foreground disabled:cursor-wait disabled:opacity-60">
        <span className="inline-flex items-center gap-2"><ShoppingBag className="h-4 w-4" />{working ? "Opening checkout…" : loading ? "Loading checkout…" : configurationError ? "Checkout unavailable" : `Get instant access${program.price ? ` — ${program.price}` : ""}`}</span>
        <ArrowUpRight className="h-4 w-4" />
      </button>
      {configurationError && <p className="mt-2 text-xs text-white/70">{configurationError}</p>}
      {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
    </div>
  );
}
