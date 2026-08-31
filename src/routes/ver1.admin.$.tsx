import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ver1/admin/$")({
  beforeLoad: ({ location }) => {
    const destination = location.pathname.replace(/^\/ver1\/admin/, "/admin");
    throw redirect({ href: `${destination}${location.searchStr}${location.hash}` });
  },
});
