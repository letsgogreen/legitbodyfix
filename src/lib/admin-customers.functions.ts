import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return adminClaims.app_metadata?.is_admin === true &&
    adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}

export const setAdminCustomerAccess = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth, requireSupabaseAuth])
  .validator((input) => z.object({
    userId: z.string().uuid(),
    programId: z.string().uuid(),
    active: z.boolean(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customer_profiles")
      .select("email")
      .eq("user_id", data.userId)
      .maybeSingle();
    if (customerError) throw new Error(customerError.message);

    const buyerEmail = customer?.email?.trim().toLowerCase();
    if (!buyerEmail) throw new Error("This customer account does not have an email address.");

    const { data: current, error: readError } = await supabaseAdmin
      .from("entitlements")
      .select("id,source")
      .eq("user_id", data.userId)
      .eq("program_id", data.programId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);

    const mutation = current
      ? supabaseAdmin
          .from("entitlements")
          .update({
            active: data.active,
            revoked_at: data.active ? null : new Date().toISOString(),
            source: current.source || "manual",
          })
          .eq("id", current.id)
      : supabaseAdmin.from("entitlements").insert({
          user_id: data.userId,
          program_id: data.programId,
          // buyer_email exists in the deployed entitlement schema for legacy
          // purchase reconciliation, but is absent from the generated local type.
          buyer_email: buyerEmail,
          source: "manual",
          active: data.active,
          revoked_at: data.active ? null : new Date().toISOString(),
        } as never);

    const { error } = await mutation;
    if (error) throw new Error(error.message);
    return { programId: data.programId, active: data.active };
  });
