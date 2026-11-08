import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Verification = z.object({
  emailHash: z.string().regex(/^[a-f0-9]{64}$/),
});

export const Route = createFileRoute("/api/recipe-library-leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.match(/^Bearer (\S+)$/i)?.[1];
        if (!token) return new Response("Email verification required", { status: 401 });

        let parsed: z.infer<typeof Verification>;
        try {
          parsed = Verification.parse(await request.json());
        } catch {
          return new Response("Invalid verification request", { status: 400 });
        }

        const { createHash } = await import("node:crypto");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        const email = data.user?.email?.trim().toLowerCase();
        if (error || !email || !data.user?.email_confirmed_at) {
          return new Response("Email verification required", { status: 401 });
        }
        if (createHash("sha256").update(email).digest("hex") !== parsed.emailHash) {
          return new Response("Verification email does not match", { status: 403 });
        }

        const result = await supabaseAdmin
          .from("recipe_library_leads")
          .upsert(
            {
              email,
              source_path: "/library-access",
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
        const { recipeLibraryCookie } = await import("@/lib/recipe-library-access.server");
        return new Response(null, {
          status: 204,
          headers: {
            "Set-Cookie": recipeLibraryCookie(),
            "Cache-Control": "private, no-store",
          },
        });
      },
    },
  },
});
