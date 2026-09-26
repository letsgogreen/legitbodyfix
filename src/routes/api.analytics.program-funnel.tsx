import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ProgramFunnelEvent = z.object({
  session_id: z.string().uuid(),
  visitor_id: z.string().uuid(),
  program_slug: z.string().min(1).max(160),
  program_name: z.string().min(1).max(240),
  event_type: z.enum(["card_impression", "card_click", "sales_view", "checkout_click"]),
  source_path: z.string().startsWith("/").max(500),
  device_type: z.enum(["desktop", "tablet", "mobile"]),
});

export const Route = createFileRoute("/api/analytics/program-funnel")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let event: z.infer<typeof ProgramFunnelEvent>;
        try {
          event = ProgramFunnelEvent.parse(await request.json());
        } catch {
          return new Response("Invalid analytics event", { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const result = await supabaseAdmin.from("program_funnel_events").upsert(event, {
          onConflict: "session_id,program_slug,event_type",
          ignoreDuplicates: true,
        });
        if (result.error) {
          console.error("Program funnel insert failed", result.error.message);
          return new Response("Analytics unavailable", { status: 503 });
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
