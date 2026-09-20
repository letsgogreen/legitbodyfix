import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { getAboutCopy } from "@/lib/about.functions";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About LegitBodyFix" },
      { name: "description", content: "Learn how LegitBodyFix organizes movement education and guided programs." },
    ],
  }),
  loader: () => getAboutCopy(),
  component: AboutPage,
});

function AboutPage() {
  const copy = Route.useLoaderData();
  return <div className="min-h-screen bg-background text-foreground">
    <SiteNav />
    <main>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
          <p className="font-mono text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">{copy.about_eyebrow}</p>
          <h1 className="mt-5 max-w-4xl break-words text-4xl font-black uppercase leading-[.92] tracking-[-.04em] sm:text-7xl">{copy.about_title}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">{copy.about_intro}</p>
        </div>
      </section>
      <section className="border-b border-border bg-secondary/35">
        <div className="mx-auto grid max-w-5xl gap-px bg-border px-5 py-14 md:grid-cols-2 lg:px-8 lg:py-20">
          <article className="bg-background p-7 sm:p-9"><h2 className="text-2xl font-extrabold">{copy.about_method_title}</h2><p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">{copy.about_method_body}</p></article>
          <article className="bg-background p-7 sm:p-9"><h2 className="text-2xl font-extrabold">{copy.about_scope_title}</h2><p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">{copy.about_scope_body}</p></article>
        </div>
      </section>
      <section className={`mx-auto grid max-w-5xl gap-10 px-5 py-14 lg:px-8 lg:py-20 ${copy.about_credentials_body.trim() ? "md:grid-cols-2" : ""}`}><article><h2 className="text-3xl font-black uppercase">{copy.about_operator_title}</h2><p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">{copy.about_operator_body}</p></article>{copy.about_credentials_body.trim() && <article><h2 className="text-3xl font-black uppercase">{copy.about_credentials_title}</h2><p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">{copy.about_credentials_body}</p></article>}</section>
    </main>
    <SiteFooter />
  </div>;
}
