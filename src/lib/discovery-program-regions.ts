// Catalog region tags can include secondary relationships. Discovery results
// must respect the actual scope of a program, not imply it targets every tag.
export function matchesDiscoveryRegion(
  program: { slug: string; regions: string[] | null },
  region: string,
): boolean {
  const regions = program.slug === "ankle-recovery"
    ? ["ankle-foot"]
    : (program.regions ?? []);
  const normalizedRegion = region === "spine-rib-cage" ? "spine-ribs" : region;
  return regions.some((value) =>
    (value === "spine-rib-cage" ? "spine-ribs" : value) === normalizedRegion,
  );
}
