import type { RecipeContentBlock } from "./recipe-blocks.ts";
import { muscleSectionRole, type MuscleRole } from "./recipe-muscle-dictionary.ts";

export function recipeSectionMuscles(blocks: RecipeContentBlock[]) {
  let role: MuscleRole | undefined;
  const managedRoles = new Set<MuscleRole>();
  const links = new Map<string, {muscle_id: string; role: MuscleRole}>();
  for (const block of blocks) {
    if (block.type === "heading") {
      role = muscleSectionRole(block.text);
      if (role) managedRoles.add(role);
    }
    if (block.type !== "toggle") continue;
    const assigned = block.muscleRole ?? role;
    if (!assigned) continue;
    for (const muscle_id of block.muscleIds ?? []) links.set(`${assigned}:${muscle_id}`, {muscle_id, role: assigned});
  }
  return {links: [...links.values()], managedRoles};
}
