import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { requestEmailLink, secondsUntilRetry } from "@/lib/email-sign-in";

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
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const busy = useRef(false);
  const retryAt = useRef(0);
  const sentHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(secondsUntilRetry(retryAt.current)), 1000);
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    if (fragment.has("error") || query.has("error")) {
      setMessage("This sign-in link could not be used. Request a new link below.");
    }
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => { if (sentTo) sentHeading.current?.focus(); }, [sentTo]);

  async function sendLink(address: string) {
    if (busy.current || secondsUntilRetry(retryAt.current) > 0) return;
    busy.current = true;
    setSubmitting(true);
    setMessage("");
    try {
      const destination = await requestEmailLink(address, window.location.origin, (options) => supabase.auth.signInWithOtp(options), keepSignedIn);
      retryAt.current = Date.now() + 60_000;
      setRemaining(60);
      setSentTo(destination);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not send your link. Please try again.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendLink(email);
  }

  return (
    <LibraryMessage>
      <Link to="/" aria-label="LegitBodyFix home" className="font-mono text-xs font-bold uppercase tracking-[0.2em]">LEGITBODYFIX<span className="text-accent" aria-hidden="true"> ●</span></Link>
      {sentTo ? <>
        <h1 ref={sentHeading} tabIndex={-1} className="text-4xl font-extrabold tracking-tight">Check your email</h1>
        <p className="max-w-md break-all text-sm leading-6 text-muted-foreground">We sent a sign-in link to<br /><strong className="text-foreground">{sentTo}</strong></p>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">Open the latest email and follow the link to your library. If it does not arrive, check your spam folder.</p>
        <div className="grid w-full max-w-md gap-3">
          <button type="button" disabled={submitting || remaining > 0} onClick={() => void sendLink(sentTo)} className="min-h-12 bg-ink px-5 text-sm font-bold text-ink-foreground disabled:opacity-50">{submitting ? "Sending…" : remaining > 0 ? `Resend link in ${remaining}s` : "Resend sign-in link"}</button>
          <button type="button" disabled={submitting} onClick={() => { setSentTo(""); setMessage(""); }} className="min-h-11 text-sm font-bold underline underline-offset-4 disabled:opacity-50">Use a different email</button>
        </div>
      </> : <>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Sign in or create<br />an account</h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">Your movement library starts here. Use your email to sign in or create an account.</p>
        <form onSubmit={submit} aria-busy={submitting} className="grid w-full max-w-md gap-3">
          <label className="grid gap-2 text-left font-mono text-[10px] uppercase tracking-[0.14em]">Email address<input type="email" required autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" disabled={submitting} value={email} onChange={(event) => setEmail(event.target.value)} aria-describedby="email-help" className="min-h-12 border border-border bg-background px-3 font-sans text-base normal-case tracking-normal" /></label>
          <button disabled={submitting || remaining > 0} className="min-h-12 bg-ink px-5 text-sm font-bold text-ink-foreground disabled:opacity-50">{submitting ? "Sending…" : remaining > 0 ? `Try again in ${remaining}s` : "Continue with email"}</button>
          <label className="flex min-h-11 items-center gap-3 text-left text-sm"><input type="checkbox" checked={keepSignedIn} onChange={(event) => setKeepSignedIn(event.target.checked)} className="h-4 w-4 accent-lime" /><span><strong>Keep me signed in on this device</strong><span className="mt-0.5 block text-xs text-muted-foreground">Leave unchecked on shared devices. Otherwise, closing the browser signs you out.</span></span></label>
          <p id="email-help" className="text-xs leading-5 text-muted-foreground">No password needed. We’ll email you a secure sign-in link.</p>
        </form>
        <p className="w-full max-w-md border-t border-border pt-5 text-xs leading-5 text-muted-foreground">Already purchased? Use the same email you used at checkout to find your programs.</p>
      </>}
      <p role="status" aria-live="polite" className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Link to="/" className="text-sm font-bold underline underline-offset-4">Return home</Link>
    </LibraryMessage>
  );
}

function LibraryMessage({ children }: { children: ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-background px-5 py-12"><section className="flex w-full max-w-xl flex-col items-center gap-5 border border-border bg-card p-7 text-center sm:p-12">{children}</section></main>;
}
