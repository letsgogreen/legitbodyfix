import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { conditionSchema, conditionIssues } from "./conditions";

export const saveCondition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(input => z.object({ content: conditionSchema, version: z.number().int().min(0), action: z.enum(["draft", "publish", "unpublish"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const claims = context.claims as { email?: string; app_metadata?: { is_admin?: boolean } };
    if (claims.app_metadata?.is_admin !== true || claims.email?.toLowerCase() !== "thriveinside@protonmail.com") throw new Error("Administrator access required.");
    if (data.action === "publish") {
      const issues = conditionIssues(data.content);
      if (issues.length) throw new Error(issues.join(" "));
    }
    // New migration tables are isolated here until generated DB types are refreshed.
    const { data: version, error } = await (context.supabase as SupabaseClient).rpc("save_condition", {
      p_slug: data.content.id, p_data: data.content, p_version: data.version, p_action: data.action,
    });
    if (error) throw new Error(error.message);
    return { version: Number(version) };
  });
