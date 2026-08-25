import { cleanSymptomGoals, normalizeRegions } from "@/lib/notion/regions";

export type RecipeRecord = {
  notion_page_id: string;
  notion_url: string | null;
  title: string;
  slug: string;
  goal: string | null;
  summary: string | null;
  instructions: string | null;
  regions: string[];
  movement_functions: string[];
  symptoms_goals: string[];
  progression_level: string | null;
  dosage: string | null;
  session_minutes: number | null;
  assessment_clues: string | null;
  safety_notes: string | null;
  evidence: string | null;
  equipment: string[];
  internal_notes: string | null;
  notion_status: string | null;
};

export type MuscleLink = {
  role: "tight" | "weak";
  notionPageId: string;
  candidateName: string;
  muscleId: string | null;
  matchedBy: "slug" | "name" | "alias" | "fuzzy" | null;
  score: number | null;
};

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type RowIssue = { level: "error" | "warning"; message: string };

export type RecipePreviewRow = {
  rowNumber: number;
  outcome: "new" | "updated" | "unchanged" | "invalid";
  record: RecipeRecord;
  raw: Record<string, Json>;
  issues: RowIssue[];
  diff: Record<string, { from: Json; to: Json }>;
  muscleLinks: MuscleLink[];
  publishable: boolean;
};

export const COMPARED_FIELDS = [
  "title",
  "goal",
  "summary",
  "instructions",
  "regions",
  "movement_functions",
  "symptoms_goals",
  "progression_level",
  "dosage",
  "session_minutes",
  "assessment_clues",
  "safety_notes",
  "evidence",
  "equipment",
  "internal_notes",
  "notion_status",
] as const;

export const PROGRESSION_LEVELS: Record<string, string> = {
  "reset / tolerance": "reset_tolerance",
  mobility: "mobility",
  activation: "activation",
  control: "control",
  integration: "integration",
  "loaded / performance": "loaded_performance",
};

export function slugifyRecipe(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function same(a: unknown, b: unknown) {
  if (Array.isArray(a) || Array.isArray(b)) {
    const left = (Array.isArray(a) ? a : []).map(String).sort();
    const right = (Array.isArray(b) ? b : []).map(String).sort();
    return JSON.stringify(left) === JSON.stringify(right);
  }
  const norm = (value: unknown) =>
    value === null || value === undefined || value === "" ? null : value;
  return norm(a) === norm(b);
}

/** Notion property values → a `recipes` row, plus the issues a reviewer must resolve. */
const HANGUL = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7FF]/;

/** Standing rule: no Korean text in database content. Flag it at import so it blocks publishing. */
export function detectKoreanText(fields: Record<string, string | null | undefined>) {
  return Object.entries(fields)
    .filter(([, value]) => Boolean(value && HANGUL.test(value)))
    .map(([field]) => field);
}

