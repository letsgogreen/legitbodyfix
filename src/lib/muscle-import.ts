import knowledgeBase from "@/data/knowledge-base.json";

export type MuscleRecord = {
  id: string;
  external_id: string | null;
  name: string;
  slug: string;
  anatomical_group: string | null;
  muscle_family: string | null;
  origin: string | null;
  insertion: string | null;
  functions: string[];
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  image_source_url: string | null;
  image_license: string | null;
  source_name: string | null;
  source_url: string | null;
  body_map: string | null;
  related_video_ids: string | null;
};

export type RowIssue = { level: "error" | "warning"; message: string };

export type PreviewRow = {
  rowNumber: number;
  outcome: "new" | "updated" | "unchanged" | "invalid";
  record: MuscleRecord;
  raw: Record<string, unknown>;
  issues: RowIssue[];
  diff: Record<string, { from: unknown; to: unknown }>;
};

export const COMPARED_FIELDS = [
  "name",
  "slug",
  "anatomical_group",
  "muscle_family",
  "origin",
  "insertion",
  "functions",
  "description",
  "image_url",
  "image_alt",
  "image_credit",
  "image_source_url",
  "image_license",
  "source_name",
  "source_url",
  "body_map",
  "related_video_ids",
] as const;

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitFunctions(value: unknown): string[] {
  const raw = text(value);
  if (!raw) return [];
  return raw
    .split(/[;\n]|(?:,\s)/)
    .map((part) => part.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

/** Accepts both the knowledge-base shape (title/group/actions) and DB-style column names. */
export function normalizeRow(raw: Record<string, unknown>): MuscleRecord {
  const name = text(raw["name"] ?? raw["title"]) ?? "";
  const id = text(raw["id"]) ?? slugify(name);

  return {
    id,
    external_id: text(raw["external_id"] ?? raw["externalId"]) ?? id,
    name,
    slug: text(raw["slug"]) ?? slugify(name || id),
    anatomical_group: text(raw["anatomical_group"] ?? raw["group"]),
    muscle_family: text(raw["muscle_family"] ?? raw["family"]),
    origin: text(raw["origin"]),
    insertion: text(raw["insertion"]),
    functions: splitFunctions(raw["functions"] ?? raw["actions"]),
    description: text(raw["description"] ?? raw["summary"]),
    image_url: text(raw["image_url"] ?? raw["imageUrl"]),
    image_alt: text(raw["image_alt"] ?? raw["imageAlt"] ?? raw["imageDescription"]),
    image_credit: text(raw["image_credit"] ?? raw["imageCredit"]),
    image_source_url: text(raw["image_source_url"] ?? raw["imageCreditUrl"]),
    image_license: text(raw["image_license"] ?? raw["imageLicense"]),
    source_name: text(raw["source_name"] ?? raw["sourceName"]),
    source_url: text(raw["source_url"] ?? raw["sourceUrl"]),
    body_map: text(raw["body_map"] ?? raw["bodyMap"]),
    related_video_ids: text(raw["related_video_ids"] ?? raw["relatedVideoIds"]),
  };
}

export function validate(record: MuscleRecord): RowIssue[] {
  const issues: RowIssue[] = [];
  if (!record.id) issues.push({ level: "error", message: "Missing id" });
  if (!record.name) issues.push({ level: "error", message: "Missing name" });
  if (!record.slug) issues.push({ level: "error", message: "Missing slug" });
  if (record.image_url && !/^https?:\/\//.test(record.image_url))
    issues.push({ level: "error", message: "Image URL must be absolute (https)" });
  if (!record.origin) issues.push({ level: "warning", message: "Missing origin" });
  if (!record.insertion) issues.push({ level: "warning", message: "Missing insertion" });
  if (!record.image_url) issues.push({ level: "warning", message: "Missing image" });
  else if (!record.image_alt) issues.push({ level: "warning", message: "Missing image alt text" });
  if (record.image_url && !record.image_credit)
    issues.push({ level: "warning", message: "Missing image credit" });
  return issues;
}

function sameValue(a: unknown, b: unknown) {
  if (Array.isArray(a) || Array.isArray(b)) {
    return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
  }
  return (a ?? null) === (b ?? null);
}

export function buildPreview(
  rows: Record<string, unknown>[],
  existing: Map<string, Record<string, unknown>>,
): PreviewRow[] {
  const seen = new Set<string>();

  return rows.map((raw, index) => {
    const record = normalizeRow(raw);
    const issues = validate(record);

    if (record.id && seen.has(record.id))
      issues.push({ level: "error", message: "Duplicate id inside this file" });
    if (record.id) seen.add(record.id);

    const current = existing.get(record.id);
    const diff: PreviewRow["diff"] = {};
    if (current) {
      for (const field of COMPARED_FIELDS) {
        const to = record[field];
        const from = current[field];
        if (!sameValue(from, to)) diff[field] = { from: from ?? null, to };
      }
    }

    const invalid = issues.some((issue) => issue.level === "error");
    const outcome: PreviewRow["outcome"] = invalid
      ? "invalid"
      : !current
        ? "new"
        : Object.keys(diff).length
          ? "updated"
          : "unchanged";

    return { rowNumber: index + 1, outcome, record, raw, issues, diff };
  });
}

/** Minimal RFC4180 CSV parser. */
export function parseCsv(input: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows.filter((entry) => entry.some((cell) => cell.trim().length));
  if (!header) return [];

  return body.map((entry) => {
    const record: Record<string, unknown> = {};
    header.forEach((key, index) => {
      record[key.trim()] = entry[index] ?? "";
    });
    return record;
  });
}

export function parseFile(filename: string, contents: string): Record<string, unknown>[] {
  if (filename.toLowerCase().endsWith(".csv")) return parseCsv(contents);
  const parsed: unknown = JSON.parse(contents);
  if (Array.isArray(parsed)) return parsed as Record<string, unknown>[];
  const muscles = (parsed as { muscles?: unknown }).muscles;
  if (Array.isArray(muscles)) return muscles as Record<string, unknown>[];
  throw new Error("JSON must be an array or an object with a `muscles` array.");
}

export function bundledKnowledgeBaseRows(): Record<string, unknown>[] {
  return (knowledgeBase as { muscles: Record<string, unknown>[] }).muscles;
}
