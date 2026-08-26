import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { customers } from "@/lib/admin-mock";

export const Route = createFileRoute("/ver1/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — LegitBodyFix Admin" },
      { name: "description", content: "Mock customer table with fake placeholder names and emails." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomersView,
});

function CustomersView() {
  const [q, setQ] = useState("");
  const rows = customers.filter(
    (c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead title="Customers" meta={`${customers.length} records · fake placeholder data`} />

      <div className="mt-5 flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <Panel className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Signed up</Th>
              <Th>Programs owned</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/50">
                <Td className="font-medium">{c.name}</Td>
                <Td className="font-mono text-xs text-muted-foreground">{c.email}</Td>
                <Td className="font-mono text-xs text-muted-foreground">{c.signup}</Td>
                <Td>
                  {c.owns.length === 0 ? (
                    <span className="font-mono text-[11px] text-muted-foreground">No purchases</span>
                  ) : (
                    <span className="flex flex-wrap gap-1.5">
                      {c.owns.map((o) => (
                        <Tag key={o}>{o}</Tag>
                      ))}
                    </span>
                  )}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <Td className="text-muted-foreground">No matches.</Td>
                <Td /> <Td /> <Td />
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

