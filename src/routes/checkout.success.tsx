import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getCheckoutStatus } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => ({ session_id: typeof search["session_id"] === "string" ? search["session_id"] : "" }),
  head: () => ({ meta: [{ title: "Purchase complete — LegitBodyFix" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  const { session_id: sessionId } = Route.useSearch();
  const [state, setState] = useState<"checking" | "paid" | "pending" | "invalid">("checking");

  useEffect(() => {
    let current = true;
    if (!sessionId) { setState("invalid"); return; }
    void getCheckoutStatus({ data: { sessionId } })
      .then((result) => { if (current) setState(result.paid ? "paid" : "pending"); })
      .catch(() => { if (current) setState("invalid"); });
    return () => { current = false; };
  }, [sessionId]);

  const paid = state === "paid";
  const checking = state === "checking";
  return <div className="min-h-screen bg-background text-foreground"><SiteNav /><main className="grid min-h-[70vh] place-items-center px-5 py-16"><section className="w-full max-w-2xl border border-border bg-card p-8 text-center sm:p-14"><span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${paid ? "bg-accent" : "bg-secondary"}`}>{checking ? <LoaderCircle className="h-6 w-6 animate-spin" /> : paid ? <Check className="h-6 w-6" /> : <TriangleAlert className="h-6 w-6" />}</span><p className="mt-7 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{checking ? "Verifying payment" : paid ? "Payment received" : state === "pending" ? "Payment pending" : "Unable to verify"}</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{checking ? "One moment." : paid ? "Your program is ready." : state === "pending" ? "Your payment is still processing." : "This checkout could not be verified."}</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">{paid ? "Open your library using the same email entered at checkout. New accounts are matched to paid orders automatically." : state === "pending" ? "Wait a moment, then refresh this page. Access is granted only after Stripe confirms payment." : state === "invalid" ? "Use the return link from Stripe Checkout, or contact support if you completed a payment." : "Securely checking the Checkout Session with Stripe."}</p>{paid && <Link to="/library" className="mt-8 inline-flex min-h-12 items-center gap-2 bg-ink px-6 text-sm font-bold text-ink-foreground">Open my library <ArrowRight className="h-4 w-4" /></Link>}</section></main><SiteFooter /></div>;
}
