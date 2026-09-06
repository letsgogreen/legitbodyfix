import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function currentPrice(programId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: program, error: programError }, { data: prices, error: priceError }] = await Promise.all([
    supabaseAdmin.from("programs").select("id,published").eq("id", programId).maybeSingle(),
    supabaseAdmin.from("program_price_changes").select("amount_minor,currency").eq("program_id", programId).order("created_at", { ascending: false }).limit(1),
  ]);
  if (programError || priceError) throw new Error(programError?.message || priceError?.message);
  if (!program?.published) throw new Error("This program is not available for purchase.");
  const price = prices?.[0];
  if (!price || price.amount_minor <= 0) throw new Error("This program does not have a PayPal price yet.");
  return { amountMinor: price.amount_minor, currency: price.currency.toUpperCase() };
}

export const getPayPalClientConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { paypalConfig } = await import("@/lib/paypal.server");
  const config = paypalConfig();
  return { clientId: config.clientId, environment: config.environment };
});

export const createProgramPayPalOrder = createServerFn({ method: "POST" })
  .validator((input) => z.object({ programId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const price = await currentPrice(data.programId);
    const { createPayPalOrder } = await import("@/lib/paypal.server");
    return { orderId: await createPayPalOrder(data.programId, price.amountMinor, price.currency) };
  });

export const captureProgramPayPalOrder = createServerFn({ method: "POST" })
  .validator((input) => z.object({ orderId: z.string().regex(/^[A-Z0-9]{10,40}$/) }).parse(input))
  .handler(async ({ data }) => {
    const { captureAndVerifyPayPalOrder } = await import("@/lib/paypal.server");
    const payment = await captureAndVerifyPayPalOrder(data.orderId);
    const expected = await currentPrice(payment.programId);
    if (payment.amountMinor !== expected.amountMinor || payment.currency !== expected.currency.toLowerCase()) {
      throw new Error("The PayPal payment amount did not match the current program price.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin.from("customer_profiles").select("user_id").ilike("email", payment.email).maybeSingle();
    const orderClient = supabaseAdmin as unknown as {
      from: (table: string) => {
        upsert: (row: Record<string, unknown>, options: Record<string, unknown>) => {
          select: (columns: string) => { single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> };
        };
      };
    };
    const { data: order, error } = await orderClient.from("orders").upsert({
      provider: "paypal",
      paypal_order_id: payment.orderId,
      paypal_capture_id: payment.captureId,
      user_id: profile?.user_id ?? null,
      program_id: payment.programId,
      customer_email: payment.email,
      amount_total: payment.amountMinor,
      currency: payment.currency,
      status: "paid",
      purchased_at: payment.purchasedAt,
    }, { onConflict: "paypal_capture_id" }).select("id").single();
    if (error || !order) throw new Error(error?.message || "The purchase could not be recorded.");
    if (profile?.user_id) {
      const { error: entitlementError } = await supabaseAdmin.from("entitlements").upsert({
        user_id: profile.user_id,
        program_id: payment.programId,
        order_id: order.id,
        source: "paypal",
        active: true,
        revoked_at: null,
      }, { onConflict: "user_id,program_id" });
      if (entitlementError) throw new Error(entitlementError.message);
    }
    return { completed: true, email: payment.email };
  });
