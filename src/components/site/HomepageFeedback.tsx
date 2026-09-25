import { useState, type FormEvent } from "react";
import { MessageSquareText, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Sentiment = "helpful" | "needs_improvement";

function deviceType() {
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

export function HomepageFeedback() {
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!sentiment || state === "sending") return;
    setState("sending");
    const visitorId = window.localStorage.getItem("lbf_analytics_visitor");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sentiment,
          message,
          website,
          page_path: window.location.pathname,
          device_type: deviceType(),
          visitor_id: visitorId,
        }),
      });
      if (!response.ok) throw new Error("Feedback request failed");
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <section
      aria-labelledby="homepage-feedback-title"
      className="border-b border-border bg-secondary/40"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-5 sm:py-16 lg:grid-cols-[0.7fr_1fr] lg:px-8">
        <div>
          <MessageSquareText className="h-5 w-5" aria-hidden="true" />
          <h2 id="homepage-feedback-title" className="mt-4 text-2xl font-bold sm:text-3xl">
            Help us improve this website
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Tell us what was useful or what felt unclear. No name or email is required.
          </p>
        </div>

        {state === "sent" ? (
          <div
            className="flex min-h-48 items-center border border-border bg-card p-6"
            role="status"
          >
            <div>
              <p className="text-lg font-bold">Thank you for the feedback.</p>
              <p className="mt-2 text-sm text-muted-foreground">Your response has been received.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="border border-border bg-card p-5 sm:p-6">
            <fieldset>
              <legend className="text-sm font-bold">Was this homepage helpful?</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    ["helpful", "Helpful", ThumbsUp],
                    ["needs_improvement", "Needs improvement", ThumbsDown],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={sentiment === value}
                    onClick={() => setSentiment(value)}
                    className={cn(
                      "flex min-h-11 items-center justify-center gap-2 border px-3 text-sm font-bold transition-colors",
                      sentiment === value
                        ? "border-ink bg-ink text-ink-foreground"
                        : "border-border hover:bg-secondary",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label htmlFor="homepage-feedback-message" className="mt-5 block text-sm font-bold">
              What should we keep or improve?{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="homepage-feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Share a short comment"
              className="mt-2 w-full resize-y border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground"
            />
            <div className="absolute -left-[10000px]" aria-hidden="true">
              <label htmlFor="homepage-feedback-website">Website</label>
              <input
                id="homepage-feedback-website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!sentiment || state === "sending"}
                className="min-h-11 bg-ink px-5 text-sm font-bold text-ink-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                {state === "sending" ? "Sending…" : "Send feedback"}
              </button>
              <p aria-live="polite" className="text-sm text-destructive">
                {state === "error" ? "We couldn’t send that. Please try again." : ""}
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
