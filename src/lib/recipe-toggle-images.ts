import type { RecipeContentBlock } from "./recipe-blocks.ts";

type ImageBlock = Extract<RecipeContentBlock, { type: "image" }>;

// Only exact, unambiguous labels in the same heading section are grouped.
// Keep the stored blocks intact so image credits and editing remain lossless.
export function recipeToggleImages(blocks: RecipeContentBlock[]) {
  const byToggle = new Map<string, ImageBlock[]>();
  const imageIds = new Set<string>();
  const label = (text: string) => text.trim().toLocaleLowerCase().replace(/\s+/g, " ");
  let section: RecipeContentBlock[] = [];
  const collect = () => {
    for (const image of section) {
      if (image.type !== "image" || !label(image.alt)) continue;
      const matches = section.filter((block) => block.type === "toggle" && label(block.title) === label(image.alt));
      if (matches.length !== 1) continue;
      const toggle = matches[0]!;
      byToggle.set(toggle.id, [...(byToggle.get(toggle.id) ?? []), image]);
      imageIds.add(image.id);
    }
    section = [];
  };
  for (const block of blocks) {
    if (block.type === "heading") collect();
    section.push(block);
  }
  collect();
  return { byToggle, imageIds };
}
