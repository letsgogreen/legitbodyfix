import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ver1/admin")({
  beforeLoad: () => {
    throw redirect({ href: "https://move-system-landing.lovable.app/admin" });
  },
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
});
