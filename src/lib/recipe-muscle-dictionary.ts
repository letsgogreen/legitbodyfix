export const RECIPE_MUSCLE_COLUMNS = "id,name,anatomical_group,published,origin,insertion,functions,description,image_url,image_alt,image_credit,image_source_url,source_name,source_url";

export type RecipeMuscleEntry = {
  id: string;
  name: string;
  anatomical_group: string | null;
  published: boolean;
  origin: string | null;
  insertion: string | null;
  functions: string[] | null;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  image_source_url: string | null;
  source_name: string | null;
  source_url: string | null;
};

export type MuscleRole = "tight" | "weak";
export const MUSCLE_SIDES = ["Elevated side", "Same side", "Opposite side", "Both sides"];
export function muscleSectionRole(title: string): MuscleRole | undefined {
  const normalized = title.trim().toLowerCase();
  return normalized === "tight muscles" ? "tight" : normalized === "weakened muscles" ? "weak" : undefined;
}
export function muscleSide(block: {side?: string; title: string}) {
  if (block.side !== undefined) return block.side;
  return MUSCLE_SIDES.find((side) => block.title.toLowerCase().includes(side.toLowerCase())) ?? "";
}

export function muscleSearchText(entry: Pick<RecipeMuscleEntry, "name" | "anatomical_group">) {
  const name = entry.name.toLowerCase();
  const aliases = /tensor.*fasci/.test(name) ? " tfl" : /quadratus lumborum/.test(name) ? " ql" : "";
  return `${name} ${entry.anatomical_group ?? ""}${aliases}`.toLowerCase();
}
