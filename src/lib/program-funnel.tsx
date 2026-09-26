import { useEffect, useRef } from "react";
import type { PublicProgram } from "@/lib/public-programs.functions";
import { trackProgramFunnel } from "@/lib/program-funnel-client";

export function ProgramCardImpression({
  program,
  children,
}: {
  program: Pick<PublicProgram, "slug" | "name">;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.5) return;
        trackProgramFunnel("card_impression", program);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [program]);
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}

export function ProgramSalesView({ program }: { program: Pick<PublicProgram, "slug" | "name"> }) {
  useEffect(() => trackProgramFunnel("sales_view", program), [program]);
  return null;
}
