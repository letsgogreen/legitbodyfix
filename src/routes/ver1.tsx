import { createFileRoute, Outlet } from "@tanstack/react-router";

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
  component: Ver1Layout,
});

function Ver1Layout() {
  return <Outlet />;
}
