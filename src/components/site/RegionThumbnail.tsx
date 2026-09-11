import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { bodyRegions, resolveBodyRegionMedia } from "@/data/body-regions";

/** Uses the same published image overrides as the homepage region picker. */
export function RegionThumbnail({ region }: { region: (typeof bodyRegions)[number] }) {
  const [media, setMedia] = useState<Record<string, { image_url: string; image_alt: string }>>({});
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void supabase
      .from("site_media")
      .select("key,image_url,image_alt")
      .like("key", "body-region:%")
      .then(({ data }) => {
        if (active && data) setMedia(Object.fromEntries(data.map((item) => [item.key, item])));
      });
    return () => {
      active = false;
    };
  }, []);
  const override = media[`body-region:${region.slug}`];
  const { imageUrl, imageAlt } = resolveBodyRegionMedia(region, override);
  return (
    <figure className="w-full overflow-hidden border border-border bg-card">
      <div className="flex aspect-[4/3] max-h-80 items-center justify-center overflow-hidden bg-white">
        {failedUrl !== imageUrl ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={imageAlt}
            decoding="async"
            className="h-full w-full object-contain p-4 motion-safe:transition-opacity"
            onError={() => setFailedUrl(imageUrl)}
          />
        ) : (
          <p className="p-6 text-sm text-muted-foreground">
            {region.title} anatomy image unavailable.
          </p>
        )}
      </div>
      <figcaption className="border-t border-border px-5 py-4 font-mono text-xs font-bold uppercase tracking-wider">
        {region.title} · Anatomy reference
      </figcaption>
    </figure>
  );
}
