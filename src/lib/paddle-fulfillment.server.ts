const TOLERANCE_SECONDS = 300;
type Transaction = {
  id?: string; status?: string; subscription_id?: string | null; transaction_id?: string | null; action?: string | null;
  customer?: { email?: string | null } | null; custom_data?: { email?: string | null; user_id?: string | null } | null;
  currency_code?: string | null; details?: { totals?: { total?: string | number | null; currency_code?: string | null } | null } | null;
  items?: { price?: { id?: string | null; product_id?: string | null } | null; price_id?: string | null }[] | null;
};
export type PaddleEvent = { event_id?: string; event_type?: string; data?: Transaction };

export async function verifyPaddleSignature(header: string | null, body: string, secret: string) {
  if (!header) return false;
  const parts = new Map(header.split(";").map((part) => part.trim().split("=", 2)).filter((part) => part.length === 2) as [string, string][]);
  const ts = parts.get("ts"); const signature = parts.get("h1");
  if (!ts || !signature || Math.abs(Date.now() / 1000 - Number(ts)) > TOLERANCE_SECONDS) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ts}:${body}`)));
  const expected = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (expected.length !== signature.length) return false;
  let mismatch = 0; for (let index = 0; index < expected.length; index += 1) mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  return mismatch === 0;
}

const emailOf = (tx: Transaction) => tx.customer?.email?.trim() || tx.custom_data?.email?.trim() || null;
const amountOf = (tx: Transaction) => { const value = Number.parseInt(String(tx.details?.totals?.total ?? "0"), 10); return Number.isFinite(value) ? value : 0; };
const currencyOf = (tx: Transaction) => (tx.details?.totals?.currency_code || tx.currency_code || "usd").toLowerCase();

async function resolveProgramId(tx: Transaction) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const prices = (tx.items ?? []).map((item) => item.price?.id || item.price_id).filter(Boolean) as string[];
  const products = (tx.items ?? []).map((item) => item.price?.product_id).filter(Boolean) as string[];
  if (prices.length) { const { data, error } = await supabaseAdmin.from("programs").select("id").in("paddle_price_id", prices).limit(1); if (error) throw new Error(error.message); if (data?.[0]) return data[0].id; }
  if (products.length) { const { data, error } = await supabaseAdmin.from("programs").select("id").in("paddle_product_id", products).limit(1); if (error) throw new Error(error.message); if (data?.[0]) return data[0].id; }
  return null;
}

async function resolveUserId(email: string | null, custom: Transaction["custom_data"]) {
  if (custom?.user_id) return custom.user_id;
  if (!email) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("customer_profiles").select("user_id").ilike("email", email).maybeSingle();
  return data?.user_id ?? null;
}

async function completed(tx: Transaction) {
  if (!tx.id) throw new Error("Transaction id is missing.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = emailOf(tx); const programId = await resolveProgramId(tx); const userId = await resolveUserId(email, tx.custom_data);
  const { data: order, error } = await supabaseAdmin.from("orders").upsert({
    provider: "paddle", paddle_transaction_id: tx.id, paddle_subscription_id: tx.subscription_id ?? null,
    user_id: userId, program_id: programId, customer_email: email, amount_total: amountOf(tx),
    currency: currencyOf(tx), status: "paid", purchased_at: new Date().toISOString(),
  }, { onConflict: "paddle_transaction_id" }).select("id").single();
  if (error) throw new Error(`Order write failed: ${error.message}`);
  if (programId && userId) {
    const { error: accessError } = await supabaseAdmin.from("entitlements").upsert({ user_id: userId, program_id: programId, order_id: order.id, source: "paddle", active: true, revoked_at: null }, { onConflict: "user_id,program_id" });
    if (accessError) throw new Error(`Entitlement write failed: ${accessError.message}`);
  }
}

async function failed(tx: Transaction) {
  if (!tx.id) throw new Error("Transaction id is missing.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = emailOf(tx);
  const { error } = await supabaseAdmin.from("orders").upsert({ provider: "paddle", paddle_transaction_id: tx.id, user_id: await resolveUserId(email, tx.custom_data), program_id: await resolveProgramId(tx), customer_email: email, amount_total: amountOf(tx), currency: currencyOf(tx), status: "failed" }, { onConflict: "paddle_transaction_id" });
  if (error) throw new Error(error.message);
}

async function refunded(transactionId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("orders").update({ status: "refunded" }).eq("paddle_transaction_id", transactionId).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (data) await supabaseAdmin.from("entitlements").update({ active: false, revoked_at: new Date().toISOString() }).eq("order_id", data.id);
}

export async function handlePaddleEvent(event: PaddleEvent) {
  const tx = event.data ?? {}; const type = event.event_type ?? "";
  if (type === "transaction.completed" || (type === "transaction.updated" && tx.status === "completed")) await completed(tx);
  else if (type === "transaction.payment_failed") await failed(tx);
  else if (type.startsWith("adjustment.") || type === "transaction.canceled") { const id = tx.transaction_id || tx.id; if (id && (tx.action ?? "refund") !== "credit") await refunded(id); }
}
