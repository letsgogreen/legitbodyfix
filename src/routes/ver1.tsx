import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ver1")({
  head: () => ({
    meta: [
      { title: "LegitBodyFix — Pre-Lovable Homepage" },
      {
        name: "description",
        content:
          "The preserved LegitBodyFix homepage immediately before the Lovable-led homepage swap.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PreLovableHomepage,
});

function PreLovableHomepage() {
  return (
    <iframe
      src="/ver1-snapshot/index.html"
      title="LegitBodyFix pre-Lovable homepage"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        background: "#f2f0e9",
      }}
    />
  );
}
