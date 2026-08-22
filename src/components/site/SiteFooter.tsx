import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="text-xl font-extrabold">LegitBodyFix</p>
            <p className="mt-2 text-sm text-ink-foreground/60">Build more movement options.</p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Youtube, Twitter].map((Icon, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="grid h-11 w-11 place-items-center rounded-sm border border-ink-foreground/20"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs tracking-widest text-accent">EXPLORE</p>
            <ul className="mt-4 space-y-3 text-sm text-ink-foreground/70">
              <li><a href="#movement-check" className="hover:text-ink-foreground">Movement Check</a></li>
              <li><a href="#programs" className="hover:text-ink-foreground">Programs</a></li>
              <li><a href="#method" className="hover:text-ink-foreground">Method</a></li>
              <li><a href="#pricing" className="hover:text-ink-foreground">Pricing</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs tracking-widest text-accent">START</p>
            <Link
              to="/movement-check"
              className="mt-4 inline-block rounded-sm bg-accent px-4 py-3 text-sm font-bold text-accent-foreground"
            >
              Take the Free Movement Check
            </Link>
          </div>
        </div>

        <div className="mt-14 border-t border-ink-foreground/15 pt-6 text-xs text-ink-foreground/50">
          <p>Educational content only. Not a substitute for medical diagnosis or treatment.</p>
          <p className="mt-2">© {new Date().getFullYear()} LegitBodyFix · Movement System</p>
        </div>
      </div>
    </footer>
  );
}
