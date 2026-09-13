import { type FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, authButtonClass, authInputClass } from "@/components/auth/AuthCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — LegitBodyFix" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) return setMessage("Use at least 8 characters for your password.");
    if (password !== confirm) return setMessage("Passwords do not match.");
    if (!accepted) return setMessage("Please agree to the Terms and Privacy Policy.");
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/library` } });
    setBusy(false);
    if (error) return setMessage("We could not create your account. Try logging in or resetting your password.");
    if (data.session) window.location.assign("/library");
    else setComplete(true);
  }

  return <AuthCard eyebrow="New customer" title="Create account" body="Use the same email you used at checkout so we can connect your purchased programs.">
    {complete ? <div className="space-y-5"><p className="text-sm leading-6">Check your email to confirm your account, then return to log in.</p><Link to="/login" search={{ next: "/library" }} className={authButtonClass + " inline-flex items-center justify-center"}>Go to log in</Link></div> : <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">Email<input className={authInputClass} type="email" required autoComplete="email" autoCapitalize="none" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">Password<input className={authInputClass} type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">Confirm password<input className={authInputClass} type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label>
      <label className="flex items-start gap-3 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-lime" /><span>I agree to the <Link to="/terms" className="font-bold text-foreground underline">Terms & Conditions</Link> and <Link to="/privacy" className="font-bold text-foreground underline">Privacy Policy</Link>.</span></label>
      <button className={authButtonClass} disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
    </form>}
    {message && <p role="alert" className="mt-4 text-sm text-destructive">{message}</p>}
    {!complete && <p className="mt-7 border-t border-border pt-5 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" search={{ next: "/library" }} className="font-bold text-foreground underline underline-offset-4">Log in</Link></p>}
  </AuthCard>;
}
