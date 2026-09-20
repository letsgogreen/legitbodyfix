import { type FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, authButtonClass, authInputClass } from "@/components/auth/AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { isAuthError } from "@supabase/supabase-js";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — LegitBodyFix" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (password.length < 8) return setMessage("Use at least 8 characters for your password.");
    if (password !== confirm) return setMessage("Passwords do not match.");
    if (!accepted) return setMessage("Please agree to the Terms and Privacy Policy.");
    setBusy(true);
    setMessage("");
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password, options: { emailRedirectTo: `${window.location.origin}/library`, data: { display_name: displayName.trim() } } });
      if (error) throw error;
      if (data.user?.identities?.length === 0) {
        setMessage("An account already exists for this email. Log in or reset your password.");
        return;
      }
      if (data.session) window.location.assign("/library");
      else {
        setSubmittedEmail(normalizedEmail);
        setComplete(true);
      }
    } catch (error) {
      setMessage(signupErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    if (!submittedEmail || resending) return;
    setResending(true);
    setResendMessage("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: submittedEmail,
      options: { emailRedirectTo: `${window.location.origin}/library` },
    });
    setResendMessage(error ? signupErrorMessage(error) : "Confirmation email sent again. Check spam or promotions if it does not appear shortly.");
    setResending(false);
  }

  return <AuthCard eyebrow="New customer" title="Create account" body="Use the same email you used at checkout so we can connect your purchased programs.">
    {complete ? <div className="space-y-5">
      <p className="text-sm leading-6">We sent a confirmation link to <strong>{submittedEmail}</strong>. Confirm your account, then return to log in.</p>
      <button type="button" className={`${authButtonClass} border border-border bg-card text-foreground`} disabled={resending} onClick={() => void resendConfirmation()}>{resending ? "Sending…" : "Resend confirmation email"}</button>
      {resendMessage && <p role="status" className="text-sm leading-6 text-muted-foreground">{resendMessage}</p>}
      <Link to="/login" search={{ next: "/library" }} className={authButtonClass + " inline-flex items-center justify-center"}>Go to log in</Link>
    </div> : <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">Nickname<input className={authInputClass} type="text" required maxLength={50} autoComplete="nickname" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
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

function signupErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    const details = [
      error.code && /^[a-z0-9_]+$/i.test(error.code) ? error.code : null,
      error.status ? `HTTP ${error.status}` : null,
    ].filter(Boolean).join(" · ");
    return `${error.message || "The authentication service could not create your account."}${details ? ` (${details})` : ""}`;
  }
  return "Unable to complete signup. Check your connection and try again. If this continues, contact support.";
}
