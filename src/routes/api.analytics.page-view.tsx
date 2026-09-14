import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const PageView = z.object({
  session_id: z.string().uuid(),
  path: z.string().startsWith("/").max(500),
  referrer_host: z.string().max(255).nullable(),
  utm_source: z.string().max(120).nullable(),
  utm_medium: z.string().max(120).nullable(),
  utm_campaign: z.string().max(180).nullable(),
  device_type: z.enum(["desktop", "tablet", "mobile"]),
});

function headerCode(request: Request, name: string, max: number) {
  const value = request.headers.get(name)?.trim();
  return value && value.length <= max ? value.toUpperCase() : null;
}

export const Route = createFileRoute("/api/analytics/page-view")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed: z.infer<typeof PageView>;
        try { parsed = PageView.parse(await request.json()); }
        catch { return new Response("Invalid analytics event", { status: 400 }); }

        const countryCode = headerCode(request, "x-vercel-ip-country", 2) || headerCode(request, "cf-ipcountry", 2);
        const regionCode = headerCode(request, "x-vercel-ip-country-region", 80);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const located = await supabaseAdmin.from("page_views").insert({ ...parsed, country_code: countryCode, region_code: regionCode });
        if (located.error) {
          const fallback = await supabaseAdmin.from("page_views").insert(parsed);
          if (fallback.error) return new Response("Analytics unavailable", { status: 503 });
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});