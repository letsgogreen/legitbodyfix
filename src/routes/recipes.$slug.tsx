import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getPublishedRecipe, type RecipeMuscleLink } from "@/lib/recipes.functions";
import { regionNameFor } from "@/lib/notion/regions";

export const Route = createFileRoute("/recipes/$slug")({
  loader: async ({ params }) => {
    const recipe = await getPublishedRecipe({ data: { slug: params.slug } });
    if (!recipe) throw notFound();
    return recipe;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Recipe not found | LegitBodyFix" }] };
    const ogImage = `https://move-system-landing.lovable.app/og/recipe/${params.slug}.png`;
    const title = `${loaderData.title} — Movement Guide | LegitBodyFix`;
    const description =
      loaderData.summary ??
      loaderData.goal ??
      `A reviewed movement guide for ${loaderData.title.toLowerCase()}.`;
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
      <h1 className="text-3xl font-extrabold uppercase">Movement content unavailable</h1>
      <p className="mt-3 text-muted-foreground">Please reload the page in a moment.</p>
    </Shell>
  ),
  notFoundComponent: () => (
    <Shell>
      <h1 className="text-3xl font-extrabold uppercase">Movement content not published</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        This content is still in editorial review. Nothing publishes here until its instructions,
        safety context and muscle links have passed review.
      </p>
      <Link to="/" hash="recipes" className="mt-6 inline-flex text-sm font-bold underline">
        Back to movement content
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

function MuscleList({ items, tone }: { items: RecipeMuscleLink[]; tone: "tight" | "weak" }) {
  if (items.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No published muscle entries linked yet for this role.
      </p>
    );
  }

  return (
    <ul className="mt-3 border-t border-border">
      {items.map((muscle) => (
        <li key={`${tone}-${muscle.id}`} className="border-b border-border">
          <Link
            to="/muscles/$muscleId"
            params={{ muscleId: muscle.id }}
            className="flex min-h-12 items-center justify-between gap-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-sm font-bold">{muscle.name}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {muscle.group ?? "—"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TextBlock({ value }: { value: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
      {value
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => (
          <p key={index}>{line}</p>
        ))}
    </div>
  );
}

function RecipeDetail() {
  const recipe = Route.useLoaderData();
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
              to="/"
              hash="recipes"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All movement content
            </Link>

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
              <div className="min-w-0">
                <Label>Movement guide</Label>
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

              {recipe.image_url ? (
                <figure className="overflow-hidden rounded-sm border border-border bg-secondary">
                  <img
                    src={recipe.image_url}
                    alt={recipe.image_alt ?? recipe.title}
                    className="h-full max-h-[26rem] w-full object-cover"
                  />
                </figure>
              ) : null}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-secondary/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8">
            <div>
              <Label>Typically overactive / tight</Label>
              <MuscleList items={recipe.tight} tone="tight" />
            </div>
            <div>
              <Label>Typically underactive / weak</Label>
              <MuscleList items={recipe.weak} tone="weak" />
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:px-8 lg:py-20">
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold uppercase">Instructions</h2>
              <TextBlock value={recipe.instructions} />

              {recipe.assessment_clues ? (
                <div className="mt-10">
                  <h2 className="text-2xl font-extrabold uppercase">What to look for</h2>
                  <TextBlock value={recipe.assessment_clues} />
                </div>
              ) : null}
            </div>

            <aside className="space-y-8">
              {recipe.dosage ? (
                <div className="rounded-sm border border-border bg-card p-6">
                  <Label>Dosage</Label>
                  <p className="mt-3 text-sm leading-relaxed">{recipe.dosage}</p>
                </div>
              ) : null}

              {(recipe.equipment ?? []).length > 0 ? (
                <div className="rounded-sm border border-border bg-card p-6">
                  <Label>Equipment</Label>
                  <p className="mt-3 text-sm leading-relaxed">
                    {(recipe.equipment as string[]).join(", ")}
                  </p>
                </div>
              ) : null}

              {recipe.safety_notes ? (
                <div className="rounded-sm border-2 border-foreground bg-card p-6">
                  <Label>Safety</Label>
                  <TextBlock value={recipe.safety_notes} />
                </div>
              ) : null}
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
