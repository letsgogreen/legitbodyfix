import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type AuthState = "loading" | "signed-out" | "forbidden" | "ready";

const ADMIN_EMAIL = "thriveinside@protonmail.com";

export function isApprovedAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}

export function AdminAuthGate({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setState("signed-out");
      return;
    }

    const syncUser = (nextUser?: User) => {
      setUser(nextUser);
      if (!nextUser) setState("signed-out");
      else if (nextUser.app_metadata?.["is_admin"] === true && isApprovedAdminEmail(nextUser.email)) {
        cleanConsumedAuthFragment();
        setState("ready");
      }
      else setState("forbidden");
    };

    void client.auth.getUser().then(({ data }) => syncUser(data.user ?? undefined));
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (state === "loading") return <AuthMessage title="Checking administrator access…" />;
  if (!isSupabaseConfigured) {
    return (
      <AuthMessage
        title="Connect Supabase to unlock the control room"
        body="Set the public project URL and publishable key in the deployment environment. Secret keys must remain server-only."
      />
    );
  }
  if (state === "signed-out") return <AdminSignIn />;
  if (state === "forbidden") {
    return (
      <AuthMessage
        title="This account is not an administrator"
        body={`${user?.email ?? "The signed-in account"} is authenticated, but does not have admin access.`}
        action={<SignOutButton />}
      />
    );
  }

  return <>{children}</>;
}

function cleanConsumedAuthFragment() {
  if (typeof window === "undefined") return;

  const isEmptyFragment = window.location.href.endsWith("#");
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const carriedAuthTokens =
    fragment.has("access_token") ||
    fragment.has("refresh_token") ||
    fragment.get("type") === "magiclink";

  if (isEmptyFragment || carriedAuthTokens) {
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }
}

function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function requestOtp() {
    const client = getSupabaseClient();
    if (!client) return;

    if (!isApprovedAdminEmail(email)) {
      setMessage(`Access denied. Administrator sign-in is restricted to ${ADMIN_EMAIL}.`);
      return;
    }

    setSubmitting(true);
    setMessage("");
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setSubmitting(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setOtpSent(true);
    setMessage("A 6-digit administrator code was sent to your email.");
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Enter the complete 6-digit code.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    const { error } = await client.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setSubmitting(false);
    setMessage(error ? "That code is invalid or has expired. Request a new code and try again." : "Access verified. Opening the control room…");
  }

  function changeEmail() {
    setOtp("");
    setOtpSent(false);
    setMessage("");
  }

  return (
    <AuthMessage
      title="Administrator sign-in"
      body={otpSent
        ? `Enter the 6-digit code sent to ${email}.`
        : "Use the approved administrator email. We'll send a one-time 6-digit code—no link or new window required."}
      action={
        otpSent ? (
          <form onSubmit={verifyOtp} className="mt-6 grid gap-3">
            <label className="grid gap-2 text-left text-xs font-bold uppercase tracking-[0.12em]">
              Verification code
              <input
                type="text"
                required
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  if (message) setMessage("");
                }}
                className="min-h-14 rounded-sm border border-border bg-background px-3 text-center font-mono text-2xl font-bold tracking-[0.35em]"
                aria-describedby="admin-otp-message"
              />
            </label>
            <button
              type="submit"
              disabled={submitting || otp.length !== 6}
              className="min-h-11 rounded-sm bg-ink px-4 text-sm font-bold text-ink-foreground disabled:opacity-50"
            >
              {submitting ? "Verifying…" : "Verify and enter"}
            </button>
            <div className="flex flex-wrap justify-between gap-3 text-xs font-bold">
              <button type="button" onClick={changeEmail} className="underline underline-offset-4">
                Change email
              </button>
              <button
                type="button"
                onClick={() => void requestOtp()}
                disabled={submitting}
                className="underline underline-offset-4 disabled:opacity-50"
              >
                Send a new code
              </button>
            </div>
            {message && <p id="admin-otp-message" aria-live="polite" className="text-sm text-muted-foreground">{message}</p>}
          </form>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void requestOtp();
            }}
            className="mt-6 grid gap-3"
          >
            <label className="grid gap-2 text-left text-xs font-bold uppercase tracking-[0.12em]">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); if (message) setMessage(""); }}
                className="min-h-11 rounded-sm border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-11 rounded-sm bg-ink px-4 text-sm font-bold text-ink-foreground disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send 6-digit code"}
            </button>
            {message && <p aria-live="polite" className="text-sm text-muted-foreground">{message}</p>}
          </form>
        )
      }
    />
  );
}

function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void getSupabaseClient()?.auth.signOut()}
      className="mt-6 min-h-10 rounded-sm border border-border px-4 text-sm font-bold"
    >
      Sign out
    </button>
  );
}

function AuthMessage({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-12 text-foreground">
      <section className="w-full max-w-lg rounded-sm border border-border bg-card p-6 shadow-sm sm:p-9">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          LegitBodyFix / Control room
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{title}</h1>
        {body && <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>}
        {action}
      </section>
    </main>
  );
}