export function recipeFromNotion(input: {
  pageId: string;
  url: string | null;
  title: string;
  status: string | null;
  bodyRegions: string[];
  movementFunctions: string[];
  symptomsGoals: string[];
  progressionLevel: string | null;
  dosage: string | null;
  sessionMinutes: number | null;
  assessmentClues: string | null;
  contraindications: string | null;
  evidence: string | null;
  legacyNotes: string | null;
  equipment: string[];
  instructions: string | null;
  hasCoverImage: boolean;
}): { record: RecipeRecord; issues: RowIssue[] } {
  const issues: RowIssue[] = [];
  const title = input.title.trim();
  const { regions, unmapped } = normalizeRegions(input.bodyRegions);
  const symptoms = cleanSymptomGoals(input.symptomsGoals);
  const level = input.progressionLevel
    ? (PROGRESSION_LEVELS[input.progressionLevel.trim().toLowerCase()] ?? null)
    : null;

  if (!title) issues.push({ level: "error", message: "Notion record has no name." });
  if (!regions.length)
    issues.push({ level: "error", message: "No canonical body region — cannot publish." });
  if (unmapped.length)
    issues.push({ level: "warning", message: `Unmapped region(s): ${unmapped.join(", ")}` });
  if (!input.instructions)
    issues.push({
      level: "error",
      message: "No instructions found in the Notion page body — cannot publish.",
    });
  if (!input.contraindications)
    issues.push({ level: "error", message: "No contraindications / red flags — cannot publish." });
  if (!symptoms.length)
    issues.push({ level: "warning", message: "No symptom/goal tags, so goal stays empty." });
  if (input.progressionLevel && !level)
    issues.push({
      level: "warning",
      message: `Unknown progression level "${input.progressionLevel}".`,
    });
  if (input.hasCoverImage)
    issues.push({
      level: "warning",
      message: "Notion cover image is re-hosted into storage on commit (Notion URLs expire in ~1h).",
    });

  const korean = detectKoreanText({
    title: input.title,
    instructions: input.instructions,
    assessment_clues: input.assessmentClues,
    safety_notes: input.contraindications,
    evidence: input.evidence,
    dosage: input.dosage,
    internal_notes: input.legacyNotes,
  });
  if (korean.length)
    issues.push({
      level: "warning",
      message: `Korean text suspected in: ${korean.join(", ")} — must be translated before publishing.`,
    });

  const record: RecipeRecord = {
    notion_page_id: input.pageId,
    notion_url: input.url,
    title: title || "(untitled)",
    slug: slugifyRecipe(title) || `recipe-${input.pageId.slice(0, 8)}`,
    goal: symptoms[0] ?? null,
    summary: input.assessmentClues,
    instructions: input.instructions,
    regions,
    movement_functions: input.movementFunctions,
    symptoms_goals: symptoms,
    progression_level: level,
    dosage: input.dosage,
    session_minutes: input.sessionMinutes,
    assessment_clues: input.assessmentClues,
    safety_notes: input.contraindications,
    evidence: input.evidence,
    equipment: input.equipment,
    internal_notes: input.legacyNotes,
    notion_status: input.status,
  };

  return { record, issues };
}

export function buildRecipePreview(
  parsed: {
    record: RecipeRecord;
    issues: RowIssue[];
    raw: Record<string, Json>;
    muscleLinks: MuscleLink[];
  }[],
  existing: Map<string, Record<string, unknown>>,
): RecipePreviewRow[] {
  const seenSlugs = new Map<string, number>();

  return parsed.map((entry, index) => {
    const rowNumber = index + 1;
    const issues = [...entry.issues];
    const current = existing.get(entry.record.notion_page_id);

    const firstSlugRow = seenSlugs.get(entry.record.slug);
    if (firstSlugRow) {
      issues.push({
        level: "error",
        message: `Duplicate slug "${entry.record.slug}" (also row ${firstSlugRow}).`,
      });
    } else {
      seenSlugs.set(entry.record.slug, rowNumber);
    }

    for (const link of entry.muscleLinks) {
      if (!link.muscleId) {
        issues.push({
          level: "warning",
          message: `Unmatched ${link.role} muscle "${link.candidateName}" — link skipped.`,
        });
      } else if (link.matchedBy === "fuzzy") {
        issues.push({
          level: "warning",
          message: `Fuzzy ${link.role} muscle match "${link.candidateName}" → ${link.muscleId}; confirm before publishing.`,
        });
      }
    }

    const diff: Record<string, { from: Json; to: Json }> = {};
    if (current) {
      for (const field of COMPARED_FIELDS) {
        const from = current[field];
        const to = entry.record[field];
        if (!same(from, to)) diff[field] = { from: (from ?? null) as Json, to: to as Json };
      }
    }

    const blocking = issues.some((issue) => issue.level === "error" && !issue.message.includes("cannot publish"));
    const outcome: RecipePreviewRow["outcome"] = blocking
      ? "invalid"
      : current
        ? Object.keys(diff).length
          ? "updated"
          : "unchanged"
        : "new";

    return {
      rowNumber,
      outcome,
      record: entry.record,
      raw: entry.raw,
      issues,
      diff,
      muscleLinks: entry.muscleLinks,
      publishable: !issues.some((issue) => issue.level === "error"),
    };
  });
}
