import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { bodyRegions } from "@/data/body-regions";
import { supabase } from "@/integrations/supabase/client";

type MediaOverride = { image_url: string; image_alt: string };

export function BodyRegionGrid() {
  const [media, setMedia] = useState<Record<string, MediaOverride>>({});

  useEffect(() => {
    let active = true;
    void supabase
      .from("site_media")
      .select("key,image_url,image_alt")
      .like("key", "body-region:%")
      .then(({ data }) => {
        if (!active || !data) return;
        setMedia(Object.fromEntries(data.map((item) => [item.key, item])));
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {bodyRegions.map((region) => {
        const override = media[`body-region:${region.slug}`];
        const imageUrl = override?.image_url || region.imageUrl;
        const imageAlt = override?.image_alt || region.imageAlt;
        return (
        <Link
          key={region.slug}
          to="/movement-check"
          search={{ region: region.slug }}
          className="group min-w-0 bg-card outline-none transition-colors hover:bg-secondary focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <div className="relative h-36 overflow-hidden border-b border-border bg-white sm:h-40">
            <img
              src={imageUrl}
              alt={imageAlt}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="absolute left-3 top-3 bg-background/95 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em]">
              {region.title}
            </span>
          </div>
          <div className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold">{region.title}</h3>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {region.description}
            </p>
          </div>
        </Link>
        );
      })}
    </div>
  );
}
