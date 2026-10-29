import { useState } from "react";
import { isAllowedHttpUrl } from "@/lib/recipe-blocks";

export function MuscleCardImage({ urls, className = "" }: { urls: string[]; className?: string }) {
  const [failed, setFailed] = useState<string[]>([]);
  const images = [...new Set(urls)].filter((url) => isAllowedHttpUrl(url) && !failed.includes(url)).slice(0, 3);
  return <span className={`grid min-h-24 items-center justify-items-center gap-1 overflow-hidden bg-secondary/40 p-2 ${className}`} style={{gridTemplateColumns: `repeat(${Math.max(images.length, 1)}, minmax(0, 1fr))`}}>
    {images.length ? images.map((url) => <img key={url} src={url} alt="" aria-hidden="true" loading="lazy" width={160} height={160} onError={() => setFailed((current) => [...current, url])} className="h-full max-h-40 w-full object-contain" />) : <span className="text-center text-xs font-normal text-muted-foreground">No image yet</span>}
  </span>;
}
