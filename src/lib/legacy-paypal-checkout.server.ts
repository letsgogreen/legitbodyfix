import { captureAndVerifyPayPalOrder, createPayPalOrder, paypalConfig } from "@/lib/paypal.server";

const product = {
  id: "neck-alignment",
  programSlug: "neck-shoulder-reset",
  title: "Neck Alignment — Single Session",
  amount: 45,
  amountMinor: 4500,
  currency: "USD",
};

export function legacyCheckoutConfig() {
  const config = paypalConfig();
  return {
    clientId: config.clientId,
    currency: product.currency,
    catalog: [{ id: product.id, title: product.title, amount: product.amount, currency: product.currency }],
  };
}

async function programId() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("programs").select("id,published").eq("slug", product.programSlug).maybeSingle();
  if (error || !data?.published) throw new Error(error?.message || "This program is not available for purchase.");
  return data.id;
}

export async function createLegacyPayPalOrder(productId: string) {
  if (productId !== product.id) throw new Error("Unknown product.");
  return createPayPalOrder(await programId(), product.amountMinor, product.currency);
}

export async function captureLegacyPayPalOrder(orderId: string) {
  const payment = await captureAndVerifyPayPalOrder(orderId);
  const expectedProgramId = await programId();
  if (payment.programId !== expectedProgramId || payment.amountMinor !== product.amountMinor || payment.currency !== product.currency.toLowerCase()) {
    throw new Error("The PayPal payment did not match this product.");
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile } = await supabaseAdmin.from("customer_profiles").select("user_id").ilike("email", payment.email).maybeSingle();
  const { data: order, error } = await supabaseAdmin.from("orders").upsert({
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
  return { completed: true, libraryUrl: "/library", email: payment.email };
}
