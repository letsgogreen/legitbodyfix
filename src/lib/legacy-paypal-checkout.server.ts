import { captureAndVerifyPayPalOrder, createPayPalOrder, paypalConfig } from "@/lib/paypal.server";

const products = [
  { id: "neck-alignment", programSlug: "neck-shoulder-reset", title: "Neck & Shoulder Reset", amount: 69 },
  { id: "ankle-sprain-rehabilitation", programSlug: "ankle-recovery", title: "Ankle Recovery Program", amount: 69 },
  { id: "shoulder-movement", programSlug: "shoulder-movement", title: "Shoulder Movement Program", amount: 89 },
  { id: "bunion-hallux-valgus-guide", programSlug: "bunion-hallux-valgus-guide", title: "Bunion / Hallux Valgus Guide", amount: 34 },
] as const;

export function legacyCheckoutConfig() {
  const config = paypalConfig();
  return {
    clientId: config.clientId,
    currency: "USD",
    catalog: products.map(({ id, title, amount }) => ({ id, title, amount, currency: "USD" })),
  };
}

async function programId(programSlug: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("programs").select("id,published").eq("slug", programSlug).maybeSingle();
  if (error || !data?.published) throw new Error(error?.message || "This program is not available for purchase.");
  return data.id;
}

export async function createLegacyPayPalOrder(productId: string) {
  const product = products.find((item) => item.id === productId);
  if (!product) throw new Error("Unknown product.");
  return createPayPalOrder(await programId(product.programSlug), product.amount * 100, "USD");
}

export async function captureLegacyPayPalOrder(orderId: string) {
  const payment = await captureAndVerifyPayPalOrder(orderId);
  const resolved = await Promise.all(products.map(async (product) => ({ product, programId: await programId(product.programSlug) })));
  const match = resolved.find((item) => item.programId === payment.programId);
  if (!match || payment.amountMinor !== match.product.amount * 100 || payment.currency !== "usd") {
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
