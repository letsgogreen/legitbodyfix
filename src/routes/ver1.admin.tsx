import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ver1/admin")({
  head: () => ({
    meta: [
      { title: "LegitBodyFix Ver1 — Control Room" },
      {
        name: "description",
        content: "The preserved LegitBodyFix control room for the pre-Lovable site.",
      },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: Ver1Admin,
});

function Ver1Admin() {
  return (
    <iframe
      src="/ver1-admin-snapshot/admin.html"
      title="LegitBodyFix Ver1 control room"
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
