import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { PublicProgram } from "@/lib/public-programs.functions";
import { useCustomerAccess } from "@/lib/useCustomerAccess";
import { captureProgramPayPalOrder, createProgramPayPalOrder, getPayPalClientConfig } from "@/lib/paypal.functions";

const categories = ["All", "Neck & shoulders", "Ankle & foot", "Hips & balance", "Breathing & recovery"] as const;
type Category = (typeof categories)[number];

function categoryOf(program: PublicProgram): Exclude<Category, "All"> {
  const value = [...program.regions, ...program.goals].join(" ").toLowerCase();
  if (/ankle|foot|hallux|bunion/.test(value)) return "Ankle & foot";
  if (/hip|pelvi|balance|knee/.test(value)) return "Hips & balance";
  if (/breath|rib|recovery/.test(value)) return "Breathing & recovery";
  return "Neck & shoulders";
}

function programSalesHref(program: PublicProgram) {
  const salesPages: Record<string, string> = {
    "neck-shoulder-reset": "neck-alignment",
    "ankle-recovery": "ankle-sprain-rehabilitation",
    "shoulder-movement": "shoulder-movement",
    "bunion-hallux-valgus-guide": "bunion-hallux-valgus-guide",
  };
  const salesPage = salesPages[program.slug];
  return salesPage ? `/video.html?id=${salesPage}` : `/programs/${program.slug}`;
}

export function FeaturedPrograms({ programs, loadFailed = false }: { programs: PublicProgram[]; loadFailed?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const visiblePrograms = useMemo(
    () => activeCategory === "All" ? programs : programs.filter((program) => categoryOf(program) === activeCategory),
    [activeCategory, programs],
  );

  if (loadFailed) return <div className="min-h-64 border border-destructive/40 bg-destructive/5 px-5 py-8 text-sm text-destructive">Programs could not be loaded. Please try again shortly.</div>;
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
                <a href={programSalesHref(program)} aria-label={`View ${program.name}`} className="grid size-10 place-items-center rounded-full border border-white/80 text-white transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"><ArrowUpRight className="h-4 w-4" /></a>
              </div>
              <div className="mt-auto">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Program {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-2xl font-extrabold leading-none tracking-tight sm:text-[1.65rem]">{program.name}</h3>
                <p className="mt-3 font-mono text-[11px] text-white/90">{[program.duration, program.format, program.price].filter(Boolean).join(" · ")}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"><span>{categoryOf(program)}</span><a href={programSalesHref(program)} className="border-b border-accent text-accent transition-colors hover:text-white">View program →</a></div>
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
  const access = useCustomerAccess(program.id);
  if (access.loading) return <p role="status" className="text-sm">Checking your access…</p>;
  if (access.error) return <div><p role="alert" className="text-sm">Could not verify your access. Please open your library before purchasing.</p><Link to="/library" className="underline">Open my library</Link></div>;
  if (access.owned) return <Link to="/library/$programSlug" params={{ programSlug: program.slug }} className="inline-flex min-h-11 w-full items-center justify-center bg-accent px-4 text-sm font-bold text-accent-foreground">Watch program →</Link>;
  return <div><PurchaseButton program={program} /><Link to="/library" className="mt-3 inline-block text-sm underline underline-offset-4">Already have access? Sign in / Open my library</Link></div>;
}

function PurchaseButton({ program }: { program: PublicProgram }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function mountPayPal() {
      try {
        const config = await getPayPalClientConfig();
        await loadPayPalSdk(config.clientId);
        if (!active || !containerRef.current || rendered.current || !window.paypal) return;
        rendered.current = true;
        await window.paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
          createOrder: async () => (await createProgramPayPalOrder({ data: { programId: program.id } })).orderId,
          onApprove: async ({ orderID }) => {
            setError(null);
            await captureProgramPayPalOrder({ data: { orderId: orderID } });
            window.location.assign("/library?purchase=complete");
          },
          onCancel: () => setError("Checkout was cancelled. No payment was taken."),
          onError: () => setError("PayPal checkout could not be completed. Please try again."),
        }).render(containerRef.current);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "PayPal checkout is unavailable.");
      }
    }
    void mountPayPal();
    return () => { active = false; };
  }, [program.id]);

  return (
    <div>
      <div ref={containerRef} className="min-h-11" aria-label={`Buy ${program.name} with PayPal`} />
      {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
    </div>
  );
}

type PayPalButtons = {
  Buttons: (options: {
    style: Record<string, string>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel: () => void;
    onError: () => void;
  }) => { render: (element: HTMLElement) => Promise<void> };
};

declare global { interface Window { paypal?: PayPalButtons } }

let paypalSdkPromise: Promise<void> | null = null;
function loadPayPalSdk(clientId: string) {
  if (window.paypal) return Promise.resolve();
  if (paypalSdkPromise) return paypalSdkPromise;
  paypalSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => window.paypal ? resolve() : reject(new Error("PayPal SDK did not initialize."));
    script.onerror = () => reject(new Error("PayPal SDK could not be loaded."));
    document.head.appendChild(script);
  });
  return paypalSdkPromise;
}
