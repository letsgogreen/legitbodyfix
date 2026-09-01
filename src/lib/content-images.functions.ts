import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CONTENT_IMAGE_BUCKETS = [
  "content-images",
  "program-images",
  "lesson-images",
  "recipe-images",
  "muscle-images",
  "region-images",
] as const;
type ContentImageBucket = typeof CONTENT_IMAGE_BUCKETS[number];
const DEFAULT_CONTENT_IMAGE_BUCKET: ContentImageBucket = "content-images";
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

function parseBucket(value: FormDataEntryValue | null): ContentImageBucket {
  if (!value) return DEFAULT_CONTENT_IMAGE_BUCKET;
  return z.enum(CONTENT_IMAGE_BUCKETS).parse(value);
}

async function getAdminStorageClient(bucket: ContentImageBucket) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.getBucket(bucket);
  if (data) return supabaseAdmin;

  const { error } = await supabaseAdmin.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: [...ACCEPTED],
  });
  if (error && !/already exists/i.test(error.message)) throw new Error(error.message);
  return supabaseAdmin;
}

function contentImagePath(url: string | null | undefined, bucket: ContentImageBucket) {
  if (!url) return null;
  try {
    const pathname = new URL(url).pathname;
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex < 0) return null;

    const path = decodeURIComponent(pathname.slice(markerIndex + marker.length));
    if (!path || path.startsWith("/") || path.split("/").includes("..")) return null;
    return path;
  } catch {
    return null;
  }
}

export async function removeStoredContentImages(
  storageClient: { storage: { from: (bucket: string) => { remove: (paths: string[]) => PromiseLike<{ error: { message: string } | null }> } } },
  bucket: ContentImageBucket,
  urls: Array<string | null | undefined>,
) {
  const paths = [...new Set(urls.map((url) => contentImagePath(url, bucket)).filter((path): path is string => Boolean(path)))];
  if (paths.length === 0) return;

  const { error } = await storageClient.storage.from(bucket).remove(paths);
  if (error) throw new Error(error.message);
}

function storageSetupMessage(error: Error, bucket: ContentImageBucket) {
  if (/invalid api key|bucket not found|not found/i.test(error.message)) {
    return `Image storage is not ready. Create a public Supabase Storage bucket named ${bucket}, or fix SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY in Vercel so the app can create it automatically.`;
  }
  return error.message;
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
    const bucket = parseBucket(data.get("bucket"));
    if (!(file instanceof File)) throw new Error("Choose an image file first.");
    if (!ACCEPTED.has(file.type)) throw new Error("Use a JPG, PNG, WebP, GIF, or AVIF image.");
    if (file.size > MAX_BYTES) throw new Error("Image must be 10 MB or smaller.");

    const cleanFolder = safeSegment(folder) || "uploads";
    const cleanName = safeName(file.name) || "image";
    const path = `${cleanFolder}/${Date.now()}-${cleanName}`;

    let storageClient = context.supabase;
    try {
      storageClient = await getAdminStorageClient(bucket);
    } catch (cause) {
      // Fall back to the authenticated admin session. This works when the
      // selected bucket and admin RLS policies already exist, even if the
      // service-role env is missing or wrong in production.
      storageClient = context.supabase;
    }

    const { error } = await storageClient.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (error) throw new Error(storageSetupMessage(error, bucket));

    const { data: publicUrl } = storageClient.storage.from(bucket).getPublicUrl(path);
    return { url: publicUrl.publicUrl, path, bucket };
  });
