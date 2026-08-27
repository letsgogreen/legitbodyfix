import { createFileRoute } from "@tanstack/react-router";
import { HomepageControl } from "@/components/admin/HomepageControl";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Homepage control — LegitBodyFix Admin" },
      {
        name: "description",
        content: "Preview the homepage and manage the live content systems that populate it.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <HomepageControl adminPrefix="/admin" />,
});
