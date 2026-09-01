import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getPublishedGuide } from "@/lib/guides.functions";

export const Route = createFileRoute("/guides/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/recipes/$slug",
      params: { slug: params.slug },
      replace: true,
      statusCode: 301,
    });
  },
  loader: async ({ params }) => {
    const guide = await getPublishedGuide({ data: { slug: params.slug } });
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Guide not found | LegitBodyFix" }] };
    const title = `${loaderData.title} — Movement Guide | LegitBodyFix`;
    const description = (
      loaderData.pattern_summary ?? `A movement guide for ${loaderData.title.toLowerCase()}.`
    ).slice(0, 155);
    const ogImage = `https://move-system-landing.lovable.app/og/guide/${params.slug}.png`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
  notFoundComponent: () => (
    <Shell>
      <h1 className="text-3xl font-extrabold uppercase">Guide not published</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        This movement guide is still in editorial review.
      </p>
    </Shell>
  ),
  errorComponent: () => (
    <Shell>
      <h1 className="text-3xl font-extrabold uppercase">Guide unavailable</h1>
      <p className="mt-3 text-muted-foreground">Please reload the page in a moment.</p>
    </Shell>
  ),
  component: GuideDetail,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-24">{children}</main>
      <SiteFooter />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </p>
  );
}

function GuideDetail() {
  const guide = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 pb-14 pt-10 lg:px-8 lg:pb-20 lg:pt-14">
            <Label>Movement guide</Label>
            <h1 className="mt-4 max-w-3xl text-[2.6rem] font-extrabold uppercase leading-[0.92] sm:text-6xl">
              {guide.title}
            </h1>
            {guide.pattern_summary ? (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {guide.pattern_summary}
              </p>
            ) : null}
            {guide.common_regions?.length ? (
              <ul className="mt-7 flex flex-wrap gap-2">
                {guide.common_regions.map((region: string) => (
                  <li
                    key={region}
                    className="rounded-full border border-foreground/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]"
                  >
                    {region}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="border-b border-border bg-secondary/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8">
            {guide.self_check ? (
              <div>
                <h2 className="text-2xl font-extrabold uppercase">Self-check</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {guide.self_check}
                </p>
              </div>
            ) : null}
            {guide.watch_for ? (
              <div className="rounded-sm border-2 border-foreground bg-card p-6">
                <Label>Watch for</Label>
                <p className="mt-3 text-sm leading-relaxed">{guide.watch_for}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:px-8 lg:py-20">
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold uppercase">Exercise recipes</h2>
              {guide.recipes.length ? (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {guide.recipes.map((recipe) => (
                    <li key={recipe.slug} className="overflow-hidden rounded-sm border border-border bg-card">
                      <Link
                        to="/recipes/$slug"
                        params={{ slug: recipe.slug }}
                        className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {recipe.image_url ? (
                          <span className="block aspect-[16/9] overflow-hidden border-b border-border bg-secondary">
                            <img
                              src={recipe.image_url}
                              alt={recipe.image_alt ?? recipe.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                          </span>
                        ) : null}
                        <span className="flex min-h-28 flex-col p-4">
                          <span className="block text-base font-bold">{recipe.title}</span>
                          {recipe.goal ? (
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{recipe.goal}</span>
                          ) : null}
                          <span className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.16em]">View recipe →</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No published recipes linked yet.
                </p>
              )}

              <h2 className="mt-12 text-2xl font-extrabold uppercase">Muscles involved</h2>
              {guide.muscles.length ? (
                <ul className="mt-4 border-t border-border">
                  {guide.muscles.map((muscle) => (
                    <li key={muscle.id} className="border-b border-border">
                      <Link
                        to="/muscles/$muscleId"
                        params={{ muscleId: muscle.id }}
                        className="flex min-h-12 items-center justify-between gap-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="text-sm font-bold">{muscle.name}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {muscle.role ?? muscle.group ?? "—"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No published muscle entries linked yet.
                </p>
              )}
            </div>

            <aside className="space-y-6">
              <Label>Most relevant program</Label>
              {guide.programs.length ? (
                guide.programs.map((program) => (
                  <div key={program.slug} className="rounded-sm border border-border bg-card p-6">
                    <p className="text-lg font-extrabold uppercase leading-tight">{program.name}</p>
                    {program.outcome ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {program.outcome}
                      </p>
                    ) : null}
                    <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-foreground/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                      {program.published ? "Available" : "Coming soon"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No program linked yet.</p>
              )}
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
