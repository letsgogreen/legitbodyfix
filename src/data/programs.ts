export type ProgramStatus = "coming-soon";

export type Program = {
  id: string;
  name: string;
  description: string;
  displayPrice: string;
  status: ProgramStatus;
};

export const programs: Program[] = [
  {
    id: "neck-shoulder-reset",
    name: "Neck & Shoulder Reset",
    description: "For neck, shoulder, and upper-back movement that feels restricted or uncertain.",
    displayPrice: "$59 launch",
    status: "coming-soon",
  },
  {
    id: "ankle-recovery",
    name: "Ankle Recovery Program",
    description: "For rebuilding ankle motion, balance, control, and confidence under load.",
    displayPrice: "$69 launch",
    status: "coming-soon",
  },
  {
    id: "shoulder-movement",
    name: "Shoulder Movement Program",
    description: "For developing shoulder positioning, scapular control, and overhead capacity.",
    displayPrice: "$69 launch",
    status: "coming-soon",
  },
  {
    id: "bunion-hallux-valgus-guide",
    name: "Bunion / Hallux Valgus Guide",
    description: "For practical guidance on toe mobility, foot control, and footwear decisions.",
    displayPrice: "$19",
    status: "coming-soon",
  },
];
