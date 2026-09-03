import knowledgeBase from "@/data/knowledge-base.json";
import { directoryConfigSchema, type DirectoryConfig } from "@/lib/muscle-directory-config";

export type Muscle = {
  id: string;
  title: string;
  group: string;
  family?: string | undefined;
  origin: string;
  insertion: string;
  actions: string;
  imageUrl: string;
  imageAlt: string;
  imageCredit: string;
  imageCreditUrl: string;
  sourceName: string;
  sourceUrl: string;
  relatedVideoIds: string;
  published: boolean;
  reviewStatus?: string;
  imageStatus?: string;
  bodyMap?: string | undefined;
  functionalRoles?: string[] | undefined;
  directoryConfig?: DirectoryConfig | undefined;
  cardImagePosition?: string | undefined;
  cardImageScale?: number | undefined;
};

/**
 * Bundled fixture. This is the offline fallback / import source described in the spec —
 * it is NOT a live data source. Every route reads Supabase.
 */
export const fixtureMuscles = Object.freeze(
  [...(knowledgeBase.muscles as Muscle[])].sort((a, b) => a.title.localeCompare(b.title)),
);

export function findFixtureMuscle(id: string | undefined) {
  if (!id) return undefined;
  return fixtureMuscles.find((muscle) => muscle.id === id);
}

/** Columns selected from the `muscles` table for both public and admin reads. */
export const MUSCLE_COLUMNS =
  "id,name,anatomical_group,muscle_family,origin,insertion,functions,description,image_url,image_alt,image_credit,image_source_url,source_name,source_url,body_map,related_video_ids,published,review_status,image_status,crop_x,crop_y,crop_zoom";

export type MuscleRow = {
  id: string;
  name: string;
  anatomical_group: string | null;
  muscle_family: string | null;
  origin: string | null;
  insertion: string | null;
  functions: string[] | null;
  directory_config?: unknown;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  image_source_url: string | null;
  source_name: string | null;
  source_url: string | null;
  body_map: string | null;
  related_video_ids: string | null;
  published: boolean;
  review_status?: string | null;
  image_status?: string | null;
  crop_x?: number | null;
  crop_y?: number | null;
  crop_zoom?: number | null;
};

export function muscleFromRow(row: MuscleRow): Muscle {
  const actions = row.description?.trim() || (row.functions ?? []).join(". ");
  const directoryConfig = directoryConfigSchema.safeParse(row.directory_config);

  return {
    id: row.id,
    title: row.name,
    group: row.anatomical_group ?? "Unassigned",
    family: row.muscle_family ?? undefined,
    origin: row.origin ?? "",
    insertion: row.insertion ?? "",
    actions,
    imageUrl: row.image_url ?? "",
    imageAlt: row.image_alt ?? row.name,
    imageCredit: row.image_credit ?? "",
    imageCreditUrl: row.image_source_url ?? "",
    sourceName: row.source_name ?? "",
    sourceUrl: row.source_url ?? "",
    relatedVideoIds: row.related_video_ids ?? "",
    published: row.published,
    reviewStatus: row.review_status ?? "draft",
    imageStatus: row.image_status ?? (row.image_url ? "pending" : "missing"),
    bodyMap: row.body_map ?? undefined,
    functionalRoles: row.functions ?? undefined,
    directoryConfig: directoryConfig.success ? directoryConfig.data : undefined,
    cardImagePosition:
      row.crop_x != null || row.crop_y != null
        ? `${row.crop_x ?? 50}% ${row.crop_y ?? 50}%`
        : undefined,
    cardImageScale: row.crop_zoom ?? undefined,
  };
}

export type MuscleReadiness = {
  key: "live" | "ready" | "image" | "anatomy";
  label: string;
  issues: string[];
};

export function getMuscleReadiness(muscle: Muscle): MuscleReadiness {
  if (muscle.published) return { key: "live", label: "Live", issues: [] };

  const anatomyIssues = [
    !muscle.title.trim() && "name",
    (!muscle.group.trim() || muscle.group === "Unassigned") && "anatomical group",
    !muscle.origin.trim() && "origin",
    !muscle.insertion.trim() && "insertion",
    !muscle.actions.trim() && "function",
    !muscle.sourceName.trim() && "anatomy source",
    !muscle.sourceUrl.trim() && "source URL",
  ].filter((value): value is string => Boolean(value));

  const imageIssues = [
    !muscle.imageUrl.trim() && "image",
    !muscle.imageAlt.trim() && "alt text",
    !muscle.imageCredit.trim() && "image credit",
    (muscle.imageStatus ?? (muscle.imageUrl ? "pending" : "missing")) !== "approved" &&
      "image approval",
  ].filter((value): value is string => Boolean(value));

  if (imageIssues.length > 0) {
    return { key: "image", label: "Image review", issues: imageIssues };
  }
  if (anatomyIssues.length > 0) {
    return { key: "anatomy", label: "Anatomy review", issues: anatomyIssues };
  }
  return { key: "ready", label: "Ready to publish", issues: [] };
}

export function groupsOf(list: readonly Muscle[]) {
  return [...new Set(list.map((muscle) => muscle.group))].sort((a, b) => a.localeCompare(b));
}

export function filterMuscleList(list: readonly Muscle[], query: string, group: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return list.filter((muscle) => {
    const matchesGroup = group === "all" || muscle.group === group;
    const searchableText = [
      muscle.title,
      muscle.group,
      muscle.family,
      muscle.actions,
      muscle.origin,
      muscle.insertion,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return matchesGroup && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
}

/**
 * Dev-only guard: makes a Supabase/fixture divergence visible instead of silent.
 * Never runs in production builds.
 */
export function warnOnFixtureMismatch(
  context: string,
  liveIds: readonly string[],
  scope: "all" | "published" = "all",
) {
  if (!import.meta.env.DEV) return;

  const fixtureIds = new Set(
    fixtureMuscles
      .filter((muscle) => scope === "all" || muscle.published)
      .map((muscle) => muscle.id),
  );
  const live = new Set(liveIds);
  const missingInDb = [...fixtureIds].filter((id) => !live.has(id));
  const missingInFixture = [...live].filter((id) => !fixtureIds.has(id));

  if (missingInDb.length || missingInFixture.length) {
    console.warn(`[muscles] ${context}: Supabase and the bundled fixture disagree.`, {
      onlyInFixture: missingInDb.slice(0, 10),
      onlyInDatabase: missingInFixture.slice(0, 10),
    });
  }
}
