import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthDivider, GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { EmailLinkForm } from "@/components/auth/EmailLinkForm";
import { supabase } from "@/integrations/supabase/client";
import { setAuthPersistence } from "@/integrations/supabase/previewAuthStorage";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — LegitBodyFix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SignupPage,
});
function SignupPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function google(credential: string, nonce: string) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setAuthPersistence(false);
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credential,
        nonce,
      });
      if (error) throw error;
      window.location.assign("/library");
    } catch {
      setMessage("Google sign-in could not be completed. Please try again or use email.");
      setBusy(false);
    }
  }
  return (
    <AuthCard
      eyebrow="New customer"
      title="Create account"
      body="Verify your email to create an account. No password needed. Use your checkout email to connect purchased programs."
    >
      <GoogleAuthButton
        busy={busy}
        onCredential={(credential, nonce) => void google(credential, nonce)}
        onUnavailable={() =>
          setMessage(
            "Google sign-in is unavailable in this browser. Open the page in Chrome or use email.",
          )
        }
      />
      <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
        By continuing with Google, you agree to the{" "}
        <Link to="/terms" className="font-bold underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="font-bold underline">
          Privacy Policy
        </Link>
        .
      </p>
      <AuthDivider />
      <EmailLinkForm signup />
      {message && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {message}
        </p>
      )}
      <p className="mt-7 border-t border-border pt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" search={{ next: "/library" }} className="font-bold underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
