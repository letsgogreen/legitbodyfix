import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type AuthState = "loading" | "signed-out" | "forbidden" | "ready";

export function AdminAuthGate({ children }: { children: ReactNode }) {
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
      else if (nextUser.app_metadata?.["is_admin"] === true) setState("ready");
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

function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseClient();
    if (!client) return;

    setSubmitting(true);
    setMessage("");
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setSubmitting(false);
    setMessage(error ? error.message : "Check your email for the secure sign-in link.");
  }

  return (
    <AuthMessage
      title="Administrator sign-in"
      body="Use the administrator email connected to Supabase. Access is granted only after the account metadata is verified."
      action={
        <form onSubmit={submit} className="mt-6 grid gap-3">
          <label className="grid gap-2 text-left text-xs font-bold uppercase tracking-[0.12em]">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 rounded-sm border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 rounded-sm bg-ink px-4 text-sm font-bold text-ink-foreground disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send secure sign-in link"}
          </button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </form>
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
