import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/program-sales/$videoId")({
  server: { handlers: { GET: async ({ params }) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.videoId)) return new Response("Not found", { status: 404 });
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin.from("program_sales_pages").select("content").eq("video_id", params.videoId).maybeSingle();
      if (error) throw error;
      return Response.json(data?.content ?? {}, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } });
    } catch (error) {
      console.error("Program sales content failed:", error);
      return Response.json({}, { status: 200, headers: { "Cache-Control": "no-store" } });
    }
  } } },
});
