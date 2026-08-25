import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeMuscleName, similarity } from "@/lib/notion/normalize";
import {
  buildRecipePreview,
  recipeFromNotion,
  type MuscleLink,
  type Json,
  type RecipePreviewRow,
} from "@/lib/recipe-import";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/notion/v1";
export const RECIPE_DATABASE_ID = "1f6effb2-9211-8147-81a9-c4186864f59e";
const FUZZY_THRESHOLD = 0.86;

type NotionValue = Record<string, unknown>;
/** The admin client and the user-scoped client are both plain supabase-js clients here. */
type AnyClient = SupabaseClient<any, any, any>;

export function plain(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const text = value
    .map((part) => (part as { plain_text?: string }).plain_text ?? "")
    .join("")
    .trim();
  return text.length ? text : null;
}

export function names(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String((item as { name?: string }).name ?? "")).filter(Boolean);
}

export async function notion(path: string, init?: RequestInit) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const notionKey = process.env["NOTION_API_KEY"];
  if (!lovableKey || !notionKey) throw new Error("Notion connection is not configured.");

  const response = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": notionKey,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Notion gateway failed [${response.status}]: ${body}`);
    throw new Error(`Notion request failed [${response.status}]: ${body}`);
  }
  return response.json() as Promise<Record<string, unknown>>;
}

/** Page body text — instructions live in blocks, not in a Notion property. */
async function pageInstructions(pageId: string): Promise<string | null> {
  const payload = await notion(`/blocks/${pageId}/children?page_size=100`);
  const lines: string[] = [];

  for (const block of (payload["results"] ?? []) as NotionValue[]) {
    const type = String(block["type"] ?? "");
    const body = block[type] as NotionValue | undefined;
    const text = plain(body?.["rich_text"]);
    if (!text) continue;
    if (type === "heading_1" || type === "heading_2" || type === "heading_3") {
      lines.push(`\n${text}`);
    } else if (type === "bulleted_list_item" || type === "numbered_list_item") {
      lines.push(`- ${text}`);
    } else {
      lines.push(text);
    }
  }

  const joined = lines.join("\n").trim();
  return joined.length ? joined : null;
}

async function pageTitle(pageId: string): Promise<string> {
  const page = await notion(`/pages/${pageId}`);
  const properties = (page["properties"] ?? {}) as Record<string, NotionValue>;
  for (const property of Object.values(properties)) {
    if (property["type"] === "title") return plain(property["title"]) ?? "";
  }
  return "";
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index] as T);
      }
    }),
  );
  return results;
}

type MuscleIndexEntry = { id: string; name: string; slug: string; latin: string | null };

function matchMuscle(
  candidate: string,
  muscles: MuscleIndexEntry[],
  aliases: Map<string, string>,
): { muscleId: string | null; matchedBy: MuscleLink["matchedBy"]; score: number | null } {
  const normalized = normalizeMuscleName(candidate);
  if (!normalized) return { muscleId: null, matchedBy: null, score: null };

  const bySlug = muscles.find((muscle) => normalizeMuscleName(muscle.slug) === normalized);
  if (bySlug) return { muscleId: bySlug.id, matchedBy: "slug", score: 1 };

  const byName = muscles.find((muscle) => normalizeMuscleName(muscle.name) === normalized);
  if (byName) return { muscleId: byName.id, matchedBy: "name", score: 1 };

  const alias = aliases.get(normalized);
  if (alias) return { muscleId: alias, matchedBy: "alias", score: 1 };

  const byLatin = muscles.find(
    (muscle) => muscle.latin && normalizeMuscleName(muscle.latin) === normalized,
  );
  if (byLatin) return { muscleId: byLatin.id, matchedBy: "name", score: 1 };

  let best: { id: string; score: number } | null = null;
  for (const muscle of muscles) {
    const score = similarity(candidate, muscle.name);
    if (!best || score > best.score) best = { id: muscle.id, score };
  }
  if (best && best.score >= FUZZY_THRESHOLD) {
    return { muscleId: best.id, matchedBy: "fuzzy", score: Number(best.score.toFixed(3)) };
  }
  return { muscleId: null, matchedBy: null, score: best ? Number(best.score.toFixed(3)) : null };
}

