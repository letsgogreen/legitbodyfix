import { createFileRoute } from "@tanstack/react-router";
import { ConditionsPage } from "@/components/site/ConditionsPage";
import { findBodyRegion } from "@/data/body-regions";
export const Route = createFileRoute("/conditions/")({
  validateSearch: (search: Record<string, unknown>) => ({
    region: typeof search["region"] === "string" && findBodyRegion(search["region"]) ? search["region"] : undefined,
  }),
  head: () => ({ meta: [{ title: "Conditions | LegitBodyFix" }] }),
  component: ConditionsIndex,
});
function ConditionsIndex() {
  const { region } = Route.useSearch();
  return <ConditionsPage region={region} />;
}
