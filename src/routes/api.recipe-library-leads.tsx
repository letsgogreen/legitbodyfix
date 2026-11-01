import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Lead = z.object({
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  source_path: z.string().startsWith("/").max(500).default("/recipes"),
  website: z.string().max(200).optional(),
});

export const Route = createFileRoute("/api/recipe-library-leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed: z.infer<typeof Lead>;
        try {
          parsed = Lead.parse(await request.json());
        } catch {
          return new Response("Invalid email", { status: 400 });
        }
        if (parsed.website) return new Response(null, { status: 204 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const result = await supabaseAdmin
          .from("recipe_library_leads")
          .upsert(
            {
              email: parsed.email,
              source_path: parsed.source_path,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" },
          )
          .select("id")
          .single();
        if (result.error) {
          console.error("Recipe library lead insert failed", { message: result.error.message });
          return new Response("Unable to save email", { status: 503 });
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
