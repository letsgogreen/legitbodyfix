import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { LearnNav } from "@/components/site/LearnNav";
import { LearnRegionFilter } from "@/components/site/LearnRegionFilter";
import { findBodyRegion } from "@/data/body-regions";
import { listPublishedRecipes } from "@/lib/recipes.functions";

export const Route = createFileRoute("/recipes/")({
  validateSearch: (search: Record<string, unknown>) => ({
    region:
      typeof search["region"] === "string" && findBodyRegion(search["region"])
        ? search["region"]
        : undefined,
  }),
  loader: () => listPublishedRecipes(),
  head: () => ({
    meta: [
      { title: "Posture & Movement Recipes | LegitBodyFix" },
      {
        name: "description",
        content: "Explore published posture and movement recipes by body region.",
      },
    ],
  }),
  component: PostureRecipes,
});

function PostureRecipes() {
  const recipes = Route.useLoaderData();
  const { region: selectedRegion } = Route.useSearch();
  const activeRegion = findBodyRegion(selectedRegion);
  const filteredRecipes = activeRegion
    ? recipes.filter((recipe) => {
        const aliases = activeRegion.slug === "spine-rib-cage"
          ? ["spine-rib-cage", "spine-ribs"]
          : [activeRegion.slug];
        return recipe.regions?.some((region: string) => aliases.includes(region));
      })
    : recipes;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
<LearnNav active="posture" region={activeRegion?.slug} />

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Learn · Posture</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold uppercase leading-[0.95] sm:text-6xl">Posture &amp; movement recipes</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Practical starting points for posture, mobility, control, and movement preparation. These resources are educational and are not a diagnosis.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="mb-10"><LearnRegionFilter region={activeRegion?.slug} to="/recipes" noun="recipes" /></div>

          <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
            <h2 className="text-2xl font-extrabold uppercase">Published recipes</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{filteredRecipes.length} available</span>
          </div>

          {filteredRecipes.length ? (
            <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((recipe) => (
                <li key={recipe.slug} className="min-w-0 bg-card">
                  <Link to="/recipes/$slug" params={{ slug: recipe.slug }} className="group flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {recipe.image_url ? (
                      <span className="block aspect-[16/10] overflow-hidden border-b border-border bg-secondary">
                        <img src={recipe.image_url} alt={recipe.image_alt ?? recipe.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                      </span>
                    ) : (
                      <span className="flex aspect-[16/10] items-center justify-center border-b border-border bg-secondary px-6 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Image in editorial review</span>
                    )}
                    <span className="flex flex-1 flex-col p-5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{recipe.regions?.join(" · ") || "Movement recipe"}</span>
                      <span className="mt-3 text-xl font-extrabold leading-tight">{recipe.title}</span>
                      <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{recipe.goal || recipe.summary}</span>
                      <span className="mt-auto pt-6 text-xs font-bold">Read the recipe →</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border border-border bg-card p-6">
              <p className="text-sm font-bold">No published recipes for this region yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Try another body region or return to the complete posture library.</p>
              <Link to="/recipes" search={{ region: undefined }} className="mt-5 inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4">View all recipes</Link>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
