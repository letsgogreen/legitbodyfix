export type Program = {
  id: string;
  area: string;
  title: string;
  shortTitle: string;
  summary: string;
  audience: string;
  image: string;
  imageAlt: string;
  duration?: number;
  equipment: string;
  price?: number;
  available: boolean;
  benefits: string[];
  stages: Array<{ title: string; copy: string }>;
  caution: string;
};

export const programs: Program[] = [
  {
    id: "neck-alignment",
    area: "Neck & upper body",
    title: "Neck Movement Reset",
    shortTitle: "Neck Reset",
    summary: "Move beyond temporary stretching. Practice comfortable neck movement, reduce unnecessary compensation, and build control you can carry into daily life.",
    audience: "For desk-related stiffness, recurring postural tension, limited rotation, or a neck that never feels settled.",
    image: "https://pub-5fe73d4ab1934bd99b41f77568617c00.r2.dev/thumbnails/2026-07/1785162514945-a92a560beb9397100d6dfc71-neck.png",
    imageAlt: "Neck movement session thumbnail",
    duration: 12,
    equipment: "Bodyweight",
    price: 45,
    available: true,
    benefits: ["Restore comfortable, controlled neck movement", "Reduce unnecessary shoulder and neck compensation", "Build a repeatable practice for work and daily movement"],
    stages: [
      { title: "Observe", copy: "Notice comfortable range and how the shoulders and upper back contribute." },
      { title: "Restore", copy: "Use controlled movement to explore options without forcing posture." },
      { title: "Control", copy: "Practice neck and upper-body coordination through a repeatable sequence." },
    ],
    caution: "Stop and seek appropriate assessment for recent trauma, severe or worsening pain, dizziness, numbness, marked weakness, or balance changes.",
  },
  {
    id: "ankle-sprain-rehabilitation",
    area: "Ankle & lower leg",
    title: "Ankle Rebuild",
    shortTitle: "Ankle Rebuild",
    summary: "A step-by-step session for rebuilding movement after the acute stage of an ankle sprain—from mobility and balance toward stability and strength.",
    audience: "For people progressing beyond the acute stage of an ankle sprain who have been cleared for rehabilitation exercise.",
    image: "https://pub-5fe73d4ab1934bd99b41f77568617c00.r2.dev/thumbnails/2026-07/1785530416111-28bf1c484c1f7bb75f197f9a-ankle-sprain.jpg",
    imageAlt: "Ankle rehabilitation movement session thumbnail",
    duration: 14,
    equipment: "Resistance band",
    price: 14,
    available: true,
    benefits: ["Regain comfortable ankle mobility", "Rebuild balance and foundational strength", "Develop confidence before returning to demanding movement"],
    stages: [
      { title: "Restore motion", copy: "Reintroduce comfortable ankle movement without chasing range at any cost." },
      { title: "Rebuild control", copy: "Progress balance and lower-leg coordination with clear regressions." },
      { title: "Reload", copy: "Build foundational strength before returning to faster or heavier tasks." },
    ],
    caution: "This is intended after the acute stage has settled. Increased swelling, inability to bear weight, marked instability, or worsening pain requires clinical assessment.",
  },
  {
    id: "shoulder-position-control",
    area: "Shoulder",
    title: "Shoulder Position & Control",
    shortTitle: "Shoulder Control",
    summary: "Reconnect humeral-head control, scapular movement, and upper-body strength to pressing, pulling, and reaching.",
    audience: "For people exploring anterior shoulder glide patterns, pressing discomfort, or reduced overhead control.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Subscapularis_muscle_frontal2.png",
    imageAlt: "Anterior shoulder anatomy with the subscapularis highlighted",
    equipment: "Band or light resistance",
    available: false,
    benefits: ["Understand shoulder position during arm movement", "Coordinate the humeral head and scapula", "Progress control back toward loaded upper-body tasks"],
    stages: [
      { title: "Check", copy: "Compare comfortable reach and shoulder position without forcing an ideal shape." },
      { title: "Coordinate", copy: "Practice cuff, scapular, and trunk contribution as one system." },
      { title: "Apply", copy: "Reconnect the new option to pressing, pulling, and overhead movement." },
    ],
    caution: "Traumatic injury, dislocation, marked weakness, numbness, or severe night pain should be assessed before self-guided exercise.",
  },
  {
    id: "bunion-movement-plan",
    area: "Foot & gait",
    title: "Bunion Movement Plan",
    shortTitle: "Bunion Plan",
    summary: "Develop usable big-toe motion, foot control, balance, and the movement capacity surrounding hallux valgus.",
    audience: "For people who want to improve big-toe function, foot strength, pressure control, and walking mechanics.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Abductor_hallucis.png",
    imageAlt: "Plantar foot anatomy highlighting the abductor hallucis muscle",
    equipment: "Bodyweight and optional band",
    available: false,
    benefits: ["Explore comfortable big-toe movement", "Build foot pressure and intrinsic-muscle control", "Connect foot function to balance and gait"],
    stages: [
      { title: "Restore options", copy: "Explore toe and forefoot movement within a comfortable range." },
      { title: "Build the base", copy: "Practice foot pressure, toe control, and balance progressively." },
      { title: "Integrate", copy: "Carry the new capacity into standing, walking, and lower-body training." },
    ],
    caution: "Exercise cannot promise to reverse structural hallux valgus. Significant pain, skin changes, rapidly changing deformity, or difficulty walking warrants professional assessment.",
  },
];

export function getProgram(id: string) {
  return programs.find((program) => program.id === id);
}
