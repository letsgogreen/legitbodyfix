import { createFileRoute } from "@tanstack/react-router";
import { PhaseOneHomepage } from "./index";

export const Route = createFileRoute("/ver1")({
  head: () => ({
    meta: [
      { title: "LegitBodyFix Ver1 — Move Better With a Plan" },
      {
        name: "description",
        content: "The Codex Phase 1 homepage concept for LegitBodyFix.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PhaseOneHomepage,
});
