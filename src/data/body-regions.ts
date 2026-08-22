export type BodyRegion = {
  slug: string;
  title: string;
  description: string;
};

export const bodyRegions: BodyRegion[] = [
  {
    slug: "head-neck",
    title: "Head & neck",
    description: "Explore neck movement, head position, and upper-back contribution.",
  },
  {
    slug: "shoulder-arm",
    title: "Shoulder & arm",
    description: "Start with reaching, pressing, pulling, or overhead movement.",
  },
  {
    slug: "spine-rib-cage",
    title: "Spine & rib cage",
    description: "Explore breathing, rotation, bending, and trunk control.",
  },
  {
    slug: "hip-pelvis",
    title: "Hip & pelvis",
    description: "Start with hip motion, pelvic control, squatting, or hinging.",
  },
  {
    slug: "knee",
    title: "Knee",
    description: "Explore knee tolerance, single-leg control, and return to loading.",
  },
  {
    slug: "ankle-foot",
    title: "Ankle & foot",
    description: "Start with ankle motion, balance, gait, or foot mechanics.",
  },
];

export function findBodyRegion(slug: string | undefined) {
  return bodyRegions.find((region) => region.slug === slug);
}
