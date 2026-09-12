export const homepageCopyDefaults = {
  hero_eyebrow: "Movement education for everyday life and training",
  hero_title: "Move\nbetter.\nStart\nhere.",
  hero_summary: "Stiff after sitting? Unsure where to begin with your movement? Find relevant anatomy and articles, then explore a guided program when you want more structure.",
  hero_primary_cta: "Find my starting point",
  hero_secondary_cta: "Explore free resources",
  paths_heading: "Choose the kind of help you need.",
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
  fields: Array<{ key: HomepageCopyKey; label: string; multiline?: boolean }>;
}> = [
  {
    title: "Hero",
    description: "The first message and primary actions visitors see.",
    fields: [
      { key: "hero_eyebrow", label: "Eyebrow" },
      { key: "hero_title", label: "Headline", multiline: true },
      { key: "hero_summary", label: "Summary", multiline: true },
      { key: "hero_primary_cta", label: "Primary button" },
      { key: "hero_secondary_cta", label: "Secondary button" },
    ],
  },
  {
    title: "Homepage sections",
    description: "Headings and introductions for the main browsing sections.",
    fields: [
      { key: "paths_heading", label: "Path chooser heading" },
      { key: "regions_eyebrow", label: "Body regions eyebrow" },
      { key: "regions_heading", label: "Body regions heading" },
      { key: "regions_intro", label: "Body regions introduction", multiline: true },
      { key: "programs_eyebrow", label: "Programs eyebrow" },
      { key: "programs_heading", label: "Programs heading" },
      { key: "programs_intro", label: "Programs introduction", multiline: true },
      { key: "method_eyebrow", label: "Method eyebrow" },
      { key: "method_heading", label: "Method heading" },
      { key: "why_eyebrow", label: "Positioning eyebrow" },
      { key: "why_heading", label: "Positioning heading" },
    ],
  },
  {
    title: "Closing action",
    description: "The final prompt shown before the footer.",
    fields: [
      { key: "final_heading", label: "Heading" },
      { key: "final_body", label: "Supporting text", multiline: true },
      { key: "final_cta", label: "Button label" },
    ],
  },
];
