import { useState } from "react";
import { EmailLinkForm, EmailVerificationReturn } from "@/components/auth/EmailLinkForm";
import { safeMemberNext } from "@/lib/member-email-auth";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthDivider, GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { supabase } from "@/integrations/supabase/client";
import { setAuthPersistence } from "@/integrations/supabase/previewAuthStorage";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next: string; member_login?: string } => ({
    next: safeMemberNext(search["next"]),
    ...(typeof search["member_login"] === "string" ? { member_login: search["member_login"] } : {}),
  }),
  head: () => ({
    meta: [{ title: "Log in — LegitBodyFix" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next, member_login } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");

  async function continueWithGoogle(credential: string, nonce: string) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setAuthPersistence(remember);
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: credential,
      nonce,
    });
    if (error) {
      setMessage("Google sign-in could not be completed. Please try again or use email.");
      setBusy(false);
      return;
    }
    window.location.assign(next);
  }

  if (member_login) return <EmailVerificationReturn />;
  return (
    <AuthCard
      eyebrow="Member access"
      title="Log in"
      body="Continue to your personal movement library."
    >
      <GoogleAuthButton
        busy={busy}
        onCredential={(credential, nonce) => void continueWithGoogle(credential, nonce)}
        onUnavailable={() =>
          setMessage(
            "Google sign-in is unavailable in this browser. Open the page in Chrome or use email.",
          )
        }
      />
      <AuthDivider />
      <div className="mb-5">
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
      </div>
      <EmailLinkForm next={next} remember={remember} />
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
