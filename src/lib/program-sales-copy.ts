const LEGACY_NECK_HEADLINE = "Build better neck control in one guided sequence.";
const NECK_HEADLINE = "A guided session for neck and shoulder control.";

export function normalizeProgramSalesCopy<T extends Record<string, unknown>>(
  videoId: string,
  content: T,
): T {
  if (videoId !== "neck-alignment" || content.landingHeadline !== LEGACY_NECK_HEADLINE) {
    return content;
  }

  return { ...content, landingHeadline: NECK_HEADLINE };
}
