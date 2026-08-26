import { Outlet, Link, createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Dumbbell,
  PlaySquare,
  Activity,
  Users,
  Receipt,
  PanelsTopLeft,
  NotebookPen,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";

export const Route = createFileRoute("/ver1/admin")({
  head: () => ({
    meta: [
      { title: "Admin control room — LegitBodyFix" },
      {
        name: "description",
        content: "Secure LegitBodyFix control room for content, programs and customer access.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin control room — LegitBodyFix" },
      {
        property: "og:description",
        content: "Secure tools for running LegitBodyFix day to day.",
      },
    ],
  }),
  component: AdminShell,
});

type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean };

const nav: NavItem[] = [
  { to: "/ver1/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/ver1/admin/programs", label: "Programs", icon: Dumbbell },
  { to: "/ver1/admin/lessons", label: "Lessons & videos", icon: PlaySquare },
  { to: "/ver1/admin/muscles", label: "Muscle library", icon: Activity },
  { to: "/ver1/admin/recipes", label: "Recipes", icon: NotebookPen },
  { to: "/ver1/admin/recipes/import", label: "Recipe import", icon: NotebookPen },
  { to: "/ver1/admin/customers", label: "Customers", icon: Users },
  { to: "/ver1/admin/orders", label: "Orders & access", icon: Receipt },
  { to: "/ver1/admin/content", label: "Website content", icon: PanelsTopLeft },
];

function AdminShell() {
  return (
    <AdminAuthGate redirectPath="/ver1/admin">
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-secondary/40 lg:flex">
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
            <span className="h-3 w-3 rounded-full bg-accent" aria-hidden />
            <span className="text-sm font-extrabold tracking-tight">LegitBodyFix</span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Admin
            </span>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 p-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to as never}
                activeOptions={{ exact: item.exact ?? false }}
                activeProps={{ className: "bg-ink text-ink-foreground" }}
                inactiveProps={{
                  className: "text-muted-foreground hover:bg-secondary hover:text-foreground",
                }}
                className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border p-3">
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground">
              Protected administrator workspace
            </p>
            <Link
              to="/"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold hover:text-muted-foreground"
            >
              View public site <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-secondary/40 px-3 py-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to as never}
                activeOptions={{ exact: item.exact ?? false }}
                activeProps={{ className: "bg-ink text-ink-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="shrink-0 rounded-sm border border-border px-2.5 py-1.5 text-xs font-bold"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminAuthGate>
  );
}