/** Reads the Notion recipe library, maps it onto `recipes`, and diffs it against stored rows. */
export async function buildNotionRecipePreview(supabase: AnyClient): Promise<RecipePreviewRow[]> {
  // 1. All Notion recipe pages.
  const pages: NotionValue[] = [];
  let cursor: string | undefined;
  do {
    const payload = await notion(`/databases/${RECIPE_DATABASE_ID}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    pages.push(...((payload["results"] ?? []) as NotionValue[]));
    cursor = payload["has_more"] ? (payload["next_cursor"] as string) : undefined;
  } while (cursor);

  // 2. Muscle index (admin RLS lets us see unpublished rows too).
  const [{ data: muscleRows }, { data: aliasRows }, { data: recipeRows }] = await Promise.all([
    supabase.from("muscles").select("id,name,slug,latin_name"),
    supabase.from("muscle_aliases").select("muscle_id,alias"),
    supabase.from("recipes").select("*"),
  ]);

  const muscles: MuscleIndexEntry[] = (muscleRows ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    latin: row.latin_name,
  }));
  const aliases = new Map<string, string>(
    (aliasRows ?? []).map((row: any) => [normalizeMuscleName(row.alias), row.muscle_id]),
  );
  const existing = new Map<string, Record<string, unknown>>(
    (recipeRows ?? [])
      .filter((row: any) => row.notion_page_id)
      .map((row: any) => [row.notion_page_id as string, row as Record<string, unknown>]),
  );

  // 3. Resolve related muscle page titles once, then reuse.
  const relatedIds = new Set<string>();
  for (const page of pages) {
    const properties = (page["properties"] ?? {}) as Record<string, NotionValue>;
    for (const key of ["Tight muscles", "Weakened muscles"]) {
      for (const item of (properties[key]?.["relation"] ?? []) as { id: string }[]) {
        relatedIds.add(item.id);
      }
    }
  }
  const titleList = await mapWithConcurrency([...relatedIds], 6, async (id) => ({
    id,
    title: await pageTitle(id),
  }));
  const titles = new Map(titleList.map((entry) => [entry.id, entry.title]));

  // 4. Page bodies hold the instructions.
  const instructionList = await mapWithConcurrency(pages, 6, async (page) => ({
    id: page["id"] as string,
    instructions: await pageInstructions(page["id"] as string),
  }));
  const instructions = new Map(instructionList.map((entry) => [entry.id, entry.instructions]));

  // 5. Map + diff.
  const parsed = pages.map((page) => {
    const properties = (page["properties"] ?? {}) as Record<string, NotionValue>;
    const pageId = page["id"] as string;

    const muscleLinks: MuscleLink[] = (["tight", "weak"] as const).flatMap((role) => {
      const key = role === "tight" ? "Tight muscles" : "Weakened muscles";
      return ((properties[key]?.["relation"] ?? []) as { id: string }[]).map((item) => {
        const candidateName = titles.get(item.id) ?? "";
        const match = matchMuscle(candidateName, muscles, aliases);
        return {
          role,
          notionPageId: item.id,
          candidateName: candidateName || "(untitled Notion muscle)",
          muscleId: match.muscleId,
          matchedBy: match.matchedBy,
          score: match.score,
        };
      });
    });

    const { record, issues } = recipeFromNotion({
      pageId,
      url: (page["url"] as string) ?? null,
      title: plain(properties["Name"]?.["title"]) ?? "",
      status: (properties["Status"]?.["select"] as { name?: string } | null)?.name ?? null,
      bodyRegions: names(properties["Body Region"]?.["multi_select"]),
      movementFunctions: names(properties["Movement / Function"]?.["multi_select"]),
      symptomsGoals: names(properties["Symptoms / Goals"]?.["multi_select"]),
      progressionLevel:
        (properties["Progression Level"]?.["select"] as { name?: string } | null)?.name ?? null,
      dosage: plain(properties["Dosage"]?.["rich_text"]),
      sessionMinutes: (properties["Session Time (min)"]?.["number"] as number | null) ?? null,
      assessmentClues: plain(properties["Assessment Clues"]?.["rich_text"]),
      contraindications: plain(properties["Contraindications / Red Flags"]?.["rich_text"]),
      evidence: plain(properties["Evidence / Sources"]?.["rich_text"]),
      legacyNotes: plain(properties["Legacy Clinical Notes — Review"]?.["rich_text"]),
      equipment: [],
      instructions: instructions.get(pageId) ?? null,
      hasCoverImage: Boolean(page["cover"]),
    });

    return {
      record,
      issues,
      muscleLinks,
      raw: {
        notion_page_id: pageId,
        name: record.title,
        status: record.notion_status,
        body_region: names(properties["Body Region"]?.["multi_select"]),
        last_edited_time: (page["last_edited_time"] as string) ?? null,
      } as Record<string, Json>,
    };
  });

  return buildRecipePreview(parsed, existing);
}
