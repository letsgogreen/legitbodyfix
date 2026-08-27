import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

export const Route = createFileRoute("/muscles")({
  component: MuscleLibraryLayout,
});

function MuscleLibraryLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
