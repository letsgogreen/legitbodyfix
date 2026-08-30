import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/checkout/complete")({
  head: () => ({ meta: [{ title: "Payment received — LegitBodyFix" }, { name: "robots", content: "noindex" }] }),
  component: CheckoutComplete,
});

function CheckoutComplete() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="border border-border bg-card p-7 sm:p-12">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground"><Check className="h-6 w-6" /></span>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Payment received</p>
          <h1 className="mt-3 text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">Your program is being unlocked.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
            Open the library with the same email used at checkout. It may take a few seconds for the purchase to appear.
          </p>
          <Link to="/library" className="mt-8 inline-flex min-h-12 items-center gap-2 bg-ink px-6 text-sm font-bold text-ink-foreground">
            Open my library <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
