import { type FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard, authButtonClass, authInputClass } from "@/components/auth/AuthCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({ head: () => ({ meta: [{ title: "Reset password — LegitBodyFix" }, { name: "robots", content: "noindex, nofollow" }] }), component: ForgotPasswordPage });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false); setSent(true);
  }
  return <AuthCard eyebrow="Account recovery" title="Reset password" body="We’ll send a secure password-reset link to your email.">{sent ? <p className="text-sm leading-6">Check your inbox and open the latest reset link.</p> : <form onSubmit={submit} className="grid gap-4"><label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">Email<input className={authInputClass} type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className={authButtonClass} disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button></form>}<p className="mt-7 border-t border-border pt-5 text-center text-sm"><Link to="/login" search={{ next: "/library" }} className="font-bold underline underline-offset-4">Back to log in</Link></p></AuthCard>;
}
