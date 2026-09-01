import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
        <p className="font-mono text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-5 border-l-4 border-accent pl-4 text-sm text-muted-foreground">Last updated September 1, 2026</p>
        <div className="mt-12 space-y-10 text-sm leading-7 text-muted-foreground [&_a]:font-bold [&_a]:text-foreground [&_a]:underline [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
