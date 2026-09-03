import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { Loader2, LogOut } from "lucide-react";
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-5"><p className="hidden truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:block">Signed in as {user.email}</p><Link to="/library" className="text-xs font-bold">Programs</Link><Link to="/library/account" className="text-xs font-bold">Account & purchases</Link></div>
          <button type="button" onClick={() => void supabase.auth.signOut()} className="inline-flex shrink-0 items-center gap-2 text-xs font-bold"><LogOut className="h-3.5 w-3.5" />Sign out</button>
        </div>
      </div>
      <Outlet />
      <SiteFooter />
    </div>
  );
}

function LibrarySignIn() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    if (fragment.has("error") || query.has("error")) {
      setMessage("Sign-in was cancelled or could not be completed. Please try again or use an email link.");
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, []);

  async function signInWithGoogle() {
    if (submitting || googlePending) return;
    setGooglePending(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/library` },
      });
      if (error) throw error;
    } catch {
      setMessage("Google sign-in is unavailable. Please try again or use an email link.");
    } finally {
      setGooglePending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || googlePending) return;
    setSubmitting(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/library` } });
      if (error) throw error;
      setMessage("Check your email for your secure sign-in link.");
    } catch {
      setMessage("We could not send a sign-in link. Please wait a moment and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LibraryMessage>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Customer access</p>
      <h1 className="text-4xl font-extrabold tracking-tight">Open your library</h1>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">Sign in or create an account with Google or an email link. Use the same email as your purchase to access your programs. No password required.</p>
      <button type="button" onClick={() => void signInWithGoogle()} disabled={submitting || googlePending} className="min-h-12 w-full max-w-md border border-border bg-background px-5 text-sm font-bold disabled:opacity-50">{googlePending ? "Connecting…" : "Continue with Google"}</button>
      <p className="text-xs text-muted-foreground">or continue with email</p>
      <form onSubmit={submit} className="grid w-full max-w-md gap-3">
        <label className="grid gap-2 text-left font-mono text-[10px] uppercase tracking-[0.14em]">Email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 border border-border bg-background px-3 font-sans text-sm normal-case tracking-normal" /></label>
        <button disabled={submitting || googlePending} className="min-h-12 bg-ink px-5 text-sm font-bold text-ink-foreground disabled:opacity-50">{submitting ? "Sending…" : "Email me a sign-in link"}</button>
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{message}</p>
      </form>
      <Link to="/" className="text-sm font-bold underline underline-offset-4">Return home</Link>
    </LibraryMessage>
  );
}

function LibraryMessage({ children }: { children: ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-background px-5 py-12"><section className="flex w-full max-w-xl flex-col items-center gap-5 border border-border bg-card p-7 text-center sm:p-12">{children}</section></main>;
}
