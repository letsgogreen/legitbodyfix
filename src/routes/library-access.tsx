import { type FormEvent, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { supabase } from "@/integrations/supabase/client";
import { getRecipeLibraryPreview } from "@/lib/recipes.functions";

export const Route = createFileRoute("/library-access")({
  validateSearch: (search: Record<string, unknown>): { next?: "/recipes"; verify?: string } => ({
    next: search["next"] === "/recipes" ? "/recipes" : undefined,
    verify:
      typeof search["verify"] === "string" && /^[a-f0-9]{64}$/.test(search["verify"])
        ? search["verify"]
        : undefined,
  }),
  loader: () => getRecipeLibraryPreview(),
  head: () => ({
    meta: [
      { title: "Corrective Exercise Library Access | LegitBodyFix" },
      {
        name: "description",
        content: "Open the complete Corrective Exercise Library with your email.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LibraryAccess,
});

function LibraryAccess() {
  const { verify } = Route.useSearch();
  const preview = Route.useLoaderData();
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [retryAt, setRetryAt] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted || website || state === "sending" || Date.now() < retryAt) return;
    setState("sending");
    try {
      const address = email.trim().toLowerCase();
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(address));
      const emailHash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      const redirect = new URL("/library-access", window.location.origin);
      redirect.searchParams.set("verify", emailHash);
      const { error } = await supabase.auth.signInWithOtp({
        email: address,
        options: { emailRedirectTo: redirect.href, shouldCreateUser: true },
      });
      if (error) throw error;
      setRetryAt(Date.now() + 60_000);
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3eb] px-5 py-8 text-[#161812] sm:px-8 lg:px-[5%]">
      <header className="mx-auto flex max-w-[1400px] items-center justify-between border-b border-[#d5d6ca] pb-7">
        <Link to="/" className="text-base font-black tracking-[-0.04em]">
          LEGITBODYFIX
        </Link>
        <span className="font-mono text-[10px] tracking-[0.14em] text-[#60635a]">
          LIBRARY ACCESS
        </span>
      </header>
      <section className="mx-auto max-w-[1140px] py-14 lg:py-20">
        <p className="flex items-center justify-center gap-2 text-center font-mono text-[10px] tracking-[0.15em] text-[#60635a]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#607b1d]" /> FOR TRAINERS &amp; MOVEMENT
          PROFESSIONALS
        </p>
        <h1 className="mt-6 text-center text-4xl font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
          Explore the
          <br />
          <span className="bg-[linear-gradient(transparent_56%,#d5fb60_56%,#d5fb60_93%,transparent_93%)]">
            Corrective Exercise Library.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-7 text-[#60635a] sm:text-lg">
          Explore movement notes, muscle references and corrective movement strategies in one
          connected library.
        </p>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <figure className="min-w-0">
            <figcaption className="mb-3 flex flex-wrap justify-between gap-2 font-mono text-[10px] tracking-[0.14em] text-[#60635a]">
              <span>INSIDE THE LIBRARY</span>
              <span>PUBLISHED GUIDE PREVIEW</span>
            </figcaption>
            <div className="border border-border bg-card text-foreground shadow-[8px_8px_0_#e0e5d3]">
              <p className="border-b border-border px-5 py-3 text-xs font-bold uppercase tracking-wide">
                Corrective Movement Strategies
              </p>
              {preview ? (
                <ul>
                  <RecipeCard recipe={preview} index={0} preview />
                </ul>
              ) : (
                <p className="p-5 text-sm text-muted-foreground">
                  The guide preview is temporarily unavailable.
                </p>
              )}
            </div>
          </figure>

          <section className="border border-[#b8bbaa] bg-[#fffef9] p-7 sm:p-10">
            <p className="font-mono text-[10px] tracking-[0.14em] text-[#60635a]">
              A LOOK INSIDE THE LIBRARY
            </p>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em]">
              Open the full library.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#60635a]">
              Verify your email to open the complete corrective exercise library.
            </p>
            {verify ? (
              <VerifyLibraryEmail key={verify} emailHash={verify} />
            ) : (
              <form className="mt-7" onSubmit={submit}>
                <label htmlFor="library-access-email" className="block text-xs font-bold">
                  Email address
                </label>
                <input
                  id="library-access-email"
                  type="email"
                  required
                  maxLength={320}
                  autoComplete="email"
                  autoCapitalize="none"
                  readOnly={state === "sending"}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setRetryAt(0);
                    setState("idle");
                  }}
                  placeholder="Your email address"
                  className="mt-2 h-13 w-full border border-[#a1a595] bg-[#fffef9] px-4 text-sm outline-none focus:border-[#161812]"
                />
                <label className="mt-4 flex gap-3 text-xs leading-5 text-[#60635a]">
                  <input
                    type="checkbox"
                    required
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#607b1d]"
                  />
                  <span>
                    I agree that LegitBodyFix may use my email to create an account and provide
                    library access, as described in the{" "}
                    <Link to="/privacy" className="font-bold underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <div className="absolute -left-[10000px]" aria-hidden="true">
                  <label htmlFor="library-access-website">Website</label>
                  <input
                    id="library-access-website"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!accepted || state === "sending"}
                  className="mt-6 min-h-13 w-full border border-[#161812] bg-[#d5fb60] px-5 text-sm font-bold hover:bg-[#c4ed42] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {state === "sending"
                    ? "Sending…"
                    : state === "sent"
                      ? "Resend verification link"
                      : "Email me a verification link"}
                </button>
                <p
                  aria-live="polite"
                  className={`mt-3 text-sm ${state === "error" ? "text-red-700" : "text-[#60635a]"}`}
                >
                  {state === "error" &&
                    "We couldn’t send a verification link. Please try again shortly."}
                  {state === "sent" &&
                    "Check your inbox and spam folder. Open the link to access the library. You can request another link after one minute."}
                </p>
              </form>
            )}
          </section>
        </div>
      </section>
      <footer className="mx-auto flex max-w-[1400px] justify-between border-t border-[#d5d6ca] py-6 text-xs text-[#60635a]">
        <span className="font-black text-[#161812]">LEGITBODYFIX</span>
        <span>Corrective Exercise Library</span>
      </footer>
    </main>
  );
}

function VerifyLibraryEmail({ emailHash }: { emailHash: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function completeVerification() {
      try {
        const { hash, search } = window.location;
        if (
          new URLSearchParams(hash.slice(1)).has("error") ||
          new URLSearchParams(search).has("error")
        ) {
          throw new Error("Invalid verification link");
        }
        const { data, error } = await supabase.auth.getSession();
        if (controller.signal.aborted) return;
        if (error || !data.session) throw new Error("Missing verified session");
        const response = await fetch("/api/recipe-library-leads", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({ emailHash }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Verification failed");
        if (!controller.signal.aborted) window.location.replace("/recipes");
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    void completeVerification();
    return () => controller.abort();
  }, [emailHash]);

  return (
    <div className="mt-7 space-y-4 text-sm">
      <p role="status">
        {failed
          ? "We couldn’t complete verification. Request a new email link."
          : "Verifying your email…"}
      </p>
      {failed && (
        <Link to="/library-access" search={{}} className="font-bold underline">
          Request a new link
        </Link>
      )}
    </div>
  );
}
