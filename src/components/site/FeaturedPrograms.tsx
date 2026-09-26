import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { getPublicPrograms, type PublicProgram } from "@/lib/public-programs.functions";
import { useCustomerAccess } from "@/lib/useCustomerAccess";
import { usePaddle } from "@/lib/usePaddle";
import { programSalesHref } from "@/lib/program-sales-links";
import { ProgramCardImpression } from "@/lib/program-funnel";
import { trackProgramFunnel } from "@/lib/program-funnel-client";

const categories = ["All", "Neck & shoulders", "Ankle & foot", "Hips & balance", "Breathing & recovery"] as const;
type Category = (typeof categories)[number];

function categoryOf(program: PublicProgram): Exclude<Category, "All"> {
  const value = [...program.regions, ...program.goals].join(" ").toLowerCase();
  if (/ankle|foot|hallux|bunion/.test(value)) return "Ankle & foot";
  if (/hip|pelvi|balance|knee/.test(value)) return "Hips & balance";
  if (/breath|rib|recovery/.test(value)) return "Breathing & recovery";
  return "Neck & shoulders";
}

export function FeaturedPrograms({ programs, loadFailed = false }: { programs: PublicProgram[]; loadFailed?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [runtimePrograms, setRuntimePrograms] = useState(programs);
  const [runtimeFailed, setRuntimeFailed] = useState(loadFailed);
  const [retrying, setRetrying] = useState(false);

  const visiblePrograms = useMemo(
    () => activeCategory === "All" ? runtimePrograms : runtimePrograms.filter((program) => categoryOf(program) === activeCategory),
    [activeCategory, runtimePrograms],
  );

  const retry = async () => {
    setRetrying(true);
    try {
      setRuntimePrograms(await getPublicPrograms());
      setRuntimeFailed(false);
    } catch {
      setRuntimeFailed(true);
    } finally {
      setRetrying(false);
    }
  };

  if (runtimeFailed) return <div className="min-h-64 border border-destructive/40 bg-destructive/5 px-5 py-8 text-sm text-destructive"><p>Programs could not be loaded.</p><button type="button" disabled={retrying} onClick={() => void retry()} className="mt-5 min-h-11 border border-destructive/50 bg-background px-4 font-bold text-foreground disabled:opacity-50">{retrying ? "Trying again…" : "Try again"}</button></div>;
  if (!runtimePrograms.length) return <div className="border border-border bg-card px-6 py-12"><h3 className="text-2xl font-extrabold">Programs are being prepared.</h3><p className="mt-2 text-sm text-muted-foreground">Published programs will appear here automatically.</p></div>;

  return (
    <div>
      <div className="-mx-4 flex snap-x items-center gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" aria-label="Filter programs by goal">
        <span className="mr-2 shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Filter</span>
        {categories.map((category) => (
          <button key={category} type="button" aria-pressed={category === activeCategory} onClick={() => setActiveCategory(category)} className={`min-h-10 shrink-0 snap-start border px-3 text-xs font-bold transition-colors ${category === activeCategory ? "border-foreground bg-foreground text-accent" : "border-border bg-background hover:border-foreground"}`}>
            {category}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {visiblePrograms.map((program, index) => (
          <ProgramCardImpression key={program.id} program={program}>
          <article key={program.id} className="group relative isolate flex min-h-[21rem] overflow-hidden bg-neutral-900 p-5 text-white shadow-sm transition duration-200 sm:aspect-square sm:min-h-0">
            {program.imageUrl && <img src={program.imageUrl} alt={program.imageAlt ?? ""} loading="lazy" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/5 via-black/20 to-black/90" />
            <div className="flex w-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className="bg-accent px-3 py-1 font-mono text-[10px] font-bold text-accent-foreground">{program.level?.toUpperCase() || "GUIDED"}</span>
                <a href={programSalesHref(program.slug)} onClick={() => trackProgramFunnel("card_click", program)} aria-label={`See what is included in ${program.name}`} className="grid size-10 place-items-center rounded-full border border-white/80 text-white transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"><ArrowUpRight className="h-4 w-4" /></a>
              </div>
              <div className="mt-auto">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Program {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-2xl font-extrabold leading-none tracking-tight sm:text-[1.65rem]">{program.name}</h3>
                {program.saleLabel && <p className="mt-3 inline-block bg-accent px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[.12em] text-accent-foreground">{program.saleLabel}</p>}<p className="mt-3 font-mono text-[11px] text-white/90">{[program.duration, program.format, program.originalPrice ? `${program.originalPrice} → ${program.price}` : program.price].filter(Boolean).join(" · ")}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"><span>{categoryOf(program)}</span><a href={programSalesHref(program.slug)} onClick={() => trackProgramFunnel("card_click", program)} className="border-b border-accent text-accent transition-colors hover:text-white">See what’s included →</a></div>
              </div>
            </div>
          </article>
          </ProgramCardImpression>
        ))}
      </div>
      {!visiblePrograms.length && <p className="mt-6 border border-border bg-card px-5 py-8 text-sm text-muted-foreground">No published programs in this category yet.</p>}
    </div>
  );
}

export function CheckoutButton({ program }: { program: PublicProgram }) {
  const access = useCustomerAccess(program.id);
  if (access.loading) return <p role="status" className="text-sm">Checking your access…</p>;
  if (access.error) return <div><p role="alert" className="text-sm">Could not verify your access. Please open your library before purchasing.</p><Link to="/library" className="underline">Open my library</Link></div>;
  if (access.owned) return <Link to="/library/$programSlug" params={{ programSlug: program.slug }} className="inline-flex min-h-11 w-full items-center justify-center bg-accent px-4 text-sm font-bold text-accent-foreground">Watch program →</Link>;
  return <div><PurchaseButton program={program} /><Link to="/library" className="mt-3 inline-block text-sm underline underline-offset-4">Already have access? Sign in / Open my library</Link></div>;
}

function PurchaseButton({ program }: { program: PublicProgram }) {
  const { paddle, loading, error } = usePaddle();
  const priceId = program.paddlePriceId;

  const openCheckout = () => {
    if (!paddle || !priceId) return;
    trackProgramFunnel("checkout_click", program);
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        displayMode: "overlay",
        variant: "one-page",
        theme: "light",
        successUrl: `${window.location.origin}/checkout/complete`,
      },
      customData: { program_id: program.id },
    });
  };

  return (
    <div>
      <button type="button" onClick={openCheckout} disabled={loading || !paddle || !priceId} className="inline-flex min-h-12 w-full items-center justify-center bg-accent px-5 text-sm font-extrabold text-accent-foreground disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/55">
        {loading ? "Preparing secure checkout…" : priceId ? "Buy with secure checkout" : "Not available for purchase"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-red-200">{error}</p>}
      <p className="mt-3 text-[11px] leading-5 text-white/60">
        One-time purchase processed securely by Paddle. By continuing, you agree to our <Link to="/terms" className="underline underline-offset-2">Terms &amp; Conditions</Link>, <Link to="/refund-policy" className="underline underline-offset-2">Refund Policy</Link>, and <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
      </p>
    </div>
  );
}
