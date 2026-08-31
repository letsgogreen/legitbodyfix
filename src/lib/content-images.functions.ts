import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CONTENT_IMAGE_BUCKET = "content-images";
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return adminClaims.app_metadata?.is_admin === true && adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}

function safeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._/-]+/g, "-").replace(/\/{2,}/g, "/").replace(/^\/+|\/+$/g, "");
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function getAdminStorageClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.getBucket(CONTENT_IMAGE_BUCKET);
  if (data) return supabaseAdmin;

  const { error } = await supabaseAdmin.storage.createBucket(CONTENT_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: [...ACCEPTED],
  });
  if (error && !/already exists/i.test(error.message)) throw new Error(error.message);
  return supabaseAdmin;
}

export const uploadContentImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => {
    if (!(input instanceof FormData)) throw new Error("Expected image upload form data.");
    return input;
  })
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");

    const file = data.get("file");
    const folder = z.string().min(1).max(160).parse(data.get("folder"));
    if (!(file instanceof File)) throw new Error("Choose an image file first.");
    if (!ACCEPTED.has(file.type)) throw new Error("Use a JPG, PNG, WebP, GIF, or AVIF image.");
    if (file.size > MAX_BYTES) throw new Error("Image must be 10 MB or smaller.");

    const supabaseAdmin = await getAdminStorageClient();
    const cleanFolder = safeSegment(folder) || "uploads";
    const cleanName = safeName(file.name) || "image";
    const path = `${cleanFolder}/${Date.now()}-${cleanName}`;
    const { error } = await supabaseAdmin.storage
      .from(CONTENT_IMAGE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (error) throw new Error(error.message);

    const { data: publicUrl } = supabaseAdmin.storage.from(CONTENT_IMAGE_BUCKET).getPublicUrl(path);
    return { url: publicUrl.publicUrl, path };
  });
