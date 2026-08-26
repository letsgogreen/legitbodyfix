import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { orders, type OrderStatus } from "@/lib/admin-mock";

export const Route = createFileRoute("/ver1/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders & access — LegitBodyFix Admin" },
      { name: "description", content: "Read-only mock order ledger with customer, program and status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersView,
});

const filters: Array<OrderStatus | "All"> = ["All", "Paid", "Pending", "Refunded"];

function OrdersView() {
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const rows = filter === "All" ? orders : orders.filter((o) => o.status === filter);
  const total = rows.filter((o) => o.status === "Paid").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead title="Orders & access" meta="Read-only mock ledger · amounts are not editable" />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-sm border px-3 py-1.5 text-xs font-bold ${
              f === filter
                ? "border-ink bg-ink text-ink-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Paid total (mock): ${total}
        </span>
      </div>

      <Panel className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Program</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th>Access</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-secondary/50">
                <Td className="font-mono text-xs">{o.id}</Td>
                <Td className="font-mono text-xs text-muted-foreground">{o.date}</Td>
                <Td className="font-medium">{o.customer}</Td>
                <Td className="text-muted-foreground">{o.program}</Td>
                <Td className="text-right font-mono text-xs">${o.amount}</Td>
                <Td>
                  <Tag tone={o.status === "Paid" ? "accent" : o.status === "Refunded" ? "warn" : "muted"}>
                    {o.status}
                  </Tag>
                </Td>
                <Td className="font-mono text-[11px] text-muted-foreground">
                  {o.status === "Paid" ? "Granted" : o.status === "Refunded" ? "Revoked" : "Pending"}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Order amounts are displayed as recorded. Refunds and price changes happen in the payment provider, not here.
      </p>
    </div>
  );
}

