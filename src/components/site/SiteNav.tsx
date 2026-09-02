import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Body regions", href: "/#regions" },
  { label: "Muscle dictionary", href: "/knowledge.html?type=muscles" },
  { label: "Programs", href: "/#programs" },
  { label: "How it works", href: "/#method" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-8">
        <Link
          to="/"
          className="min-w-0 truncate rounded-sm text-lg font-extrabold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          LegitBodyFix
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-sm text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/movement-check"
            className="inline-flex min-h-11 items-center rounded-sm bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Take the Free Movement Check
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-sm border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-5 pb-6 pt-2 lg:hidden">
          <nav id="mobile-navigation" className="flex flex-col">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="min-h-11 border-b border-border py-4 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/movement-check"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-4 py-3.5 text-center text-sm font-bold text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Take the Free Movement Check
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
