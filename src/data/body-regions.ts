export type BodyRegion = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  programs: RegionResource[];
  recipes: RegionResource[];
  muscleGroups: RegionResource[];
};

export type RegionResource = {
  title: string;
  description: string;
  href: string;
  meta?: string;
  available?: boolean;
};

export const bodyRegions: BodyRegion[] = [
  {
    slug: "head-neck",
    title: "Head & neck",
    description: "Explore neck movement, head position, and upper-back contribution.",
    intro:
      "Start with comfortable neck motion, head position, breathing, and the upper-back movement that supports them.",
    programs: [
      {
        title: "Neck Alignment",
        description: "A guided session for comfortable neck position and control.",
        href: "/video.html?id=neck-alignment",
        meta: "12 min · Foundational · $45",
        available: true,
      },
    ],
    recipes: [
      {
        title: "Neck desk reset",
        description: "A short sequence for neck movement after prolonged sitting.",
        href: "/knowledge.html?type=recipes&id=neck-desk-reset",
        meta: "6–10 min",
      },
      {
        title: "Thoracic rotation reset",
        description: "Explore upper-trunk rotation without forcing the neck.",
        href: "/knowledge.html?type=recipes&id=thoracic-rotation-reset",
        meta: "6–10 min",
      },
    ],
    muscleGroups: [
      {
        title: "Deep neck flexors",
        description: "Anterior cervical control and endurance.",
        href: "/knowledge.html?type=muscles&q=deep%20neck%20flexors",
      },
      {
        title: "Superficial neck",
        description: "Muscles that assist head and neck movement.",
        href: "/knowledge.html?type=muscles&q=superficial%20neck",
      },
      {
        title: "Trapezius",
        description: "Upper-back and scapular contributors to neck movement.",
        href: "/knowledge.html?type=muscles&q=trapezius",
      },
    ],
  },
  {
    slug: "shoulder-arm",
    title: "Shoulder & arm",
    description: "Start with reaching, pressing, pulling, or overhead movement.",
    intro:
      "Connect shoulder motion with scapular control, thoracic contribution, and the demands of reaching or loading.",
    programs: [
      {
        title: "Neck Alignment",
        description: "Includes neck and shoulder-position work that supports upper-body movement.",
        href: "/video.html?id=neck-alignment",
        meta: "12 min · Foundational · $45",
        available: true,
      },
    ],
    recipes: [
      {
        title: "Overhead reach preparation",
        description: "Prepare the scapula and rotator cuff for an unloaded overhead reach.",
        href: "/knowledge.html?type=recipes&id=overhead-reach-preparation",
        meta: "8–12 min",
      },
      {
        title: "Neck desk reset",
        description: "Reduce unnecessary neck effort before returning to upper-body movement.",
        href: "/knowledge.html?type=recipes&id=neck-desk-reset",
        meta: "6–10 min",
      },
    ],
    muscleGroups: [
      {
        title: "Rotator cuff",
        description: "Shoulder-centering and rotation muscles.",
        href: "/knowledge.html?type=muscles&q=rotator%20cuff",
      },
      {
        title: "Scapular stabilizers",
        description: "Muscles that position and control the shoulder blade.",
        href: "/knowledge.html?type=muscles&q=scapular",
      },
      {
        title: "Pectorals",
        description: "Anterior shoulder and chest contributors.",
        href: "/knowledge.html?type=muscles&q=pectoralis",
      },
    ],
  },
  {
    slug: "spine-rib-cage",
    title: "Spine & rib cage",
    description: "Explore breathing, rotation, bending, and trunk control.",
    intro:
      "Begin with breathing mechanics and comfortable trunk movement before adding speed, range, or load.",
    programs: [
      {
        title: "Breathing Fundamentals",
        description: "Guided breathing for rib-cage movement, alignment, and recovery.",
        href: "/video.html?id=breathing-fundamentals",
        meta: "8 min · Foundational",
        available: false,
      },
    ],
    recipes: [
      {
        title: "Ribcage breathing reset",
        description: "Coordinate lower-rib and abdominal movement with quieter breathing.",
        href: "/knowledge.html?type=recipes&id=ribcage-breathing-reset",
        meta: "6–10 min",
      },
      {
        title: "Thoracic rotation reset",
        description: "Explore comfortable upper-trunk rotation from a supported position.",
        href: "/knowledge.html?type=recipes&id=thoracic-rotation-reset",
        meta: "6–10 min",
      },
      {
        title: "Trunk control before lifting",
        description: "Coordinate breath, hip movement, and trunk control before lifting.",
        href: "/knowledge.html?type=recipes&id=trunk-control-before-lifting",
        meta: "8–12 min",
      },
    ],
    muscleGroups: [
      {
        title: "Diaphragm",
        description: "The primary muscle of breathing.",
        href: "/knowledge.html?type=muscles&q=diaphragm",
      },
      {
        title: "Intercostals",
        description: "Muscles between the ribs that support breathing mechanics.",
        href: "/knowledge.html?type=muscles&q=intercostals",
      },
      {
        title: "Abdominal wall",
        description: "Trunk pressure, rotation, and control contributors.",
        href: "/knowledge.html?type=muscles&q=abdominis",
      },
    ],
  },
  {
    slug: "hip-pelvis",
    title: "Hip & pelvis",
    description: "Start with hip motion, pelvic control, squatting, or hinging.",
    intro:
      "Compare hip motion and side-to-side control, then connect the result to squatting, hinging, balance, or walking.",
    programs: [
      {
        title: "Pelvic Balance",
        description: "Foundational awareness and control around the pelvis.",
        href: "/video.html?id=pelvic-balance",
        meta: "15 min · Foundational",
        available: false,
      },
      {
        title: "Walking Mechanics",
        description: "Connect posture, balance, and rhythm during walking.",
        href: "/video.html?id=walking-mechanics",
        meta: "18 min · Intermediate",
        available: false,
      },
    ],
    recipes: [
      {
        title: "Pelvic balance baseline",
        description: "Establish side-to-side awareness before harder lower-body work.",
        href: "/knowledge.html?type=recipes&id=pelvic-balance-baseline",
        meta: "8–12 min",
      },
      {
        title: "Hip control walking preparation",
        description: "Practice lateral-hip control before walking or lower-body training.",
        href: "/knowledge.html?type=recipes&id=hip-control-walking-prep",
        meta: "8–12 min",
      },
    ],
    muscleGroups: [
      {
        title: "Gluteals",
        description: "Hip extension, rotation, and frontal-plane control.",
        href: "/knowledge.html?type=muscles&q=gluteus",
      },
      {
        title: "Hip flexors",
        description: "Anterior hip muscles involved in flexion and pelvic mechanics.",
        href: "/knowledge.html?type=muscles&q=hip%20flexor",
      },
      {
        title: "Adductors",
        description: "Medial-thigh contributors to hip control.",
        href: "/knowledge.html?type=muscles&q=adductor",
      },
    ],
  },
  {
    slug: "knee",
    title: "Knee",
    description: "Explore knee tolerance, single-leg control, and return to loading.",
    intro:
      "Start with comfortable loading and knee control, then consider how the hip, ankle, and foot influence the task.",
    programs: [
      {
        title: "Walking Mechanics",
        description: "Integrate lower-limb control into a practical walking pattern.",
        href: "/video.html?id=walking-mechanics",
        meta: "18 min · Intermediate",
        available: false,
      },
    ],
    recipes: [
      {
        title: "Knee control before squatting",
        description: "Practice comfortable tracking and loading before deeper squats.",
        href: "/knowledge.html?type=recipes&id=knee-control-return-to-squat",
        meta: "8–12 min",
      },
      {
        title: "Stair control preparation",
        description: "Build controlled knee loading before repeated stair use.",
        href: "/knowledge.html?type=recipes&id=stair-control-preparation",
        meta: "8–12 min",
      },
      {
        title: "Knee extension baseline",
        description: "Practice quadriceps control before harder standing tasks.",
        href: "/knowledge.html?type=recipes&id=knee-extension-baseline",
        meta: "6–10 min",
      },
    ],
    muscleGroups: [
      {
        title: "Quadriceps",
        description: "Primary knee-extension muscles.",
        href: "/knowledge.html?type=muscles&q=quadriceps",
      },
      {
        title: "Hamstrings",
        description: "Posterior-thigh contributors to knee and hip control.",
        href: "/knowledge.html?type=muscles&q=hamstring",
      },
      {
        title: "Calf complex",
        description: "Ankle and knee contributors during gait and loading.",
        href: "/knowledge.html?type=muscles&q=gastrocnemius",
      },
    ],
  },
  {
    slug: "ankle-foot",
    title: "Ankle & foot",
    description: "Start with ankle motion, balance, gait, or foot mechanics.",
    intro:
      "Review ankle motion, foot pressure, balance, and walking tolerance before progressing impact or single-leg demand.",
    programs: [
      {
        title: "Ankle Sprain Rehabilitation",
        description: "A progressive session for mobility, balance, stability, and strength.",
        href: "/video.html?id=ankle-sprain-rehabilitation",
        meta: "14 min · Intermediate · $14",
        available: true,
      },
      {
        title: "Foot Mechanics",
        description: "Practice pressure, stability, and control from the ground up.",
        href: "/video.html?id=foot-mechanics",
        meta: "10 min · Foundational",
        available: false,
      },
    ],
    recipes: [
      {
        title: "Ankle rehabilitation progression",
        description: "Rebuild motion, balance, strength, and confidence after the acute stage.",
        href: "/knowledge.html?type=recipes&id=ankle-rehabilitation-progression",
        meta: "12–18 min",
      },
      {
        title: "Foot tripod walking reset",
        description: "Practice heel and forefoot pressure during standing and walking.",
        href: "/knowledge.html?type=recipes&id=foot-tripod-walking-reset",
        meta: "8–10 min",
      },
      {
        title: "Calf raise readiness",
        description: "Prepare the calf and ankle for controlled push-off.",
        href: "/knowledge.html?type=recipes&id=calf-raise-readiness",
        meta: "8–10 min",
      },
    ],
    muscleGroups: [
      {
        title: "Anterior lower leg",
        description: "Dorsiflexion and foot-clearance contributors.",
        href: "/knowledge.html?type=muscles&q=anterior%20lower%20leg",
      },
      {
        title: "Posterior lower leg",
        description: "Calf and deep plantar-flexor muscles.",
        href: "/knowledge.html?type=muscles&q=posterior%20lower%20leg",
      },
      {
        title: "Intrinsic foot",
        description: "Local muscles supporting pressure and toe control.",
        href: "/knowledge.html?type=muscles&q=intrinsic%20foot",
      },
    ],
  },
];

export function findBodyRegion(slug: string | undefined) {
  return bodyRegions.find((region) => region.slug === slug);
}
