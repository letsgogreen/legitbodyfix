import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RecipeBlockContent } from "@/components/recipes/RecipeBlockContent";
import { ForwardLeanContext } from "@/components/recipes/ForwardLeanContext";
import { forwardLeanSlug } from "@/data/recipe-pattern-connections";
import { getPublishedRecipe } from "@/lib/recipes.functions";
import { regionNameFor } from "@/lib/notion/regions";
import { blocksFromLegacyInstructions, normalizeRecipeBlocks } from "@/lib/recipe-blocks";

export const Route = createFileRoute("/recipes/$slug")({
  loader: async ({ params }) => {
    const recipe = await getPublishedRecipe({ data: { slug: params.slug } });
    if (!recipe) throw notFound();
    return recipe;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Recipe not found | LegitBodyFix" }] };
    const ogImage = `https://move-system-landing.lovable.app/og/recipe/${params.slug}.png`;
    const title = `${loaderData.title} — Corrective Movement Strategy | LegitBodyFix`;
    const description =
      loaderData.summary ??
      loaderData.goal ??
      `A reviewed corrective movement strategy for ${loaderData.title.toLowerCase()}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
  errorComponent: () => (
    <Shell>
      <h1 className="text-3xl font-extrabold uppercase">Corrective movement strategy unavailable</h1>
      <p className="mt-3 text-muted-foreground">Please reload the page in a moment.</p>
    </Shell>
  ),
  notFoundComponent: () => (
    <Shell>
      <h1 className="text-3xl font-extrabold uppercase">Corrective movement strategy not published</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        This content is still in editorial review. Nothing publishes here until its instructions,
        safety context and muscle links have passed review.
      </p>
      <Link to="/" hash="recipes" className="mt-6 inline-flex text-sm font-bold underline">
        Back to corrective movement strategies
      </Link>
    </Shell>
  ),
  component: RecipeDetail,
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

function RecipeDetail() {
  const recipe = Route.useLoaderData();
  const [imageFailed, setImageFailed] = useState(false);
  const storedBlocks = normalizeRecipeBlocks(recipe.content_blocks);
  const contentBlocks = storedBlocks.length
    ? storedBlocks
    : blocksFromLegacyInstructions(recipe.instructions);
  const meta = [
    recipe.progression_level ? recipe.progression_level.replace(/_/g, " ") : null,
    recipe.session_minutes ? `${recipe.session_minutes} min` : null,
    ...(recipe.regions ?? []).map((region: string) => regionNameFor(region)),
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main>
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 pb-14 pt-10 lg:px-8 lg:pb-20 lg:pt-14">
            <Link
              to="/recipes"
              search={{ region: undefined }}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All corrective movement strategies
            </Link>

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
              <div className="min-w-0">
                <Label>Corrective movement strategy</Label>
                <h1 className="mt-4 text-[2.6rem] font-extrabold uppercase leading-[0.92] sm:text-5xl">
                  {recipe.title}
                </h1>
                {recipe.goal ? (
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {recipe.goal}
                  </p>
                ) : null}

                {meta.length > 0 ? (
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {meta.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-foreground/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {recipe.image_url && !imageFailed ? (
                <figure className="overflow-hidden rounded-sm border border-border bg-secondary">
                  <img
                    src={recipe.image_url}
                    alt={recipe.image_alt ?? recipe.title}
                    className="h-full max-h-[26rem] w-full object-contain p-2"
                    onError={() => setImageFailed(true)}
                  />
                </figure>
              ) : (
                <div
                  className="grid min-h-56 place-items-center rounded-sm border border-border bg-[linear-gradient(135deg,hsl(var(--secondary))_0%,hsl(var(--background))_100%)] text-muted-foreground"
                  aria-label="Cover visual unavailable"
                >
                  <span className="flex flex-col items-center gap-3">
                    <ImageIcon className="h-7 w-7 opacity-45" strokeWidth={1.5} aria-hidden="true" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em]">
                      Guide visual unavailable
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <div className="min-w-0">
              <RecipeBlockContent blocks={contentBlocks} muscleDictionary={recipe.muscleDictionary} />
            </div>
          </div>
        </section>
        {recipe.slug === forwardLeanSlug ? <ForwardLeanContext relatedRecipes={recipe.relatedRecipes} /> : null}
      </main>

      <SiteFooter />
    </div>
  );
}
