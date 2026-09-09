import { useEffect, useState, type AnchorHTMLAttributes } from "react";
import { Link as RouterLink } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { label: "Learn", href: "/movement-check" },
  { label: "Programs", href: "/#programs" },
  { label: "How it works", href: "/#method" },
];

function NativeLink({ to, search: _search, preload: _preload, ...props }: { to: string; search?: { region?: undefined; intent?: undefined }; preload?: "intent" } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={to} {...props} />;
}

export function SiteNav({ nativeNavigation = false }: { nativeNavigation?: boolean } = {}) {
  const Link = nativeNavigation ? NativeLink : RouterLink;
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => {
    let active = true;
    let changed = false;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      changed = true;
      if (active) setSignedIn(Boolean(session?.user));
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (active && !changed) setSignedIn(Boolean(data.user));
    }).catch(() => {});
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      return;
    }
    window.location.assign("/");
  }

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
          <Link to="/library" className="inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4">{signedIn ? "My library" : "Sign in / Join"}</Link>
          {links.map((l) => (
            l.href === "/movement-check" ? <Link
              key={l.label}
              to="/movement-check"
              search={{}}
              preload="intent"
              className="rounded-sm text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >{l.label}</Link> :
            <a
              key={l.label}
              href={l.href}
              className="rounded-sm text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/start"
            search={{ region: undefined, intent: undefined }}
            className="inline-flex min-h-11 items-center rounded-sm bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Find my starting point
          </Link>
          {signedIn && (
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-bold outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
        <Link to="/library" className="inline-flex min-h-11 items-center text-xs font-bold underline underline-offset-4">{signedIn ? "My library" : "Sign in / Join"}</Link>
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
      </div>

      {open && (
        <div className="border-t border-border bg-background px-5 pb-6 pt-2 lg:hidden">
          <nav id="mobile-navigation" className="flex flex-col">
            {links.map((l) => (
              l.href === "/movement-check" ? <Link
                key={l.label}
                to="/movement-check"
                search={{}}
                preload="intent"
                onClick={() => setOpen(false)}
                className="min-h-11 border-b border-border py-4 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >{l.label}</Link> :
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
              to="/start"
              search={{ region: undefined, intent: undefined }}
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-accent px-4 py-3.5 text-center text-sm font-bold text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Find my starting point
            </Link>
            {signedIn && (
              <button
                type="button"
                onClick={() => void signOut()}
                disabled={signingOut}
                className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border px-4 py-3 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
