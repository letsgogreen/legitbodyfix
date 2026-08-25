import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const RECIPE_IMAGE_BUCKET = "recipe-images";

/** Notion cover URLs are signed and expire in ~1 hour, so we copy the bytes into our own storage. */
export function coverUrlFromPage(page: Record<string, unknown>): string | null {
  const cover = page["cover"] as Record<string, unknown> | null | undefined;
  if (!cover) return null;
  const type = String(cover["type"] ?? "");
  const holder = cover[type] as { url?: string } | undefined;
  return holder?.url ?? null;
}

function extensionFor(contentType: string, url: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("avif")) return "avif";
  if (/\.png(\?|$)/i.test(url)) return "png";
  if (/\.webp(\?|$)/i.test(url)) return "webp";
  return "jpg";
}

/** Some Notion assets answer with a malformed header (e.g. bare `image`), which Storage rejects. */
function sanitizeContentType(raw: string | null, bytes: Uint8Array, url: string) {
  if (raw && /^[\w.+-]+\/[\w.+-]+$/.test(raw.split(";")[0]!.trim())) return raw.split(";")[0]!.trim();
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return "image/gif";
  if (bytes[8] === 0x57 && bytes[9] === 0x45) return "image/webp";
  if (/\.png(\?|$)/i.test(url)) return "image/png";
  if (/\.webp(\?|$)/i.test(url)) return "image/webp";
  return "image/jpeg";
}


export type RehostResult = {
  recipeId: string;
  slug: string;
  storagePath: string;
  publicUrl: string;
  bytes: number;
  contentType: string;
};

/** Downloads a Notion cover image and stores it in Supabase Storage, then points the recipe at it. */
export async function rehostCover(input: {
  recipeId: string;
  slug: string;
  sourceUrl: string;
  alt: string;
}): Promise<RehostResult> {
  const response = await fetch(input.sourceUrl);
  if (!response.ok) {
    throw new Error(`Cover download failed [${response.status}]: ${await response.text()}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const contentType = sanitizeContentType(response.headers.get("content-type"), bytes, input.sourceUrl);
  const storagePath = `${input.recipeId}/cover.${extensionFor(contentType, input.sourceUrl)}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(RECIPE_IMAGE_BUCKET)
    .upload(storagePath, bytes, { contentType, upsert: true });
  if (uploadError) throw uploadError;

  // Served through our own route so the private bucket never needs a signed, expiring URL.
  const publicUrl = `/api/public/recipe-image/${storagePath}`;

  const { error: updateError } = await supabaseAdmin
    .from("recipes")
    .update({ image_url: publicUrl, image_alt: input.alt })
    .eq("id", input.recipeId);
  if (updateError) throw updateError;

  return {
    recipeId: input.recipeId,
    slug: input.slug,
    storagePath,
    publicUrl,
    bytes: bytes.byteLength,
    contentType,
  };
}
