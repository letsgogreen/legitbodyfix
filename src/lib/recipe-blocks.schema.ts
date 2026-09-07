import { z } from "zod";
import type { RecipeContentBlock } from "./recipe-blocks.ts";

const id = z.string().min(1);
export const recipeContentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    id,
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string(),
  }),
  z.object({ id, type: z.literal("paragraph"), text: z.string() }),
  z.object({ id, type: z.literal("toggle"), title: z.string(), text: z.string() }),
  z.object({
    id,
    type: z.literal("image"),
    url: z.string(),
    alt: z.string(),
    caption: z.string(),
    source: z.string().default(""),
    fit: z.enum(["contain", "cover"]).default("contain"),
    aspect: z.enum(["auto", "video", "square", "portrait"]).default("auto"),
  }),
  z.object({ id, type: z.literal("youtube"), url: z.string(), caption: z.string() }),
  z.object({
    id,
    type: z.literal("list"),
    style: z.enum(["bullet", "numbered"]),
    items: z.array(z.string()),
  }),
  z.object({ id, type: z.literal("callout"), title: z.string(), text: z.string() }),
  z.object({ id, type: z.literal("quote"), text: z.string(), attribution: z.string() }),
  z.object({ id, type: z.literal("button"), label: z.string(), url: z.string() }),
  z.object({ id, type: z.literal("divider") }),
]);

export function parseRecipeBlocks(value: unknown): RecipeContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    const result = recipeContentBlockSchema.safeParse(candidate);
    return result.success ? [result.data] : [];
  });
}
