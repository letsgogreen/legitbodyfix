import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function isAdmin(claims: unknown) {
  const adminClaims = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  return adminClaims.app_metadata?.is_admin === true &&
    adminClaims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
}

export const getAdminCustomerAccessData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [profileResult, entitlementResult, programResult, authResult] = await Promise.all([
      supabaseAdmin.from("customer_profiles").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("entitlements").select("*").order("granted_at", { ascending: false }),
      supabaseAdmin.from("programs").select("*").order("name"),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    const error = profileResult.error ?? entitlementResult.error ?? programResult.error ?? authResult.error;
    if (error) throw new Error(error.message);
    return {
      profiles: profileResult.data ?? [],
      entitlements: entitlementResult.data ?? [],
      programs: programResult.data ?? [],
      accounts: (authResult.data?.users ?? []).map((user) => ({
        userId: user.id,
        emailConfirmedAt: user.email_confirmed_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        createdAt: user.created_at,
      })),
    };
  });
export const setAdminCustomerAccess = createServerFn({ method: "POST" })
  // The bearer token is attached globally in src/start.ts. Registering the
  // client attacher again here can duplicate the Authorization header.
  .middleware([requireSupabaseAuth])
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
export const grantAdminCustomerAccessByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({
    email: z.string().trim().email(),
    programId: z.string().uuid(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");

    const email = data.email.trim().toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customer_profiles")
      .select("user_id,email")
      .ilike("email", email)
      .maybeSingle();
    if (customerError) throw new Error(customerError.message);
    if (!customer) throw new Error("No customer account uses this email. Ask the customer to create an account first.");

    const { data: current, error: readError } = await supabaseAdmin
      .from("entitlements")
      .select("id,source")
      .eq("user_id", customer.user_id)
      .eq("program_id", data.programId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);

    const mutation = current
      ? supabaseAdmin.from("entitlements").update({ active: true, revoked_at: null, source: current.source || "manual" }).eq("id", current.id)
      : supabaseAdmin.from("entitlements").insert({
          user_id: customer.user_id,
          program_id: data.programId,
          buyer_email: email,
          source: "manual",
          active: true,
          revoked_at: null,
        } as never);

    const { error } = await mutation;
    if (error) throw new Error(error.message);
    return { userId: customer.user_id, email, programId: data.programId };
  });

export const deleteAdminCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({
    userId: z.string().uuid(),
    confirmationEmail: z.string().trim().email(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.claims)) throw new Error("Administrator access required.");

    const claims = context.claims as { sub?: string; email?: string };
    if (claims.sub === data.userId) throw new Error("You cannot delete the administrator account currently in use.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customer_profiles")
      .select("email")
      .eq("user_id", data.userId)
      .maybeSingle();
    if (customerError) throw new Error(customerError.message);
    if (!customer?.email) throw new Error("Customer account not found.");

    const customerEmail = customer.email.trim().toLowerCase();
    if (customerEmail === claims.email?.trim().toLowerCase()) throw new Error("You cannot delete the administrator account currently in use.");
    if (customerEmail !== data.confirmationEmail.trim().toLowerCase()) throw new Error("The confirmation email does not match this customer.");

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { userId: data.userId };
  });
