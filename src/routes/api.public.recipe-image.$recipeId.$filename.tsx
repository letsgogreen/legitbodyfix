import { createFileRoute } from "@tanstack/react-router";

const SAFE_SEGMENT = /^[a-zA-Z0-9._-]+$/;

export const Route = createFileRoute("/api/public/recipe-image/$recipeId/$filename")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!SAFE_SEGMENT.test(params.recipeId) || !SAFE_SEGMENT.test(params.filename)) {
          return new Response("Not found", { status: 404 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const storagePath = `${params.recipeId}/${params.filename}`;
          const { data, error } = await supabaseAdmin.storage
            .from("recipe-images")
            .download(storagePath);

          if (error || !data) {
            console.error("Recipe image download failed:", error ?? storagePath);
            return new Response("Not found", { status: 404 });
          }

          return new Response(data, {
            headers: {
              "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
              "Content-Type": data.type || "application/octet-stream",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch (error) {
          console.error("Recipe image route failed:", error);
          return new Response("Image unavailable", { status: 503 });
        }
      },
    },
  },
});
