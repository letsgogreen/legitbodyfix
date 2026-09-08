// Only allow known codes into the UI. Raw server messages can contain private details.
export function conditionLoadError(source: "drafts" | "publications", rawCode?: string): string {
  const missing = rawCode === "42P01" || rawCode === "PGRST205";
  const denied = rawCode === "42501" || rawCode === "PGRST301" || rawCode === "PGRST303";
  const code = missing || denied ? rawCode : "LOAD_FAILED";
  const guidance = missing
    ? "The Conditions table could not be found. Check the database migration."
    : denied
      ? "Access could not be verified. Sign in again; if this continues, check administrator permissions."
      : "The Conditions data could not be loaded. Retry before making any database changes.";
  return `${guidance} (${source}: ${code})`;
}
