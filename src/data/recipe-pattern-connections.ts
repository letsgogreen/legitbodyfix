/** Editorial connections, not diagnostic or causal classifications. */
export const forwardLeanSlug = "excessive-forward-trunk-leaning";

export const forwardLeanConnections = [
  {
    slug: "heel-rise",
    reason: "Explore ankle motion and heel contact. Limited forward movement of the shin can accompany greater trunk inclination; heel rise is a different possible response, not proof of the same cause.",
  },
  {
    slug: "valgus-knee-knee-collapsing-inward",
    reason: "Explore inward knee movement alongside hip adduction and rotation. This can coexist with forward lean, but does not establish an adductor restriction or a shared cause.",
  },
  {
    slug: "asymmetric-weight-shift",
    reason: "Explore whether forward lean occurs together with a sideways shift. This is a related observation to investigate, not evidence that one hip is restricted.",
  },
  {
    slug: "excessive-posterior-tilt",
    reason: "Explore pelvic movement at depth. A torso inclined forward and a pelvis rotating backward are different observations and may occur together or separately.",
  },
] as const;

export function selectForwardLeanConnections<T extends { slug: string }>(recipes: T[]) {
  return forwardLeanConnections.flatMap((connection) => {
    const recipe = recipes.find((candidate) => candidate.slug === connection.slug);
    return recipe ? [{ ...recipe, connectionReason: connection.reason }] : [];
  });
}
