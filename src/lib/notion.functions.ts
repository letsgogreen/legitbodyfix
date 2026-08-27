import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { RecipePreviewRow } from "@/lib/recipe-import";

export type RehostReport = {
  results: { slug: string; storagePath: string; publicUrl: string; bytes: number; contentType: string }[];
  skipped: { slug: string; reason: string }[];
  error: string | null;
};

function hasAdminAccess(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return adminClaims.app_metadata?.is_admin === true && adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}


/**
 * Admin-only. Copies Notion cover images for already-committed recipes into Supabase Storage and
 * repoints `recipes.image_url` at our own URL, so nothing depends on Notion's ~1h signed URLs.
 */
export const rehostRecipeCovers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { notionPageIds: string[] }) => ({
    notionPageIds: (data?.notionPageIds ?? []).map(String).filter(Boolean),
  }))
  .handler(async ({ data, context }): Promise<RehostReport> => {
    const isAdmin = hasAdminAccess(context.claims);
    if (!isAdmin) return { results: [], skipped: [], error: "Administrator access required." };

    const results: RehostReport["results"] = [];
    const skipped: RehostReport["skipped"] = [];

    try {
      const { coverUrlFromPage, rehostCover } = await import("@/lib/notion-images.server");
      const { notion } = await import("@/lib/notion-recipes.server");
      const { data: recipes } = await context.supabase
        .from("recipes")
        .select("id, slug, title, notion_page_id")
        .in("notion_page_id", data.notionPageIds);

      for (const recipe of recipes ?? []) {
        const page = await notion(`/pages/${recipe.notion_page_id}`);
        const sourceUrl = coverUrlFromPage(page);
        if (!sourceUrl) {
          skipped.push({ slug: recipe.slug, reason: "No Notion cover image on this page." });
          continue;
        }
        const stored = await rehostCover({
          recipeId: recipe.id,
          slug: recipe.slug,
          sourceUrl,
          alt: `${recipe.title} — corrective exercise recipe cover`,
        });
        results.push({
          slug: stored.slug,
          storagePath: stored.storagePath,
          publicUrl: stored.publicUrl,
          bytes: stored.bytes,
          contentType: stored.contentType,
        });
      }

      return { results, skipped, error: null };
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      console.error("rehostRecipeCovers failed:", message);
      return { results, skipped, error: message };
    }
  });

export type RecipePreviewResult = {
  rows: RecipePreviewRow[];
  error: string | null;
};

/**
 * Admin-only. Reads the Notion recipe library through the connector gateway, maps it onto the
 * `recipes` shape, and diffs it against what is already stored. Writes nothing.
 */
export const previewNotionRecipes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RecipePreviewResult> => {
    const isAdmin = hasAdminAccess(context.claims);
    if (!isAdmin) return { rows: [], error: "Administrator access required." };

    try {
      const { buildNotionRecipePreview } = await import("@/lib/notion-recipes.server");
      return { rows: await buildNotionRecipePreview(context.supabase as never), error: null };
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      console.error("previewNotionRecipes failed:", message);
      return { rows: [], error: message };
    }
  });
