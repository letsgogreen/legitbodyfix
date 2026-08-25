import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ver1/")({
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
