import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/lessons")({
  validateSearch: (search: Record<string, unknown>) => ({ program: typeof search.program === "string" ? search.program : undefined }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/admin/programs", search: { view: "curriculum", program: search.program }, replace: true });
  },
});
