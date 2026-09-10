import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ImageIcon, Search } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { LearnNav } from "@/components/site/LearnNav";
import { LearnRegionFilter } from "@/components/site/LearnRegionFilter";
import { findBodyRegion } from "@/data/body-regions";
import { listPublishedRecipes } from "@/lib/recipes.functions";

function resolveRecipeImageUrl(imageUrl: string) {
  if (/^(?:https?:)?\/\//i.test(imageUrl) || imageUrl.startsWith("/")) return imageUrl;
  return `/${imageUrl.replace(/^\.\//, "")}`;
}

type Recipe = Awaited<ReturnType<typeof listPublishedRecipes>>[number];

function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(recipe.image_url) && !imageFailed;

  return (
    <li className="min-w-0 bg-card">
      <Link to="/recipes/$slug" params={{ slug: recipe.slug }} className="group flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <span className="relative block aspect-[16/9] overflow-hidden border-b border-border bg-secondary">
          {!showImage && (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,hsl(var(--secondary))_0%,hsl(var(--background))_100%)] text-muted-foreground" aria-hidden="true">
              <ImageIcon className="h-6 w-6 opacity-50" strokeWidth={1.5} />
              <span className="font-mono text-[9px] uppercase tracking-[0.18em]">Visual coming soon</span>
            </span>
          )}
          {showImage && (
            <img
              src={resolveRecipeImageUrl(recipe.image_url!)}
              alt={recipe.image_alt ?? recipe.title}
              loading="lazy"
              className="relative h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
              onError={() => setImageFailed(true)}
            />
          )}
          <span className="absolute left-4 top-4 border border-foreground/20 bg-background/90 px-2 py-1 font-mono text-[9px] font-bold tracking-[0.16em] backdrop-blur-sm">{String(index + 1).padStart(2, "0")}</span>
        </span>
        <span className="flex flex-1 flex-col p-5 sm:p-6">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{recipe.regions?.join(" · ") || "Movement recipe"}</span>
          <span className="mt-3 text-xl font-extrabold leading-tight transition-colors group-hover:text-muted-foreground">{recipe.title}</span>
          <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{recipe.goal || recipe.summary}</span>
          <span className="mt-auto flex items-center justify-between border-t border-border pt-5 text-xs font-bold">
            <span>Open guide</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </span>
      </Link>
    </li>
  );
}

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
              <h1 className="mt-4 max-w-4xl text-4xl font-extrabold uppercase leading-[0.92] sm:text-6xl">Posture &amp; movement recipes</h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Practical starting points for posture, mobility, control, and movement preparation. These resources are educational and are not a diagnosis.
              </p>
            </div>
            <div className="border-l-2 border-accent pl-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Library</p>
              <p className="mt-2 text-3xl font-extrabold">{recipes.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">Published movement guides</p>
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
