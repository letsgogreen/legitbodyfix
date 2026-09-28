import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthCard({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-secondary/40 px-4 py-8 text-foreground sm:px-6 sm:py-14">
      <section className="w-full max-w-[30rem] rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_24px_80px_rgba(20,20,20,0.10)] sm:p-11">
        <Link
          to="/"
          aria-label="LegitBodyFix home"
          className="inline-flex items-center rounded-full border border-border px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em]"
        >
          LEGITBODYFIX
          <span className="ml-1 text-accent" aria-hidden="true">
            ●
          </span>
        </Link>
        <p className="mt-8 font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:mt-10">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{body}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}

export const authLabelClass = "grid gap-2 text-sm font-bold";
export const authInputClass =
  "min-h-12 w-full rounded-xl border border-border bg-background px-4 font-sans text-base font-normal normal-case tracking-normal outline-none transition focus:border-foreground/50 focus:ring-4 focus:ring-foreground/10";
export const authButtonClass =
  "min-h-12 w-full rounded-xl bg-ink px-5 text-base font-bold text-ink-foreground transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
