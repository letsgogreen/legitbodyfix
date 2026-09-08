import { createFileRoute } from "@tanstack/react-router";
import { ConditionsPage } from "@/components/site/ConditionsPage";
export const Route = createFileRoute("/conditions/")({
  head: () => ({ meta: [{ title: "Conditions | LegitBodyFix" }] }),
  component: ConditionsPage,
});
