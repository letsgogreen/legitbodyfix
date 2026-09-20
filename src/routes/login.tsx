import { type FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, authButtonClass, authInputClass } from "@/components/auth/AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { setAuthPersistence } from "@/integrations/supabase/previewAuthStorage";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({ next: typeof search.next === "string" && search.next.startsWith("/") && !search.next.startsWith("//") ? search.next : "/library" }),
  head: () => ({ meta: [{ title: "Log in — LegitBodyFix" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setAuthPersistence(remember);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setMessage("Email or password is incorrect. You can reset your password below.");
    else window.location.assign(next);
  }

  async function continueWithGoogle() {
    setBusy(true);
    setMessage("");
    setAuthPersistence(remember);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}${next}` } });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  return <AuthCard eyebrow="Existing customer" title="Log in" body="Open your programs and continue where you left off.">
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">Email<input className={authInputClass} type="email" required autoComplete="email" autoCapitalize="none" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">Password<input className={authInputClass} type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} disabled={busy} className="h-4 w-4 accent-ink" />Remember me</label><Link to="/forgot-password" className="text-xs font-bold underline underline-offset-4">Forgot password?</Link></div>
      <button className={authButtonClass} disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      <button type="button" className={`${authButtonClass} border border-border bg-card text-foreground`} disabled={busy} onClick={() => void continueWithGoogle()}>Continue with Google</button>
    </form>
    {message && <p role="alert" className="mt-4 text-sm text-destructive">{message}</p>}
    <p className="mt-7 border-t border-border pt-5 text-center text-sm text-muted-foreground">New here? <Link to="/signup" className="font-bold text-foreground underline underline-offset-4">Create an account</Link></p>
  </AuthCard>;
}
