import { createFileRoute } from "@tanstack/react-router";
import { ConditionsPage } from "@/components/site/ConditionsPage";
export const Route = createFileRoute("/conditions/$slug")({
  head: () => ({ meta: [{ title: "Condition guide | LegitBodyFix" }] }),
  component: ConditionDetail,
});
function ConditionDetail() { const { slug } = Route.useParams(); return <ConditionsPage slug={slug} />; }
