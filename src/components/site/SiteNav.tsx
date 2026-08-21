import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Start Here", href: "#movement-check" },
  { label: "Programs", href: "#programs" },
  { label: "Method", href: "#method" },
  { label: "Explore", href: "#library" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-8">
        <Link to="/" className="min-w-0 truncate text-lg font-extrabold tracking-tight">
          LegitBodyFix
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              to="/"
              hash={l.href.slice(1)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="/library.html"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            My Library
          </a>
          <Link
            to="/movement-check"
            className="rounded-sm bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            Take the Free Movement Check
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-sm border border-border lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-5 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.label}
                to="/"
                hash={l.href.slice(1)}
                onClick={() => setOpen(false)}
                className="border-b border-border py-4 text-base font-medium"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="/library.html"
              onClick={() => setOpen(false)}
              className="border-b border-border py-4 text-base font-medium"
            >
              My Library
            </a>
            <Link
              to="/movement-check"
              onClick={() => setOpen(false)}
              className="mt-5 rounded-sm bg-accent px-4 py-3.5 text-center text-sm font-bold text-accent-foreground"
            >
              Take the Free Movement Check
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
