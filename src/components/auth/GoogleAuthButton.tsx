import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID =
  import.meta.env["VITE_GOOGLE_CLIENT_ID"] ||
  "535015602991-e03c8n8nq2hfsssp4uhdfjredv58j5fk.apps.googleusercontent.com";
const GOOGLE_SCRIPT_ID = "google-identity-services";

type GoogleCredentialResponse = { credential?: string };
type GoogleAccounts = {
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      nonce: string;
      use_fedcm_for_prompt?: boolean;
    }) => void;
    renderButton: (
      element: HTMLElement,
      options: {
        type: "standard";
        theme: "outline";
        size: "large";
        text: "continue_with";
        shape: "rectangular";
        logo_alignment: "left";
        width: number;
      },
    ) => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

export function GoogleAuthButton({
  busy,
  onCredential,
  onUnavailable,
}: {
  busy: boolean;
  onCredential: (credential: string, nonce: string) => void;
  onUnavailable: () => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const unavailableRef = useRef(onUnavailable);
  const [loading, setLoading] = useState(true);

  callbackRef.current = onCredential;
  unavailableRef.current = onUnavailable;

  useEffect(() => {
    let cancelled = false;

    async function renderGoogleButton() {
      if (!window.google?.accounts || !buttonRef.current) return;
      try {
        const [nonce, hashedNonce] = await generateNonce();
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
          callback: (response) => {
            if (!response.credential) return unavailableRef.current();
            callbackRef.current(response.credential, nonce);
          },
        });
        buttonRef.current.replaceChildren();
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: Math.min(400, Math.max(240, buttonRef.current.clientWidth)),
        });
        setLoading(false);
      } catch {
        if (!cancelled) {
          setLoading(false);
          unavailableRef.current();
        }
      }
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (window.google?.accounts) {
      void renderGoogleButton();
    } else if (existing) {
      existing.addEventListener("load", renderGoogleButton, { once: true });
      existing.addEventListener("error", unavailableRef.current, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.addEventListener("load", renderGoogleButton, { once: true });
      script.addEventListener("error", unavailableRef.current, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      existing?.removeEventListener("load", renderGoogleButton);
      existing?.removeEventListener("error", unavailableRef.current);
    };
  }, []);

  return (
    <div
      className={`relative flex min-h-11 w-full justify-center overflow-hidden ${busy ? "pointer-events-none opacity-50" : ""}`}
      aria-busy={busy || loading}
    >
      <div ref={buttonRef} className="w-full max-w-[400px]" />
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-md border border-border bg-background text-sm font-bold text-muted-foreground">
          Loading Google sign-in…
        </div>
      ) : null}
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        or use email
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

async function generateNonce(): Promise<[string, string]> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = btoa(String.fromCharCode(...bytes));
  const encoded = new TextEncoder().encode(nonce);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  const hashedNonce = Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return [nonce, hashedNonce];
}
