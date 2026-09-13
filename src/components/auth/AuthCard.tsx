import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AuthCard({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-12 text-foreground">
      <section className="w-full max-w-md border border-border bg-card p-7 sm:p-10">
        <Link to="/" aria-label="LegitBodyFix home" className="font-mono text-xs font-bold uppercase tracking-[0.2em]">LEGITBODYFIX<span className="text-accent" aria-hidden="true"> ●</span></Link>
        <p className="mt-10 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{body}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}

export const authInputClass = "min-h-12 w-full border border-border bg-background px-3 font-sans text-base normal-case tracking-normal outline-none focus:ring-2 focus:ring-foreground/20";
export const authButtonClass = "min-h-12 w-full bg-ink px-5 text-sm font-bold text-ink-foreground disabled:opacity-50";
