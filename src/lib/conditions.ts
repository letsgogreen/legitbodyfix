import { z } from "zod";
import { recipeContentBlockSchema } from "./recipe-blocks.schema.ts";
import { validateRecipeBlocks } from "./recipe-blocks.ts";

const text = z.string().max(30000).default("");
export const conditionSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  title: text, conditionCategory: text, bodyRegion: text, summary: text,
  joints: text, tags: text, screening: text, tightMuscles: text, weakMuscles: text,
  sourceName: text, sourceUrl: text, relatedVideoIds: text,
  content_blocks: z.array(recipeContentBlockSchema).max(500).default([]),
});
export type Condition = z.infer<typeof conditionSchema>;
export type ConditionPublication = { slug: string; data: unknown; published: boolean };
export function mergeConditions(legacy: unknown[], publications: ConditionPublication[]): Condition[] {
  const result = new Map<string, Condition>();
  for (const entry of legacy) {
    const item = entry as Record<string, unknown> | null;
    if (!item || item.published !== true || item.pathway !== "musculoskeletal-condition") continue;
    const parsed = conditionSchema.safeParse(item);
    if (parsed.success) result.set(parsed.data.id, parsed.data);
  }
  for (const row of publications) {
    // A withdrawn CMS entry must never reappear through the legacy fallback.
    result.delete(row.slug);
    const parsed = conditionSchema.safeParse(row.data);
    if (row.published && parsed.success && parsed.data.id === row.slug) result.set(row.slug, parsed.data);
  }
  return [...result.values()];
}
export function conditionIssues(value: Condition) {
  return [
    ...["title", "conditionCategory", "bodyRegion", "summary", "screening"].filter(key => !String(value[key as keyof Condition]).trim()).map(key => `${key} is required.`),
    ...(value.sourceUrl && !/^https:\/\/[^\s]+$/.test(value.sourceUrl) ? ["Source URL must use HTTPS."] : []),
    ...validateRecipeBlocks(value.content_blocks).map(issue => issue.message),
  ];
}
