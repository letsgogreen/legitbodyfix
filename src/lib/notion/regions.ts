export const CANONICAL_REGIONS = [
  { slug: "head-neck", name: "Head & neck" },
  { slug: "shoulder-arm", name: "Shoulder & arm" },
  { slug: "spine-ribs", name: "Spine & rib cage" },
  { slug: "hip-pelvis", name: "Hip & pelvis" },
  { slug: "knee", name: "Knee" },
  { slug: "ankle-foot", name: "Ankle & foot" },
] as const;

export type RegionSlug = (typeof CANONICAL_REGIONS)[number]["slug"];

/** Notion "Body Region" multi_select values → canonical region slugs. */
const NOTION_REGION_MAP: Record<string, RegionSlug | null> = {
  "neck / head": "head-neck",
  "shoulder / scapula": "shoulder-arm",
  "thoracic spine / ribs": "spine-ribs",
  "lumbar spine": "spine-ribs",
  "hip / pelvis": "hip-pelvis",
  knee: "knee",
  "foot / ankle": "ankle-foot",
  "whole body": null,
};

export function regionNameFor(slug: string): string {
  return CANONICAL_REGIONS.find((r) => r.slug === slug)?.name ?? slug;
}

/** Maps Notion region labels to canonical slugs. Unknown/whole-body values are reported separately. */
export function normalizeRegions(notionValues: string[]): {
  regions: RegionSlug[];
  unmapped: string[];
} {
  const regions = new Set<RegionSlug>();
  const unmapped: string[] = [];

  for (const value of notionValues) {
    const key = value.trim().toLowerCase();
    if (!(key in NOTION_REGION_MAP)) {
      unmapped.push(value);
      continue;
    }
    const mapped = NOTION_REGION_MAP[key];
    if (mapped) regions.add(mapped);
    else unmapped.push(value);
  }

  return { regions: [...regions], unmapped };
}

/** Symptom/goal tags left over from the database's earlier life as a food library. */
const STALE_TAGS = new Set(["high protein", "low fat", "low carb"]);

export function cleanSymptomGoals(values: string[]): string[] {
  return values.filter((value) => !STALE_TAGS.has(value.trim().toLowerCase()));
}
