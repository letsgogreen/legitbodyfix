import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ImageIcon } from "lucide-react";
import type { listPublishedRecipes } from "@/lib/recipes.functions";

function resolveRecipeImageUrl(imageUrl: string) {
  if (/^(?:https?:)?\/\//i.test(imageUrl) || imageUrl.startsWith("/")) return imageUrl;
  return `/${imageUrl.replace(/^\.\//, "")}`;
}

type Recipe = Awaited<ReturnType<typeof listPublishedRecipes>>[number];

export function RecipeCard({
  recipe,
  index,
  preview = false,
}: {
  recipe: Recipe;
  index: number;
  preview?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(recipe.image_url) && !imageFailed;

  const content = (
    <>
      <span className="relative block aspect-[16/9] overflow-hidden border-b border-border bg-secondary">
        {!showImage && (
          <span
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,hsl(var(--secondary))_0%,hsl(var(--background))_100%)] text-muted-foreground"
            aria-hidden="true"
          >
            <ImageIcon className="h-6 w-6 opacity-50" strokeWidth={1.5} />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em]">
              Visual coming soon
            </span>
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
        <span className="absolute left-4 top-4 border border-foreground/20 bg-background/90 px-2 py-1 font-mono text-[9px] font-bold tracking-[0.16em] backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </span>
      </span>
      <span className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          {recipe.regions?.join(" · ") || "Movement recipe"}
        </span>
        <span className="mt-3 text-xl font-extrabold leading-tight transition-colors group-hover:text-muted-foreground">
          {recipe.title}
        </span>
        <span className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {recipe.goal || recipe.summary}
        </span>
        {preview ? (
          <span className="mt-4 border-t border-border pt-4 text-xs font-bold">
            Verify your email to read the full guide
          </span>
        ) : (
          <span className="mt-auto flex items-center justify-between border-t border-border pt-5 text-xs font-bold">
            <span>Open guide</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </span>
    </>
  );

  return (
    <li className="min-w-0 bg-card">
      {preview ? (
        <div className="flex h-full flex-col">{content}</div>
      ) : (
        <Link
          to="/recipes/$slug"
          params={{ slug: recipe.slug }}
          className="group flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {content}
        </Link>
      )}
    </li>
  );
}
