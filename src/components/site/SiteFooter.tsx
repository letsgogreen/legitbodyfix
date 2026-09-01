import { Link } from "@tanstack/react-router";
export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="text-xl font-extrabold">LegitBodyFix</p>
            <p className="mt-2 text-sm text-ink-foreground/60">Build more movement options.</p>
          </div>

          <div>
            <p className="font-mono text-xs tracking-widest text-accent">EXPLORE</p>
            <ul className="mt-4 space-y-3 text-sm text-ink-foreground/70">
              <li>
                <a
                  href="/#regions"
                  className="rounded-sm hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Body regions
                </a>
              </li>
              <li>
                <a
                  href="/#programs"
                  className="rounded-sm hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Programs
                </a>
              </li>
              <li>
                <a
                  href="/#method"
                  className="rounded-sm hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  How it works
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs tracking-widest text-accent">START</p>
            <Link
              to="/movement-check"
              className="mt-4 inline-flex min-h-11 items-center rounded-sm bg-accent px-4 py-3 text-sm font-bold text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ink-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              Find my starting point
            </Link>
          </div>
        </div>

        <div className="mt-14 border-t border-ink-foreground/15 pt-6 text-xs text-ink-foreground/50">
          <p>Educational content only. Not a substitute for medical diagnosis or treatment.</p>
          <nav aria-label="Legal" className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/terms" className="hover:text-ink-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-ink-foreground">Privacy</Link>
            <Link to="/refund-policy" className="hover:text-ink-foreground">Refund policy</Link>
          </nav>
          <p className="mt-2">© {new Date().getFullYear()} LegitBodyFix · Movement System</p>
        </div>
      </div>
    </footer>
  );
}
