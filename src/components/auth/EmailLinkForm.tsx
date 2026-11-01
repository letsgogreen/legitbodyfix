import { type FormEvent, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { setAuthPersistence } from "@/integrations/supabase/previewAuthStorage";
import { receiveAdminLogin, sendAdminLogin } from "@/lib/admin-auth-handoff";
import {
  beginMemberEmail,
  pendingMemberEmail,
  clearMemberEmail,
  memberEmailChannel,
  safeMemberNext,
  type MemberEmailRequest,
} from "@/lib/member-email-auth";
import { AuthCard, authButtonClass, authInputClass, authLabelClass } from "./AuthCard";

export function EmailLinkForm({
  signup = false,
  next = "/library",
  remember = false,
}: {
  signup?: boolean;
  next?: string;
  remember?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [request, setRequest] = useState<MemberEmailRequest | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  useEffect(() => {
    const saved = pendingMemberEmail(sessionStorage);
    if (saved) {
      setRequest(saved);
      setEmail(saved.email);
    }
  }, []);
  useEffect(() => {
    if (!request || typeof BroadcastChannel === "undefined") return;
    let active = true;
    const stop = receiveAdminLogin(
      new BroadcastChannel(memberEmailChannel(request.id)),
      async (tokens) => {
        if (!active || pendingMemberEmail(sessionStorage)?.id !== request.id) return false;
        const verified = await supabase.auth.getUser(tokens.access_token);
        if (
          !active ||
          verified.error ||
          verified.data.user?.email?.toLowerCase() !== request.email ||
          pendingMemberEmail(sessionStorage)?.id !== request.id
        )
          return false;
        setAuthPersistence(request.remember);
        const result = await supabase.auth.setSession(tokens);
        if (result.error) return false;
        clearMemberEmail(sessionStorage);
        setTimeout(() => window.location.assign(request.next), 0);
        return true;
      },
    );
    return () => {
      active = false;
      stop();
    };
  }, [request]);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (signup && !request && !accepted) {
      setMessage("Please agree to the Terms and Privacy Policy.");
      return;
    }
    if (Date.now() < retryAt) {
      setMessage("Please wait a minute before requesting another link.");
      return;
    }
    setBusy(true);
    setMessage("");
    const pending = beginMemberEmail(sessionStorage, request?.email ?? email, next, remember);
    setRequest(pending);
    try {
      setAuthPersistence(remember);
      const redirect = new URL("/login", window.location.origin);
      redirect.searchParams.set("member_login", pending.id);
      redirect.searchParams.set("next", pending.next);
      redirect.searchParams.set("remember", remember ? "1" : "0");
      const { error } = await supabase.auth.signInWithOtp({
        email: pending.email,
        options: {
          shouldCreateUser: signup,
          emailRedirectTo: redirect.href,
          ...(signup ? { data: { display_name: name.trim() } } : {}),
        },
      });
      if (error) throw error;
      setRetryAt(Date.now() + 60_000);
      setMessage(
        "Check your inbox and spam folder. Open the latest link in the same browser; this tab will continue automatically.",
      );
    } catch {
      clearMemberEmail(sessionStorage);
      setRequest(null);
      setMessage(
        "Unable to send the link. Please try again shortly, or create an account if you are new.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={send} className="grid gap-4">
      {request ? (
        <p role="status" className="text-sm leading-6">
          Verification requested for <strong>{request.email}</strong>. Keep this tab open.
        </p>
      ) : (
        <>
          {signup && (
            <label className={authLabelClass}>
              Nickname
              <input
                className={authInputClass}
                required
                maxLength={50}
                autoComplete="nickname"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          )}
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
          {signup && (
            <label className="flex items-start gap-3 text-xs leading-5 text-muted-foreground">
              <input
                type="checkbox"
                required
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 accent-lime"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="font-bold underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="font-bold underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}
        </>
      )}
      <button className={authButtonClass} disabled={busy}>
        {busy
          ? "Sending…"
          : request
            ? "Resend verification link"
            : signup
              ? "Create account with email"
              : "Email me a sign-in link"}
      </button>
      {request && (
        <button
          type="button"
          className="text-sm font-bold underline"
          disabled={busy}
          onClick={() => {
            clearMemberEmail(sessionStorage);
            setRequest(null);
            setMessage("");
            setRetryAt(0);
          }}
        >
          Use a different email
        </button>
      )}
      {message && (
        <p role="status" className="text-sm leading-6 text-muted-foreground">
          {message}
        </p>
      )}
    </form>
  );
}

export function EmailVerificationReturn() {
  const [status, setStatus] = useState("Checking your email verification…");
  const [ready, setReady] = useState(false);
  const [delivered, setDelivered] = useState(false);
  useEffect(() => {
    let active = true;
    let stop: (() => void) | undefined;
    const query = new URLSearchParams(window.location.search);
    const id = query.get("member_login");
    const authError =
      new URLSearchParams(window.location.hash.replace(/^#/, "")).has("error") ||
      query.has("error");
    void (async () => {
      try {
        if (authError) throw new Error("verification failed");
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) throw new Error("missing session");
        const verified = await supabase.auth.getUser();
        if (verified.error || !verified.data.user) throw new Error("invalid session");
        if (!active) return;
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname + window.location.search,
        );
        const own = pendingMemberEmail(sessionStorage);
        if (own?.id === id && own.email === verified.data.user.email?.toLowerCase()) {
          clearMemberEmail(sessionStorage);
          window.location.replace(own.next);
          return;
        }
        setReady(true);
        setStatus("Email verified. Return to the tab where you requested the link.");
        if (id && typeof BroadcastChannel !== "undefined")
          stop = sendAdminLogin(new BroadcastChannel(memberEmailChannel(id)), data.session, () => {
            if (active) {
              setDelivered(true);
              setStatus("Your original tab is signed in. You can close this verification tab.");
            }
          });
      } catch {
        if (active) setStatus("This link is invalid or has expired. Request a new email link.");
      }
    })();
    return () => {
      active = false;
      stop?.();
    };
  }, []);
  return (
    <AuthCard
      eyebrow="Email verification"
      title={delivered ? "Sign-in complete" : ready ? "Email verified" : "Email verification"}
      body={status}
    >
      {ready ? (
        <button
          className={authButtonClass}
          onClick={() =>
            window.location.replace(
              safeMemberNext(new URLSearchParams(window.location.search).get("next")),
            )
          }
        >
          Continue in this tab instead
        </button>
      ) : (
        <Link to="/login" search={{ next: "/library" }} className="font-bold underline">
          Return to log in
        </Link>
      )}
    </AuthCard>
  );
}
