import { type ReactNode, useEffect, useState } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "My library — LegitBodyFix" },
      { name: "description", content: "Access the LegitBodyFix programs you own." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LibraryShell,
});

function LibraryShell() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
      const url = new URL(window.location.href);
      if (url.searchParams.has("remember")) {
        url.searchParams.delete("remember");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) return <LibraryMessage><Loader2 className="h-6 w-6 animate-spin" /><p>Checking your library…</p></LibraryMessage>;
  if (!user) return <LibrarySignIn />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-3 lg:px-8">
          <Link to="/library" className="text-xs font-bold">Programs</Link>
          <Link to="/library/account" className="text-xs font-bold">Account & purchases</Link>
        </div>
      </div>
      <Outlet key={user.id} />
      <SiteFooter />
    </div>
  );
}

function LibrarySignIn() {
  return (
    <LibraryMessage>
      <Link to="/" aria-label="LegitBodyFix home" className="font-mono text-xs font-bold uppercase tracking-[0.2em]">LEGITBODYFIX<span className="text-accent" aria-hidden="true"> ●</span></Link>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Open your library</h1>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">Log in to an existing account or create a new one with the same email you used at checkout.</p>
      <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
        <Link to="/login" search={{ next: "/library" }} className="inline-flex min-h-12 items-center justify-center bg-ink px-5 text-sm font-bold text-ink-foreground">Log in</Link>
        <Link to="/signup" className="inline-flex min-h-12 items-center justify-center border border-foreground px-5 text-sm font-bold">Create account</Link>
      </div>
      <Link to="/" className="text-sm font-bold underline underline-offset-4">Return home</Link>
    </LibraryMessage>
  );
}

function LibraryMessage({ children }: { children: ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-background px-5 py-12"><section className="flex w-full max-w-xl flex-col items-center gap-5 border border-border bg-card p-7 text-center sm:p-12">{children}</section></main>;
}
