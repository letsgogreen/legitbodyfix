// Mock data for the admin UI exploration. Nothing here is persisted or real.

export type ProgramStatus = "Live" | "Coming soon";

export interface Program {
  id: string;
  title: string;
  region: string;
  price: number;
  status: ProgramStatus;
  lessons: number;
  updated: string;
}

export const programs: Program[] = [
  {
    id: "neck-shoulder-reset",
    title: "Neck & Shoulder Reset",
    region: "Head & neck",
    price: 59,
    status: "Coming soon",
    lessons: 14,
    updated: "2026-08-18",
  },
  {
    id: "ankle-recovery",
    title: "Ankle Recovery Program",
    region: "Ankle & foot",
    price: 69,
    status: "Coming soon",
    lessons: 18,
    updated: "2026-08-14",
  },
  {
    id: "shoulder-movement",
    title: "Shoulder Movement Program",
    region: "Shoulder & arm",
    price: 69,
    status: "Coming soon",
    lessons: 16,
    updated: "2026-08-09",
  },
  {
    id: "bunion-guide",
    title: "Bunion / Hallux Valgus Guide",
    region: "Ankle & foot",
    price: 19,
    status: "Coming soon",
    lessons: 7,
    updated: "2026-07-30",
  },
];

export type LessonStatus = "Draft" | "Published";

export interface Lesson {
  id: string;
  programId: string;
  module: string;
  index: number;
  title: string;
  duration: string;
  status: LessonStatus;
}

export const lessons: Lesson[] = [
  { id: "l1", programId: "neck-shoulder-reset", module: "01 — Assess", index: 1, title: "How to run the neck check", duration: "6:12", status: "Published" },
  { id: "l2", programId: "neck-shoulder-reset", module: "01 — Assess", index: 2, title: "Rotation range: what to look for", duration: "4:48", status: "Published" },
  { id: "l3", programId: "neck-shoulder-reset", module: "02 — Restore", index: 3, title: "Suboccipital release", duration: "8:03", status: "Draft" },
  { id: "l4", programId: "neck-shoulder-reset", module: "02 — Restore", index: 4, title: "Deep neck flexor progression", duration: "9:26", status: "Draft" },
  { id: "l5", programId: "neck-shoulder-reset", module: "03 — Load", index: 5, title: "Scapular control ladder", duration: "11:40", status: "Draft" },

  { id: "l6", programId: "ankle-recovery", module: "01 — Assess", index: 1, title: "Ankle dorsiflexion wall test", duration: "5:20", status: "Published" },
  { id: "l7", programId: "ankle-recovery", module: "02 — Restore", index: 2, title: "Calf loading, phase one", duration: "10:02", status: "Draft" },
  { id: "l8", programId: "ankle-recovery", module: "03 — Load", index: 3, title: "Single-leg balance under fatigue", duration: "7:35", status: "Draft" },

  { id: "l9", programId: "shoulder-movement", module: "01 — Assess", index: 1, title: "Overhead reach screen", duration: "6:55", status: "Published" },
  { id: "l10", programId: "shoulder-movement", module: "02 — Restore", index: 2, title: "Rotator cuff isometrics", duration: "8:44", status: "Draft" },

  { id: "l11", programId: "bunion-guide", module: "01 — Understand", index: 1, title: "What a bunion actually is", duration: "4:10", status: "Published" },
  { id: "l12", programId: "bunion-guide", module: "02 — Practice", index: 2, title: "Toe spacer daily routine", duration: "5:58", status: "Draft" },
];

export interface Customer {
  id: string;
  name: string;
  email: string;
  signup: string;
  owns: string[];
}

export const customers: Customer[] = [
  { id: "c1", name: "Sample Person A", email: "sample.a@example.com", signup: "2026-08-19", owns: ["Neck & Shoulder Reset"] },
  { id: "c2", name: "Sample Person B", email: "sample.b@example.com", signup: "2026-08-17", owns: ["Ankle Recovery Program", "Bunion / Hallux Valgus Guide"] },
  { id: "c3", name: "Test User C", email: "test.c@example.com", signup: "2026-08-15", owns: [] },
  { id: "c4", name: "Test User D", email: "test.d@example.com", signup: "2026-08-12", owns: ["Shoulder Movement Program"] },
  { id: "c5", name: "Placeholder E", email: "placeholder.e@example.com", signup: "2026-08-09", owns: ["Neck & Shoulder Reset", "Shoulder Movement Program"] },
  { id: "c6", name: "Placeholder F", email: "placeholder.f@example.com", signup: "2026-08-05", owns: ["Bunion / Hallux Valgus Guide"] },
  { id: "c7", name: "Demo Account G", email: "demo.g@example.com", signup: "2026-07-31", owns: [] },
];

export type OrderStatus = "Paid" | "Refunded" | "Pending";

export interface Order {
  id: string;
  customer: string;
  program: string;
  amount: number;
  date: string;
  status: OrderStatus;
}

export const orders: Order[] = [
  { id: "LBF-2041", customer: "Sample Person A", program: "Neck & Shoulder Reset", amount: 59, date: "2026-08-19", status: "Paid" },
  { id: "LBF-2040", customer: "Sample Person B", program: "Bunion / Hallux Valgus Guide", amount: 19, date: "2026-08-18", status: "Paid" },
  { id: "LBF-2039", customer: "Placeholder E", program: "Shoulder Movement Program", amount: 69, date: "2026-08-16", status: "Refunded" },
  { id: "LBF-2038", customer: "Sample Person B", program: "Ankle Recovery Program", amount: 69, date: "2026-08-15", status: "Paid" },
  { id: "LBF-2037", customer: "Test User D", program: "Shoulder Movement Program", amount: 69, date: "2026-08-12", status: "Paid" },
  { id: "LBF-2036", customer: "Placeholder F", program: "Bunion / Hallux Valgus Guide", amount: 19, date: "2026-08-08", status: "Pending" },
  { id: "LBF-2035", customer: "Placeholder E", program: "Neck & Shoulder Reset", amount: 59, date: "2026-08-04", status: "Paid" },
];
