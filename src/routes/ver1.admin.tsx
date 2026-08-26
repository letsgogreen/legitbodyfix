import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ver1/admin")({
  head: () => ({
    meta: [
      { title: "LegitBodyFix — Control Room" },
      {
        name: "description",
        content: "LegitBodyFix administrator control room.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: Ver1Admin,
});

function Ver1Admin() {
  return (
    <iframe
      src="https://move-system-landing.lovable.app/admin"
      title="LegitBodyFix administrator control room"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        background: "#f2f0e9",
      }}
      allow="clipboard-read; clipboard-write"
    />
  );
}
