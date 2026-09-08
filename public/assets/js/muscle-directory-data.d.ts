export interface DirectoryMuscle {
  title?: string;
  group?: string;
  family?: string;
  bodyMap?: string;
  actions?: string;
  function?: string;
  functionalRoles?: string[];
}
export function muscleRegion(item: DirectoryMuscle): string;
export function muscleInRegion(item: DirectoryMuscle, region: string): boolean;
export function muscleFunctionalRoles(item: DirectoryMuscle): string[];
export function muscleSectionGroup(item: DirectoryMuscle): string;
export function neckDirectoryGroups(item: DirectoryMuscle): string[];
export function orderedMuscleGroups(items: DirectoryMuscle[]): string[];
export const muscleGroupOrder: string[];
export const movementTagOrder: string[];
export const collectiveNeckGroupImages: Record<string, { imageUrl: string; imageAlt: string; label: string }>;
