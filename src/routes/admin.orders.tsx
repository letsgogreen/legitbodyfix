import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Program = Database["public"]["Tables"]["programs"]["Row"];

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders & access — LegitBodyFix Admin" }, { name: "robots", content: "noindex" }] }),
  component: OrdersView,
});

function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [orderResult, programResult] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("programs").select("*").order("name"),
      ]);
      const failure = orderResult.error ?? programResult.error;
      if (failure) setError(failure.message);
      else {
        setOrders(orderResult.data ?? []);
        setPrograms(programResult.data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const visible = filter === "all" ? orders : orders.filter((order) => order.status === filter);
  const paidTotal = useMemo(
    () => orders.filter((order) => order.status === "paid").reduce((sum, order) => sum + order.amount_total, 0),
    [orders],
  );
  const programName = (id: string | null) => programs.find((program) => program.id === id)?.name ?? "Unknown program";

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead title="Orders & access" meta={`${orders.length} records · ${(paidTotal / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })} paid`} />
      {error && <div className="mt-5 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
      <div className="mt-5 flex flex-wrap gap-2">
        {["all", "paid", "pending", "refunded", "failed", "disputed"].map((status) => (
          <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-sm border px-3 py-1.5 text-xs font-bold capitalize ${filter === status ? "border-ink bg-ink text-ink-foreground" : "border-border bg-background text-muted-foreground"}`}>
            {status}
          </button>
        ))}
      </div>
      <Panel className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="flex min-h-44 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading orders…</div>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead><tr><Th>Customer</Th><Th>Program</Th><Th>Amount</Th><Th>Status</Th><Th>Purchased</Th><Th>Provider reference</Th></tr></thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="hover:bg-secondary/50">
                  <Td>{order.customer_email || "Email unavailable"}</Td>
                  <Td>{programName(order.program_id)}</Td>
                  <Td className="font-mono text-xs">{(order.amount_total / 100).toLocaleString("en-US", { style: "currency", currency: order.currency.toUpperCase() })}</Td>
                  <Td><Tag tone={order.status === "paid" ? "accent" : "muted"}>{order.status}</Tag></Td>
                  <Td className="font-mono text-xs text-muted-foreground">{new Date(order.purchased_at ?? order.created_at).toLocaleString()}</Td>
                  <Td className="max-w-56 truncate font-mono text-[10px] text-muted-foreground">{order.provider || "legacy"}: {order.paddle_transaction_id || order.stripe_checkout_session_id || order.stripe_payment_intent_id || "—"}</Td>
                </tr>
              ))}
              {!visible.length && <tr><Td colSpan={6} className="py-12 text-center text-muted-foreground">No orders in this view.</Td></tr>}
            </tbody>
          </table>
        )}
      </Panel>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">Paddle notifications create and update new orders. Historical Stripe records remain visible and read-only.</p>
    </div>
  );
}
