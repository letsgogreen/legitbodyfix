import type { ReactNode } from "react";
import { ExternalLink, Info, Quote } from "lucide-react";
import {
  isAllowedHttpUrl,
  normalizeRecipeBlocks,
  type RecipeContentBlock,
  youtubeEmbedUrl,
} from "@/lib/recipe-blocks";

const INLINE_MARKDOWN_PATTERN = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*/g;

function RichText({ value }: { value: string }) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of value.matchAll(INLINE_MARKDOWN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(value.slice(cursor, index));
    const href = match[2] ?? "";
    parts.push(
      match[3] ? (
        <strong key={`${index}-strong`} className="font-bold text-foreground">
          {match[3]}
        </strong>
      ) : isAllowedHttpUrl(href) ? (
        <a
          key={`${index}-${href}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-4"
        >
          {match[1]}
          <ExternalLink className="ml-1 inline h-3 w-3" aria-hidden="true" />
        </a>
      ) : (
        match[0]
      ),
    );
    cursor = index + match[0].length;
  }
  if (cursor < value.length) parts.push(value.slice(cursor));
  return <>{parts}</>;
}

function aspectClass(block: Extract<RecipeContentBlock, { type: "image" }>) {
  if (block.aspect === "video") return "aspect-video";
  if (block.aspect === "square") return "aspect-square";
  if (block.aspect === "portrait") return "aspect-[4/5] max-w-xl";
  return "";
}

export function RecipeBlockContent({
  blocks,
  compact = false,
}: {
  blocks: unknown;
  compact?: boolean;
}) {
  const safeBlocks = normalizeRecipeBlocks(blocks);
  return (
    <article
      className={
        compact
          ? "min-w-0 max-w-full space-y-5 overflow-hidden"
          : "mx-auto min-w-0 max-w-3xl space-y-7 overflow-hidden"
      }
    >
      {safeBlocks.map((block) => {
        if (block.type === "heading")
          return block.level === 2 ? (
            <h2
              key={block.id}
              className="scroll-mt-24 break-words pt-6 text-2xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl"
            >
              {block.text}
            </h2>
          ) : (
            <h3
              key={block.id}
              className="scroll-mt-24 break-words pt-4 text-xl font-extrabold leading-tight sm:text-2xl"
            >
              {block.text}
            </h3>
          );
        if (block.type === "paragraph")
          return (
            <p
              key={block.id}
              className="break-words whitespace-pre-wrap text-base leading-8 text-muted-foreground"
            >
              <RichText value={block.text} />
            </p>
          );
        if (block.type === "toggle")
          return (
            <details key={block.id} className="group rounded-sm border border-border bg-card">
              <summary className="cursor-pointer list-none px-5 py-4 font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {block.title}
                <span className="float-right text-accent transition-transform group-open:rotate-45">
                  ＋
                </span>
              </summary>
              <div className="border-t border-border px-5 py-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                <RichText value={block.text} />
              </div>
            </details>
          );
        if (block.type === "image")
          return block.url && isAllowedHttpUrl(block.url) ? (
            <figure
              key={block.id}
              className={`mx-auto overflow-hidden rounded-sm border border-border bg-card ${aspectClass(block)}`}
            >
              <img
                src={block.url}
                alt={block.alt}
                loading="lazy"
                className={`${block.aspect === "auto" ? "max-h-[48rem]" : "h-full"} w-full ${block.fit === "cover" ? "object-cover" : "object-contain"}`}
              />
              {block.caption || block.source ? (
                <figcaption className="border-t border-border px-4 py-3 text-xs leading-5 text-muted-foreground">
                  {block.caption ? <RichText value={block.caption} /> : null}
                  {block.source ? (
                    <span className="ml-2 font-mono text-[9px] uppercase tracking-wider">
                      Source: {block.source}
                    </span>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          ) : null;
        if (block.type === "youtube") {
          const embed = youtubeEmbedUrl(block.url);
          return embed ? (
            <figure key={block.id}>
              <div className="aspect-video w-full overflow-hidden rounded-sm border border-border bg-black">
                <iframe
                  src={embed}
                  title={block.caption || "Recipe video"}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              {block.caption ? (
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  <RichText value={block.caption} />
                </figcaption>
              ) : null}
            </figure>
          ) : null;
        }
        if (block.type === "list") {
          const List = block.style === "numbered" ? "ol" : "ul";
          return (
            <List
              key={block.id}
              className={`${block.style === "numbered" ? "list-decimal" : "list-disc"} space-y-2 pl-6 text-base leading-7 text-muted-foreground`}
            >
              {block.items.filter(Boolean).map((item, index) => (
                <li key={`${block.id}-${index}`}>
                  <RichText value={item} />
                </li>
              ))}
            </List>
          );
        }
        if (block.type === "callout")
          return (
            <aside key={block.id} className="border-l-4 border-accent bg-secondary/60 p-5">
              <p className="flex items-center gap-2 font-bold">
                <Info className="h-4 w-4" aria-hidden="true" />
                {block.title || "Note"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                <RichText value={block.text} />
              </p>
            </aside>
          );
        if (block.type === "quote")
          return (
            <blockquote
              key={block.id}
              className="border-y border-border py-7 text-xl font-semibold leading-relaxed"
            >
              <Quote className="mb-3 h-5 w-5 text-accent" aria-hidden="true" />
              <RichText value={block.text} />
              {block.attribution ? (
                <footer className="mt-3 text-xs font-normal text-muted-foreground">
                  — {block.attribution}
                </footer>
              ) : null}
            </blockquote>
          );
        if (block.type === "button")
          return isAllowedHttpUrl(block.url) ? (
            <a
              key={block.id}
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="group flex min-h-12 w-full items-center justify-between gap-4 border-b border-border py-3 text-left text-sm font-semibold text-foreground transition-colors hover:border-foreground"
            >
              <span>{block.label}</span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
            </a>
          ) : null;
        return <hr key={block.id} className="my-10 border-border" />;
      })}
    </article>
  );
}
