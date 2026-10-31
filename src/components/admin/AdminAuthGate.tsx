import { type ReactNode, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { setAuthPersistence } from "@/integrations/supabase/previewAuthStorage";
import { markCurrentBrowserAsInternal } from "@/lib/internal-analytics";
import { ADMIN_EMAIL, isApprovedAdminEmail, beginAdminLogin, pendingAdminLogin, clearAdminLogin, adminLoginChannel, receiveAdminLogin, sendAdminLogin } from "@/lib/admin-auth-handoff";
export { isApprovedAdminEmail } from "@/lib/admin-auth-handoff";

type AuthState = "loading" | "signed-out" | "forbidden" | "ready" | "handoff";

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [delivered, setDelivered] = useState(false);

  useEffect(() => {
    // Administrator sessions are intentionally limited to this browser session.
    // Clear any previously selected persistent auth mode before reading a session.
    setAuthPersistence(false);
    const client = getSupabaseClient();
    if (!client) {
      setState("signed-out");
      return;
    }

    const callbackId = new URLSearchParams(window.location.search).get("admin_login");
    let stopTransfer: (() => void) | undefined;
    let active = true;
    const syncUser = (nextUser?: User) => {
      if (!active) return;
      if (!nextUser) setState("signed-out");
      else if (
        nextUser.app_metadata?.["is_admin"] === true &&
        isApprovedAdminEmail(nextUser.email)
      ) {
        cleanConsumedAuthFragment();
        if (callbackId && callbackId !== pendingAdminLogin(sessionStorage)) {
          setState("handoff");
          if (!stopTransfer && typeof BroadcastChannel !== "undefined") {
            // Run outside Supabase's auth event callback/lock.
            stopTransfer = () => {};
            setTimeout(() => {
              if (!active) return;
              void client.auth.getSession().then(({ data }) => {
                if (!active || !data.session) return;
                stopTransfer = sendAdminLogin(new BroadcastChannel(adminLoginChannel(callbackId)), data.session, () => setDelivered(true));
              });
            }, 0);
          }
          return;
        }
        if (callbackId) {
          clearAdminLogin(sessionStorage);
          const url = new URL(window.location.href);
          url.searchParams.delete("admin_login");
          window.history.replaceState(window.history.state, "", url.pathname + url.search);
        }
        markCurrentBrowserAsInternal();
        setState("ready");
      } else setState("forbidden");
    };

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      // SDK broadcasts from another tab must not unlock this tab before its
      // own session storage has received and validated the handoff.
      setTimeout(() => {
        if (!active) return;
        void client.auth.getSession().then(async ({ data: stored }) => {
          if (!active || stored.session?.access_token !== session?.access_token) return;
          if (session) {
            const verified = await client.auth.getUser();
            if (!verified.error) syncUser(verified.data.user ?? undefined);
          } else if (!window.location.hash.includes("access_token")) syncUser();
        });
      }, 0);
    });
    // Validate the cached session with Supabase before rendering the control room.
    // getSession() only reads browser storage and can return a user whose access
    // token is no longer accepted by PostgREST, leaving the editor visible while
    // every protected write is performed as anon.
    void client.auth.getUser().then(async ({ data: userData, error }) => {
      if (userData.user) {
        syncUser(userData.user);
        return;
      }

      if (error) {
        const { data: refreshed } = await client.auth.refreshSession();
        if (refreshed.session?.user) {
          syncUser(refreshed.session.user);
          return;
        }
      }

      if (!window.location.hash.includes("access_token")) syncUser();
    });

    return () => { active = false; stopTransfer?.(); data.subscription.unsubscribe(); };
  }, []);

  if (state === "loading") return <AuthMessage title="Checking administrator access…" />;
  if (state === "handoff") return <AuthMessage
    title={delivered ? "Your original administrator tab is signed in" : "Email verified"}
    body={delivered ? "Return to the tab where you requested the link. You can close this verification tab." : "Return to the tab where you requested the link. Keep both tabs open while sign-in completes. If you used a different browser, continue here instead."}
    action={<button type="button" className="mt-6 min-h-10 rounded-sm border border-border px-4 text-sm font-bold" onClick={() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("admin_login");
      window.location.replace(url.pathname + url.search);
    }}>Continue in this tab instead</button>}
  />;
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
        body="The signed-in account is authenticated, but does not have admin access."
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
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(() => typeof window === "undefined" ? null : pendingAdminLogin(sessionStorage));

  useEffect(() => {
    if (!requestId || typeof BroadcastChannel === "undefined") return;
    const client = getSupabaseClient();
    if (!client) return;
    const channel = new BroadcastChannel(adminLoginChannel(requestId));
    return receiveAdminLogin(channel, async (tokens) => {
      if (pendingAdminLogin(sessionStorage) !== requestId) return false;
      // Verify with Supabase before importing; the normal gate still checks admin metadata.
      const verified = await client.auth.getUser(tokens.access_token);
      if (verified.error || !isApprovedAdminEmail(verified.data.user?.email) || verified.data.user?.app_metadata?.["is_admin"] !== true) return false;
      if (pendingAdminLogin(sessionStorage) !== requestId) return false;
      setAuthPersistence(false);
      const result = await client.auth.setSession(tokens);
      if (result.error) return false;
      clearAdminLogin(sessionStorage);
      return true;
    });
  }, [requestId]);

  async function requestSignInLink() {
    const client = getSupabaseClient();
    if (!client) return;

    setSubmitting(true);
    setMessage("");
    setAuthPersistence(false);
    const id = beginAdminLogin(sessionStorage);
    setRequestId(id);
    const { error } = await client.auth.signInWithOtp({
      email: ADMIN_EMAIL,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin + "/admin?remember=0&admin_login=" + encodeURIComponent(id),
      },
    });
    setSubmitting(false);
    if (error) {
      clearAdminLogin(sessionStorage);
      setRequestId(null);
      setMessage(error.message);
      return;
    }

    setMessage("Link sent. Leave this tab open and verify the email in the same browser. This tab will sign in automatically.");
  }

  return (
    <AuthMessage
      title="Administrator sign-in"
      body="Send a secure, one-time link to the approved administrator email. After verification, this tab will open the control room."
      action={
        <div className="mt-7 grid gap-5">
          <ol className="grid gap-3 text-sm" aria-label="Administrator sign-in steps">
            {[
              "Send the secure link",
              "Open it from your approved inbox",
              "Return here automatically",
            ].map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs font-bold">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => void requestSignInLink()}
            disabled={submitting}
            className="min-h-12 rounded-xl bg-ink px-5 text-base font-bold text-ink-foreground disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send secure sign-in link"}
          </button>
          {message ? (
            <p
              aria-live="polite"
              className="rounded-xl bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground"
            >
              {message}
            </p>
          ) : null}
          <p className="text-xs leading-5 text-muted-foreground">
            Administrator access ends when you close the browser.
          </p>
        </div>
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
    <main className="grid min-h-screen place-items-center bg-secondary/40 px-4 py-8 text-foreground sm:px-6 sm:py-14">
      <section className="w-full max-w-[30rem] rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_24px_80px_rgba(20,20,20,0.10)] sm:p-11">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          LegitBodyFix / Control room
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {body ? <p className="mt-3 text-base leading-7 text-muted-foreground">{body}</p> : null}
        {action}
      </section>
    </main>
  );
}
