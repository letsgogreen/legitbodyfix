import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/public/program-sales/$videoId")({
  server: { handlers: { GET: async ({ params }) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.videoId)) return new Response("Not found", { status: 404 });
    try {
      const url = process.env["SUPABASE_URL"];
      const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
      if (!url || !key) throw new Error("Public sales content is not configured.");
      const supabase = createClient<Database>(url, key, {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase.from("program_sales_pages").select("content").eq("video_id", params.videoId).maybeSingle();
      if (error) throw error;
      const content = (data?.content as Record<string, unknown> | null) ?? {};
      let previewIframeUrl = "";
      if (content.previewStreamStatus === "ready" && typeof content.previewStreamUid === "string") {
        try {
          const { getPublicSalesPreviewIframe } = await import("@/lib/stream.functions");
          previewIframeUrl = await getPublicSalesPreviewIframe(content.previewStreamUid);
        } catch (previewError) {
          console.error("Sales preview playback failed:", previewError);
        }
      }
      return Response.json({ ...content, previewIframeUrl }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } });
    } catch (error) {
      console.error("Program sales content failed:", error);
      return Response.json({}, { status: 200, headers: { "Cache-Control": "no-store" } });
    }
  } } },
});
