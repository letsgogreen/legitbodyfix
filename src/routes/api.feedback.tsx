import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Feedback = z.object({
  sentiment: z.enum(["helpful", "needs_improvement"]),
  message: z.string().trim().max(2000),
  page_path: z.string().startsWith("/").max(500),
  device_type: z.enum(["desktop", "tablet", "mobile"]),
  visitor_id: z.string().uuid().nullable(),
  website: z.string().max(200).optional(),
});

export const Route = createFileRoute("/api/feedback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed: z.infer<typeof Feedback>;
        try {
          parsed = Feedback.parse(await request.json());
        } catch {
          return new Response("Invalid feedback", { status: 400 });
        }

        if (parsed.website) return new Response(null, { status: 204 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        if (parsed.visitor_id) {
          const since = new Date(Date.now() - 86_400_000).toISOString();
          const recent = await supabaseAdmin
            .from("site_feedback")
            .select("id", { count: "exact", head: true })
            .eq("visitor_id", parsed.visitor_id)
            .gte("created_at", since);
          if (!recent.error && (recent.count ?? 0) >= 3) {
            return new Response("Feedback limit reached", { status: 429 });
          }
        }

        const { website: _website, ...feedback } = parsed;
        const result = await supabaseAdmin
          .from("site_feedback")
          .insert(feedback)
          .select("id,created_at")
          .single();
        if (result.error) {
          console.error("Site feedback insert failed", { message: result.error.message });
          return new Response("Feedback unavailable", { status: 503 });
        }
        try {
          const { sendFeedbackEmail } = await import("@/lib/feedback-email.server");
          await sendFeedbackEmail({
            id: result.data.id,
            sentiment: parsed.sentiment,
            message: parsed.message,
            pagePath: parsed.page_path,
            deviceType: parsed.device_type,
            createdAt: result.data.created_at,
          });
        } catch (error) {
          console.error("Feedback saved but email notification failed", {
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
