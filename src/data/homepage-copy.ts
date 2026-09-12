export const homepageCopyDefaults = {
  hero_eyebrow: "Movement education for everyday life and training",
  hero_title: "Move\nbetter.\nStart\nhere.",
  hero_summary: "Stiff after sitting? Unsure where to begin with your movement? Find relevant anatomy and articles, then explore a guided program when you want more structure.",
  hero_primary_cta: "Find my starting point",
  hero_secondary_cta: "Explore free resources",
  paths_heading: "Choose the kind of help you need.",
  path_direction_label: "01 / Find your direction",
  path_direction_title: "Not sure where to start?",
  path_direction_body: "Choose your area and goal to find relevant resources. A starting point, not a diagnosis.",
  path_direction_cta: "Find my starting point",
  path_learning_label: "02 / Free learning",
  path_learning_title: "Understand your movement.",
  path_learning_body: "Browse anatomy, movement articles, and condition guides before deciding what to explore.",
  path_learning_cta: "Explore by body region",
  path_programs_label: "03 / Paid programs",
  path_programs_title: "Prefer a guided session?",
  path_programs_body: "Review each program’s focus, contents, and current price before choosing. No subscription.",
  path_programs_cta: "Compare programs",
  regions_eyebrow: "Start by body region",
  regions_heading: "Where do you want to start?",
  regions_intro: "Whether a squat feels restricted, overhead movement feels uncertain, or sitting leaves you stiff, begin with the area that feels most relevant.",
  programs_eyebrow: "Optional guided programs",
  programs_heading: "Choose a program with a clear focus.",
  programs_intro: "Compare the focus and contents before you buy. Each program page shows its current price and what is included. Purchased sessions live in your private library.",
  method_eyebrow: "How it works",
  method_heading: "Three steps. One clear direction.",
  why_eyebrow: "Why LegitBodyFix",
  why_heading: "More structure than another exercise list.",
  final_heading: "Not sure where to begin?",
  final_body: "Choose an area and how you prefer to learn. We will show you where to go next.",
  final_cta: "Find my starting point",
} as const;

export type HomepageCopyKey = keyof typeof homepageCopyDefaults;
export type HomepageCopy = Record<HomepageCopyKey, string>;

export const homepageCopyGroups: Array<{
  title: string;
  description: string;
  location: string;
  fields: Array<{ key: HomepageCopyKey; label: string; multiline?: boolean }>;
}> = [
  {
    title: "Hero",
    description: "The first message and primary actions visitors see.",
    location: "Top of page",
    fields: [
      { key: "hero_eyebrow", label: "Eyebrow" },
      { key: "hero_title", label: "Headline", multiline: true },
      { key: "hero_summary", label: "Summary", multiline: true },
      { key: "hero_primary_cta", label: "Primary button" },
      { key: "hero_secondary_cta", label: "Secondary button" },
    ],
  },
  {
    title: "Choose a path",
    description: "Introduces the three ways visitors can continue from the hero.",
    location: "Section 02",
    fields: [
      { key: "paths_heading", label: "Path chooser heading" },
      { key: "path_direction_label", label: "Card 1 · Label" },
      { key: "path_direction_title", label: "Card 1 · Title" },
      { key: "path_direction_body", label: "Card 1 · Description", multiline: true },
      { key: "path_direction_cta", label: "Card 1 · Button" },
      { key: "path_learning_label", label: "Card 2 · Label" },
      { key: "path_learning_title", label: "Card 2 · Title" },
      { key: "path_learning_body", label: "Card 2 · Description", multiline: true },
      { key: "path_learning_cta", label: "Card 2 · Button" },
      { key: "path_programs_label", label: "Card 3 · Label" },
      { key: "path_programs_title", label: "Card 3 · Title" },
      { key: "path_programs_body", label: "Card 3 · Description", multiline: true },
      { key: "path_programs_cta", label: "Card 3 · Button" },
    ],
  },
  {
    title: "Body regions",
    description: "Sets up the body-region browser and helps visitors choose a relevant area.",
    location: "Section 03",
    fields: [
      { key: "regions_eyebrow", label: "Body regions eyebrow" },
      { key: "regions_heading", label: "Body regions heading" },
      { key: "regions_intro", label: "Body regions introduction", multiline: true },
    ],
  },
  {
    title: "Programs",
    description: "Introduces the paid guided-program cards.",
    location: "Section 04",
    fields: [
      { key: "programs_eyebrow", label: "Programs eyebrow" },
      { key: "programs_heading", label: "Programs heading" },
      { key: "programs_intro", label: "Programs introduction", multiline: true },
    ],
  },
  {
    title: "Method & positioning",
    description: "Explains the process and the value of the LegitBodyFix approach.",
    location: "Sections 05–06",
    fields: [
      { key: "method_eyebrow", label: "Method eyebrow" },
      { key: "method_heading", label: "Method heading" },
      { key: "why_eyebrow", label: "Positioning eyebrow" },
      { key: "why_heading", label: "Positioning heading" },
    ],
  },
  {
    title: "Closing action",
    description: "The final prompt shown before the footer.",
    location: "End of page",
    fields: [
      { key: "final_heading", label: "Heading" },
      { key: "final_body", label: "Supporting text", multiline: true },
      { key: "final_cta", label: "Button label" },
    ],
  },
];
