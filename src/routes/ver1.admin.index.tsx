import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { programs, orders, customers, lessons } from "@/lib/admin-mock";

export const Route = createFileRoute("/ver1/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — LegitBodyFix Admin" },
      { name: "description", content: "Glanceable overview of programs, orders and signups." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const live = programs.filter((p) => p.status === "Live").length;
  const stats = [
    { label: "Programs", value: String(programs.length), note: `${live} live / ${programs.length - live} coming soon` },
    { label: "Lessons", value: String(lessons.length), note: `${lessons.filter((l) => l.status === "Draft").length} still draft` },
    { label: "Customers", value: String(customers.length), note: "3 new this week" },
    { label: "Revenue (mock)", value: "$363", note: "Last 30 days" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead title="Control room" meta="Mock overview · resets on refresh" />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Panel key={s.label} className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-extrabold tracking-tight">Recent orders</h2>
            <Link to="/ver1/admin/orders" className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Program</Th>
                <Th className="text-right">Amount</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <Td className="font-mono text-xs">{o.id}</Td>
                  <Td>{o.customer}</Td>
                  <Td className="text-muted-foreground">{o.program}</Td>
                  <Td className="text-right font-mono text-xs">${o.amount}</Td>
                  <Td>
                    <Tag tone={o.status === "Paid" ? "accent" : o.status === "Refunded" ? "warn" : "muted"}>
                      {o.status}
                    </Tag>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-extrabold tracking-tight">Recent signups</h2>
            <Link to="/ver1/admin/customers" className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border/70">
            {customers.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{c.email}</p>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{c.signup}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-4">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-extrabold tracking-tight">Program status</h2>
        </div>
        <ul className="divide-y divide-border/70">
          {programs.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="min-w-52 flex-1 text-sm font-medium">{p.title}</span>
              <span className="font-mono text-xs text-muted-foreground">{p.lessons} lessons</span>
              <span className="font-mono text-xs">${p.price}</span>
              <Tag tone={p.status === "Live" ? "accent" : "muted"}>{p.status}</Tag>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

