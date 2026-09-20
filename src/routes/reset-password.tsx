import { type FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, authButtonClass, authInputClass } from "@/components/auth/AuthCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Choose new password — LegitBodyFix" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ResetPasswordPage,
});

type RecoveryState = "checking" | "ready" | "invalid";

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");

  useEffect(() => {
    let active = true;
    const markReady = () => { if (active) { setRecoveryState("ready"); setMessage(""); } };
    const markInvalid = (text = "This reset link is invalid or has expired. Request a new one.") => { if (active) { setRecoveryState("invalid"); setMessage(text); } };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) markReady();
    });

    async function prepareRecoverySession() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const authError = url.searchParams.get("error_description") || hash.get("error_description");
      if (authError) return markInvalid(decodeURIComponent(authError.replace(/\+/g, " ")));

      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return markInvalid();
        window.history.replaceState({}, document.title, url.pathname);
        return markReady();
      }

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) return markInvalid();
        window.history.replaceState({}, document.title, url.pathname);
        return markReady();
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) markInvalid();
      else markReady();
    }

    void prepareRecoverySession();
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (recoveryState !== "ready" || busy) return;
    if (password.length < 8) return setMessage("Use at least 8 characters.");
    if (password !== confirm) return setMessage("Passwords do not match.");
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setMessage(error.message || "We could not update your password. Request a new reset link.");
    else setComplete(true);
  }

  return <AuthCard eyebrow="Account recovery" title="Choose a new password" body="Create a password with at least 8 characters.">
    {complete ? <div className="space-y-4"><p className="text-sm leading-6">Your password has been updated. You can continue to your library.</p><Link to="/library" className={authButtonClass + " inline-flex items-center justify-center"}>Open my library</Link></div> : recoveryState === "checking" ? <div role="status" className="border border-border bg-secondary/40 px-4 py-5 text-sm text-muted-foreground">Verifying your secure reset link…</div> : recoveryState === "ready" ? <form onSubmit={submit} className="grid gap-4"><label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">New password<input className={authInputClass} type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">Confirm password<input className={authInputClass} type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label><button className={authButtonClass} disabled={busy}>{busy ? "Saving…" : "Save new password"}</button></form> : null}
    {message && <p role="alert" className="mt-4 text-sm text-destructive">{message}</p>}
    {!complete && <p className="mt-7 border-t border-border pt-5 text-center text-sm"><Link to="/forgot-password" className="font-bold underline underline-offset-4">Request another link</Link></p>}
  </AuthCard>;
}
