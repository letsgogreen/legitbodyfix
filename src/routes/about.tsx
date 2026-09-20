import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About LegitBodyFix" },
      { name: "description", content: "Learn how LegitBodyFix organizes movement education and guided programs." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return <div className="min-h-screen bg-background text-foreground">
    <SiteNav />
    <main>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
          <p className="font-mono text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">About us</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[.92] tracking-[-.04em] sm:text-7xl">Movement education with a clear progression.</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">LegitBodyFix turns anatomy, movement patterns, and practical exercise progressions into focused resources you can revisit at your own pace.</p>
        </div>
      </section>
      <section className="border-b border-border bg-secondary/35">
        <div className="mx-auto grid max-w-5xl gap-px bg-border px-5 py-14 md:grid-cols-2 lg:px-8 lg:py-20">
          <article className="bg-background p-7 sm:p-9"><h2 className="text-2xl font-extrabold">How the material is built</h2><p className="mt-4 leading-7 text-muted-foreground">Resources connect a movement goal with relevant anatomy, a practical starting point, and a progression back to daily activity or training.</p></article>
          <article className="bg-background p-7 sm:p-9"><h2 className="text-2xl font-extrabold">Scope and credentials</h2><p className="mt-4 leading-7 text-muted-foreground">LegitBodyFix provides educational movement content, not medical diagnosis or treatment. Verified professional certification details will be listed here when they are supplied by the operator.</p></article>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-14 lg:px-8 lg:py-20"><h2 className="text-3xl font-black uppercase">Operator</h2><p className="mt-4 leading-7 text-muted-foreground">LegitBodyFix is operated by Song J. Questions about the content, access, or credentials can be sent to <a className="font-bold text-foreground underline" href="mailto:thriveinside@protonmail.com">thriveinside@protonmail.com</a>.</p></section>
    </main>
    <SiteFooter />
  </div>;
}
