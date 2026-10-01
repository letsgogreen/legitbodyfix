import { type FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import {
  AuthCard,
  authButtonClass,
  authInputClass,
  authLabelClass,
} from "@/components/auth/AuthCard";
import { AuthDivider, GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { supabase } from "@/integrations/supabase/client";
import { setAuthPersistence } from "@/integrations/supabase/previewAuthStorage";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next:
      typeof search.next === "string" &&
      search.next.startsWith("/") &&
      !search.next.startsWith("//")
        ? search.next
        : "/library",
  }),
  head: () => ({
    meta: [{ title: "Log in — LegitBodyFix" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function continueWithGoogle() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setAuthPersistence(remember);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/library` },
    });
    if (error) {
      setMessage("Google sign-in could not be started. Please try again.");
      setBusy(false);
    }
  }

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

  return (
    <AuthCard
      eyebrow="Member access"
      title="Log in"
      body="Continue to your personal movement library."
    >
      <GoogleAuthButton busy={busy} onClick={() => void continueWithGoogle()} />
      <AuthDivider />
      <form onSubmit={submit} className="grid gap-5">
        <label className={authLabelClass}>
          Email
          <input
            className={authInputClass}
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className={authLabelClass}>
          Password
          <span className="relative block">
            <input
              className={`${authInputClass} pr-12`}
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </span>
        </label>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={busy}
              className="mt-0.5 h-5 w-5 rounded accent-ink"
            />
            <span>
              <span className="block font-bold">Keep me signed in</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                Use only on a trusted device.
              </span>
            </span>
          </label>
          <Link to="/forgot-password" className="text-sm font-bold underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
        <button className={authButtonClass} disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      {message ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {message}
        </p>
      ) : null}
      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        New to LegitBodyFix?{" "}
        <Link to="/signup" className="font-bold text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
