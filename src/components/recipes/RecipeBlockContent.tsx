import type { RecipeContentBlock } from "@/lib/recipe-blocks";
import { youtubeEmbedUrl } from "@/lib/recipe-blocks";

export function RecipeBlockContent({ blocks }: { blocks: RecipeContentBlock[] }) {
  return <div className="space-y-6">{blocks.map((block) => {
    if (block.type === "heading") return block.level === 2
      ? <h2 key={block.id} className="pt-5 text-3xl font-extrabold leading-tight">{block.text}</h2>
      : <h3 key={block.id} className="pt-3 text-xl font-extrabold leading-tight">{block.text}</h3>;
    if (block.type === "paragraph") return <div key={block.id} className="whitespace-pre-wrap text-base leading-7 text-muted-foreground">{block.text}</div>;
    if (block.type === "toggle") return <details key={block.id} className="rounded-sm border border-border bg-card p-5"><summary className="cursor-pointer font-bold">{block.title}</summary><div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{block.text}</div></details>;
    if (block.type === "image") return block.url ? <figure key={block.id} className="overflow-hidden rounded-sm border border-border bg-card"><img src={block.url} alt={block.alt} loading="lazy" className="max-h-[44rem] w-full object-contain" />{block.caption ? <figcaption className="border-t border-border px-4 py-3 text-xs text-muted-foreground">{block.caption}</figcaption> : null}</figure> : null;
    if (block.type === "youtube") {
      const embed = youtubeEmbedUrl(block.url);
      return embed ? <figure key={block.id}><div className="aspect-video overflow-hidden rounded-sm border border-border bg-black"><iframe src={embed} title={block.caption || "YouTube video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="h-full w-full" /></div>{block.caption ? <figcaption className="mt-2 text-xs text-muted-foreground">{block.caption}</figcaption> : null}</figure> : null;
    }
    return <hr key={block.id} className="border-border" />;
  })}</div>;
}
