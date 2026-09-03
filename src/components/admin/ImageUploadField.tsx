import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { uploadContentImage } from "@/lib/content-images.functions";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function ImageUploadField({
  value,
  alt,
  folder,
  bucket = "content-images",
  label = "Image",
  showAlt = true,
  onChange,
  onAltChange,
  onUploaded,
  previewVersion,
}: {
  value: string;
  alt: string;
  folder: string;
  bucket?: "content-images" | "program-images" | "lesson-images" | "recipe-images" | "muscle-images" | "region-images";
  label?: string;
  showAlt?: boolean;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  onUploaded?: (url: string) => void | Promise<void>;
  previewVersion?: string | number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadInFlight = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function upload(file: File) {
    if (uploadInFlight.current) return;
    setError("");
    setMessage("");
    if (!ACCEPTED.has(file.type)) {
      setError("Use a JPG, PNG, WebP, GIF, or AVIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 10 MB or smaller.");
      return;
    }

    uploadInFlight.current = true;
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file, safeName(file.name) || "image");
      form.set("folder", folder);
      form.set("bucket", bucket);
      const result = await uploadContentImage({ data: form });
      onChange(result.url);
      await onUploaded?.(result.url);
      if (!onUploaded) setMessage("Image uploaded. Save this item to apply the image.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      uploadInFlight.current = false;
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </label>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-9 items-center gap-2 rounded-sm bg-ink px-3 text-xs font-bold text-ink-foreground disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Processing image…" : "Upload image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          disabled={uploading}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.currentTarget.value = "";
          }}
        />
      </div>

      <div className="grid min-h-44 place-items-center overflow-hidden rounded-sm border border-border bg-white">
        {value ? (
          <img src={cacheBustedImageSrc(value, previewVersion)} alt={alt} className="max-h-64 w-full object-contain p-3" />
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-7 w-7" />
            <p className="mt-2 text-xs">No image selected</p>
          </div>
        )}
      </div>

      <label className="block space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Image URL</span>
        <input value={value} disabled={uploading} onChange={(event) => { setMessage(""); onChange(event.target.value); }} className="min-h-10 w-full rounded-sm border border-border bg-background px-3 text-sm" placeholder="https://…" />
      </label>
      {showAlt && <label className="block space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Alt text</span>
        <input value={alt} onChange={(event) => onAltChange?.(event.target.value)} className="min-h-10 w-full rounded-sm border border-border bg-background px-3 text-sm" placeholder="Describe what the image shows" />
      </label>}
      <p className="text-xs leading-5 text-muted-foreground">JPG, PNG, WebP, GIF, or AVIF · max 10 MB. Uploads are stored in the {bucket} Supabase Storage bucket.</p>
      {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
      {error && <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function cacheBustedImageSrc(src: string, version?: string | number) {
  if (!version) return src;
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}preview=${encodeURIComponent(String(version))}`;
}
