import { createFileRoute } from "@tanstack/react-router";
import { ConditionsPage } from "@/components/site/ConditionsPage";
import { findBodyRegion } from "@/data/body-regions";
export const Route = createFileRoute("/conditions/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    region: typeof search["region"] === "string" && findBodyRegion(search["region"]) ? search["region"] : undefined,
  }),
  head: () => ({ meta: [{ title: "Condition guide | LegitBodyFix" }] }),
  component: ConditionDetail,
});
function ConditionDetail() { const { slug } = Route.useParams(); const { region } = Route.useSearch(); return <ConditionsPage slug={slug} region={region} />; }
