const LEGACY_SALES_PAGE_ID_BY_PROGRAM_SLUG: Record<string, string> = {
  "neck-shoulder-reset": "neck-alignment",
  "ankle-recovery": "ankle-sprain-rehabilitation",
  "shoulder-movement": "shoulder-movement",
  "bunion-hallux-valgus-guide": "bunion-hallux-valgus-guide",
};

export function programSalesHref(slug: string) {
  const salesPageId = LEGACY_SALES_PAGE_ID_BY_PROGRAM_SLUG[slug];
  return salesPageId ? `/video.html?id=${encodeURIComponent(salesPageId)}` : `/programs/${encodeURIComponent(slug)}`;
}

export function legacySalesPageId(slug: string) {
  return LEGACY_SALES_PAGE_ID_BY_PROGRAM_SLUG[slug] ?? null;
}
