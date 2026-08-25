/**
 * Name normalization shared by muscle duplicate detection and search.
 * Lowercases, strips accents, removes side markers and punctuation.
 */
export function normalizeMuscleName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(left|right|l|r)\b/g, " ")
    .replace(/\(m\.|musculus\)?/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function slugifyName(input: string): string {
  return normalizeMuscleName(input).replace(/\s+/g, "-");
}

/** Dice coefficient on bigrams — cheap fuzzy score for possible-duplicate flags. */
export function similarity(a: string, b: string): number {
  const left = normalizeMuscleName(a);
  const right = normalizeMuscleName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;

  const bigrams = (value: string) => {
    const set = new Map<string, number>();
    for (let i = 0; i < value.length - 1; i += 1) {
      const gram = value.slice(i, i + 2);
      set.set(gram, (set.get(gram) ?? 0) + 1);
    }
    return set;
  };

  const first = bigrams(left);
  const second = bigrams(right);
  let overlap = 0;
  let totalFirst = 0;
  let totalSecond = 0;

  for (const count of first.values()) totalFirst += count;
  for (const [gram, count] of second) {
    totalSecond += count;
    overlap += Math.min(count, first.get(gram) ?? 0);
  }

  const total = totalFirst + totalSecond;
  return total === 0 ? 0 : (2 * overlap) / total;
}
