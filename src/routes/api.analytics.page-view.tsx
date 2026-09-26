import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const PageView = z.object({
  session_id: z.string().uuid(),
  visitor_id: z.string().uuid(),
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

function headerText(request: Request, name: string, max: number) {
  const value = request.headers.get(name)?.trim();
  if (!value) return null;
  try {
    return decodeURIComponent(value).slice(0, max);
  } catch {
    return value.slice(0, max);
  }
}

async function networkHash(request: Request) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim();
  const salt = process.env.ANALYTICS_HASH_SALT;
  if (!ip || !salt) return null;
  const { createHmac } = await import("node:crypto");
  return createHmac("sha256", salt).update(ip).digest("hex").slice(0, 20);
}

export const Route = createFileRoute("/api/analytics/page-view")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed: z.infer<typeof PageView>;
        try {
          parsed = PageView.parse(await request.json());
        } catch {
          return new Response("Invalid analytics event", { status: 400 });
        }

        const countryCode =
          headerCode(request, "x-vercel-ip-country", 2) || headerCode(request, "cf-ipcountry", 2);
        const regionCode = headerCode(request, "x-vercel-ip-country-region", 80);
        const city = headerText(request, "x-vercel-ip-city", 120);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { resolveAdministrativeArea } = await import("@/lib/analytics-location.server");
        const [hashedNetwork, administrativeArea] = await Promise.all([
          networkHash(request),
          resolveAdministrativeArea(request, countryCode, supabaseAdmin),
        ]);
        const located = await supabaseAdmin.from("page_views").insert({
          ...parsed,
          country_code: countryCode,
          region_code: regionCode,
          city,
          administrative_area: administrativeArea,
          network_hash: hashedNetwork,
        });
        if (located.error) {
          const { visitor_id: _visitorId, ...legacyEvent } = parsed;
          const fallback = await supabaseAdmin.from("page_views").insert(legacyEvent);
          if (fallback.error) {
            console.error("Analytics page-view insert failed", {
              located: located.error.message,
              fallback: fallback.error.message,
            });
            return new Response("Analytics unavailable", { status: 503 });
          }
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
