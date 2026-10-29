import { pelvisArticles } from "./pelvis.ts";
import { upperBodyArticles } from "./upper-body.ts";
import { lowerLimbArticles } from "./lower-limb.ts";
export { patternSources } from "./types.ts";
export type { PatternArticle } from "./types.ts";

/** Individually written editorial content. No automatic region-based recommendations. */
export const recipePatternArticles = {
  ...pelvisArticles,
  ...upperBodyArticles,
  ...lowerLimbArticles,
};
