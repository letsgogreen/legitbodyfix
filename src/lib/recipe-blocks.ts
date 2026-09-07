export type RecipeContentBlock =
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "toggle"; title: string; text: string }
  | { id: string; type: "image"; url: string; alt: string; caption: string }
  | { id: string; type: "youtube"; url: string; caption: string }
  | { id: string; type: "divider" };

export function blockId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function blocksFromLegacyInstructions(instructions: string | null): RecipeContentBlock[] {
  if (!instructions?.trim()) return [];
  return [{ id: blockId(), type: "paragraph", text: instructions.trim() }];
}

export function blocksToPlainText(blocks: RecipeContentBlock[]) {
  return blocks
    .flatMap((block) => {
      if (block.type === "heading") return [block.text];
      if (block.type === "paragraph") return [block.text];
      if (block.type === "toggle") return [block.title, block.text];
      if (block.type === "image" || block.type === "youtube") return [block.caption];
      return [];
    })
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function youtubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const id = url.hostname.includes("youtu.be")
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.searchParams.get("v") ?? url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];
    return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}
