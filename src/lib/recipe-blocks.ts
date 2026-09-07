export type RecipeContentBlock =
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "toggle"; title: string; text: string }
  | {
      id: string;
      type: "image";
      url: string;
      alt: string;
      caption: string;
      source: string;
      fit: "contain" | "cover";
      aspect: "auto" | "video" | "square" | "portrait";
    }
  | { id: string; type: "youtube"; url: string; caption: string }
  | { id: string; type: "list"; style: "bullet" | "numbered"; items: string[] }
  | { id: string; type: "callout"; title: string; text: string }
  | { id: string; type: "quote"; text: string; attribution: string }
  | { id: string; type: "button"; label: string; url: string }
  | { id: string; type: "divider" };
export type RecipeBlockIssue = { blockId?: string; message: string };

export function blockId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function stableLegacyId(index: number, type: string, value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `legacy-${index}-${type}-${(hash >>> 0).toString(36)}`;
}

function cleanLegacyText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/<\/?(?:p|div|section|article|li|ul|ol|span|strong|em|b|i)[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, (tag) => tag.replace(/[<>]/g, ""))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r\n?/g, "\n");
}

function normalizeNotionLegacyLine(value: string) {
  const line = value.trim();
  if (!line) return "";
  if (/^\[Notion image\s*[—-].*]$/i.test(line)) return "";
  if (/^(?:unknown|synced_block_reference|mention-page)\b.*(?:url|alt)=/i.test(line)) return "";
  if (/^url=["']https:\/\/app\.notion\.com\//i.test(line)) return "";
  if (/^(?:\/?details\s*)+$/i.test(line) || /^\/?synced_block_reference$/i.test(line)) return "";
  const summary = line.match(/^summary\s*(.*?)\s*\/?summary$/i);
  if (summary) {
    const title = summary[1]?.trim() ?? "";
    if (!title || /^(?:mention-page|unknown)\b.*url=/i.test(title)) return "";
    return `### ${title}`;
  }
  return line;
}

export function blocksFromLegacyInstructions(instructions: string | null): RecipeContentBlock[] {
  if (!instructions?.trim()) return [];
  const lines = cleanLegacyText(instructions).split("\n").map(normalizeNotionLegacyLine);
  const blocks: RecipeContentBlock[] = [];
  let paragraph: string[] = [];
  let list: { style: "bullet" | "numbered"; items: string[] } | null = null;
  let toggle: { title: string; text: string[] } | null = null;
  const add = (block: Omit<RecipeContentBlock, "id">) => {
    blocks.push({
      ...block,
      id: stableLegacyId(blocks.length, block.type, JSON.stringify(block)),
    } as RecipeContentBlock);
  };
  const flushParagraph = () => {
    const text = paragraph.join("\n").trim();
    if (text) add({ type: "paragraph", text });
    paragraph = [];
  };
  const flushList = () => {
    if (list?.items.length) add({ type: "list", style: list.style, items: list.items });
    list = null;
  };
  const flushToggle = () => {
    if (toggle) add({ type: "toggle", title: toggle.title, text: toggle.text.join("\n\n").trim() });
    toggle = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      flushToggle();
      const text = (heading[2] ?? "")
        .replace(/\s*\{[^}]*toggle=["']?true["']?[^}]*\}\s*$/i, "")
        .trim();
      if (/\{[^}]*toggle=["']?true/i.test(line)) toggle = { title: text, text: [] };
      else add({ type: "heading", level: heading[1]!.length === 1 ? 2 : 3, text });
      continue;
    }
    if (!line) {
      if (toggle) toggle.text.push("");
      else {
        flushParagraph();
        flushList();
      }
      continue;
    }
    if (/^-{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      flushToggle();
      add({ type: "divider" });
      continue;
    }
    const listItem = line.match(/^([-*+] |\d+[.)]\s+)(.+)$/);
    if (listItem && !toggle) {
      flushParagraph();
      const style = /^\d/.test(listItem[1]!) ? "numbered" : "bullet";
      if (list && list.style !== style) flushList();
      list ??= { style, items: [] };
      list.items.push(listItem[2]!.trim());
      continue;
    }
    if (toggle) toggle.text.push(line);
    else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  flushToggle();
  return blocks;
}

export function normalizeRecipeBlocks(value: unknown): RecipeContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const block = candidate as Record<string, unknown>;
    if (typeof block["id"] !== "string" || typeof block["type"] !== "string") return [];
    const string = (key: string) => typeof block[key] === "string";
    if (
      block["type"] === "heading" &&
      (block["level"] === 2 || block["level"] === 3) &&
      string("text")
    )
      return [block as unknown as RecipeContentBlock];
    if (block["type"] === "paragraph" && string("text"))
      return [block as unknown as RecipeContentBlock];
    if (block["type"] === "toggle" && string("title") && string("text"))
      return [block as unknown as RecipeContentBlock];
    if (block["type"] === "image" && string("url") && string("alt") && string("caption"))
      return [
        {
          ...block,
          source: string("source") ? block["source"] : "",
          fit: block["fit"] === "cover" ? "cover" : "contain",
          aspect: ["video", "square", "portrait"].includes(String(block["aspect"]))
            ? block["aspect"]
            : "auto",
        } as RecipeContentBlock,
      ];
    if (block["type"] === "youtube" && string("url") && string("caption"))
      return [block as unknown as RecipeContentBlock];
    if (
      block["type"] === "list" &&
      (block["style"] === "bullet" || block["style"] === "numbered") &&
      Array.isArray(block["items"]) &&
      block["items"].every((item) => typeof item === "string")
    )
      return [block as unknown as RecipeContentBlock];
    if (block["type"] === "callout" && string("title") && string("text"))
      return [block as unknown as RecipeContentBlock];
    if (block["type"] === "quote" && string("text") && string("attribution"))
      return [block as unknown as RecipeContentBlock];
    if (block["type"] === "button" && string("label") && string("url"))
      return [block as unknown as RecipeContentBlock];
    if (block["type"] === "divider") return [{ id: block["id"], type: "divider" }];
    return [];
  });
}

export function blocksToPlainText(blocks: RecipeContentBlock[]) {
  return blocks
    .flatMap((block) => {
      if (block.type === "heading" || block.type === "paragraph") return [block.text];
      if (block.type === "toggle" || block.type === "callout") return [block.title, block.text];
      if (block.type === "list") return block.items;
      if (block.type === "quote") return [block.text, block.attribution];
      if (block.type === "button") return [block.label, block.url];
      if (block.type === "image" || block.type === "youtube") return [block.caption];
      return [];
    })
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function isAllowedHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function youtubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host))
      return null;
    const videoId =
      host === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : (url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1]);
    return videoId && /^[\w-]{6,}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

export function validateRecipeBlocks(blocks: RecipeContentBlock[]): RecipeBlockIssue[] {
  const issues: RecipeBlockIssue[] = [];
  for (const block of blocks) {
    const add = (message: string) => issues.push({ blockId: block.id, message });
    if (block.type === "heading" && !block.text.trim()) add("Heading text is required.");
    if (block.type === "toggle" && !block.title.trim()) add("Toggle title is required.");
    if (block.type === "image") {
      if (!block.url.trim()) add("Image URL is required.");
      else if (!isAllowedHttpUrl(block.url)) add("Image must use a valid http(s) URL.");
      if (!block.alt.trim()) add("Image alt text is required.");
    }
    if (block.type === "youtube" && !youtubeEmbedUrl(block.url)) add("Enter a valid YouTube URL.");
    if (block.type === "list" && !block.items.some((item) => item.trim()))
      add("Add at least one list item.");
    if (block.type === "callout" && !block.text.trim()) add("Callout text is required.");
    if (block.type === "quote" && !block.text.trim()) add("Quote text is required.");
    if (block.type === "button" && (!block.label.trim() || !isAllowedHttpUrl(block.url)))
      add("Button label and valid URL are required.");
  }
  return issues;
}
