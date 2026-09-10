import { Link } from "@tanstack/react-router";

export function CustomerAccessTabs({ current }: { current: "customers" | "orders" }) {
  const tabs = [
    { key: "customers", label: "Customers & access", to: "/admin/customers" },
    { key: "orders", label: "Order history", to: "/admin/orders" },
  ] as const;

  return (
    <nav aria-label="Customers and access" className="mt-5 flex gap-2 border-b border-border pb-3">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.to}
          aria-current={current === tab.key ? "page" : undefined}
          className={`inline-flex min-h-10 items-center rounded-sm px-3 text-xs font-bold ${
            current === tab.key
              ? "bg-ink text-ink-foreground"
              : "border border-border bg-background text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
