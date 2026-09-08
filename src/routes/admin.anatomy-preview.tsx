import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/anatomy-preview")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/programs", search: { view: "anatomy" }, replace: true });
  },
});
