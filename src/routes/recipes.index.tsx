import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { LearnNav } from "@/components/site/LearnNav";
import { LearnRegionFilter } from "@/components/site/LearnRegionFilter";
import { findBodyRegion } from "@/data/body-regions";
import { getRecipeLibrary } from "@/lib/recipes.functions";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export const Route = createFileRoute("/recipes/")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    region:
      typeof search["region"] === "string" && findBodyRegion(search["region"])
        ? search["region"]
        : undefined,
  }),
  loader: () => getRecipeLibrary(),
  head: () => ({
    meta: [
      { title: "Corrective Movement Strategies | LegitBodyFix" },
      {
        name: "description",
        content: "Explore published corrective movement strategies by body region.",
      },
    ],
  }),
  component: PostureRecipes,
});

function PostureRecipes() {
  const recipes = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const { region: selectedRegion } = Route.useSearch();
  const activeRegion = findBodyRegion(selectedRegion);
  const regionRecipes = activeRegion
    ? recipes.filter((recipe) => {
        const aliases = activeRegion.slug === "spine-rib-cage"
          ? ["spine-rib-cage", "spine-ribs"]
          : [activeRegion.slug];
        return recipe.regions?.some((region: string) => aliases.includes(region));
      })
    : recipes;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRecipes = normalizedQuery
    ? regionRecipes.filter((recipe) => [recipe.title, recipe.goal, recipe.summary, ...(recipe.regions ?? [])].join(" ").toLowerCase().includes(normalizedQuery))
    : regionRecipes;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
<LearnNav active="posture" region={activeRegion?.slug} />

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end lg:px-8 lg:py-16">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Learn · Posture</p>
              <h1 className="mt-4 max-w-4xl text-4xl font-extrabold uppercase leading-[0.92] sm:text-6xl">Corrective Movement Strategies</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Practical starting points for posture, mobility, control, and movement preparation. These resources are educational and are not a diagnosis.
              </p>
            </div>
            <div className="border-l-2 border-accent pl-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Library</p>
              <p className="mt-2 text-3xl font-extrabold">{recipes.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">Published corrective movement strategies</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <div className="grid gap-7 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <LearnRegionFilter region={activeRegion?.slug} to="/recipes" noun="recipes" />
            <label className="block">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Search this library</span>
              <span className="relative mt-2 block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search guides" className="min-h-12 w-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-foreground" />
              </span>
            </label>
          </div>

          <div className="mb-6 mt-9 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold uppercase">Published recipes</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{filteredRecipes.length} available</span>
          </div>

          {filteredRecipes.length ? (
            <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((recipe, index) => <RecipeCard key={recipe.slug} recipe={recipe} index={index} />)}
            </ul>
          ) : (
            <div className="border border-border bg-card p-6">
              <p className="text-sm font-bold">No matching recipes found.</p>
              <p className="mt-2 text-sm text-muted-foreground">Clear the search or try another body region.</p>
              <button type="button" onClick={() => setQuery("")} className="mt-5 inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4">Clear search</button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
