import { createFileRoute } from "@tanstack/react-router";

type CheckoutSession = {
  id: string;
  client_reference_id?: string | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | null;
  payment_status?: string | null;
  metadata?: { program_id?: string; program_slug?: string } | null;
};

type StripeEvent = {
  id: string;
  type: string;
  data?: { object?: CheckoutSession & { payment_intent?: string | null } };
};

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook is not configured", { status: 503 });

        const signature = request.headers.get("Stripe-Signature");
        const rawBody = await request.text();
        if (!signature || !(await verifyStripeSignature(signature, rawBody, secret))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: StripeEvent;
        try { event = JSON.parse(rawBody) as StripeEvent; }
        catch { return new Response("Invalid JSON", { status: 400 }); }

        try {
          if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
            const session = event.data?.object;
            if (!session?.id) return new Response("Missing Checkout Session", { status: 400 });
            if (session.payment_status && session.payment_status !== "paid") {
              return Response.json({ received: true, pending: true });
            }
            await recordPaidCheckout(session);
          } else if (event.type === "checkout.session.async_payment_failed") {
            const session = event.data?.object;
            if (session?.id) await markCheckoutFailed(session);
          } else if (event.type === "charge.refunded") {
            const charge = event.data?.object;
            if (charge?.payment_intent) await revokeRefundedOrder(charge.payment_intent);
          }
        } catch (cause) {
          console.error(`Stripe webhook ${event.id || "unknown"} failed:`, cause instanceof Error ? cause.message : cause);
          return new Response("Webhook processing failed", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});

async function recordPaidCheckout(session: CheckoutSession) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let userId = session.client_reference_id || null;
  const email = session.customer_details?.email || session.customer_email || null;

  if (!userId && email) {
    const { data: profile } = await supabaseAdmin.from("customer_profiles").select("user_id").ilike("email", email).maybeSingle();
    userId = profile?.user_id ?? null;
  }

  let programId = session.metadata?.program_id || null;
  if (!programId && session.metadata?.program_slug) {
    const { data: program, error } = await supabaseAdmin.from("programs").select("id").eq("slug", session.metadata.program_slug).single();
    if (error) throw new Error(`Program lookup failed: ${error.message}`);
    programId = program.id;
  }
  if (!programId) throw new Error("Checkout Session metadata must include program_id or program_slug.");

  const { data: order, error: orderError } = await supabaseAdmin.from("orders").upsert({
    user_id: userId,
    program_id: programId,
    customer_email: email,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    amount_total: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    status: "paid",
    purchased_at: new Date().toISOString(),
  }, { onConflict: "stripe_checkout_session_id" }).select("id").single();
  if (orderError) throw new Error(`Order write failed: ${orderError.message}`);

  if (!userId) return;
  const { error: accessError } = await supabaseAdmin.from("entitlements").upsert({
    user_id: userId,
    program_id: programId,
    order_id: order.id,
    source: "stripe",
    active: true,
    revoked_at: null,
  }, { onConflict: "user_id,program_id" });
  if (accessError) throw new Error(`Entitlement write failed: ${accessError.message}`);
}

async function markCheckoutFailed(session: CheckoutSession) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("orders").upsert({
    stripe_checkout_session_id: session.id,
    user_id: session.client_reference_id || null,
    customer_email: session.customer_details?.email || session.customer_email || null,
    amount_total: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    status: "failed",
  }, { onConflict: "stripe_checkout_session_id" });
  if (error) throw new Error(error.message);
}

async function revokeRefundedOrder(paymentIntentId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: order, error } = await supabaseAdmin.from("orders").update({ status: "refunded" }).eq("stripe_payment_intent_id", paymentIntentId).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) return;
  const { error: revokeError } = await supabaseAdmin.from("entitlements").update({ active: false, revoked_at: new Date().toISOString() }).eq("order_id", order.id);
  if (revokeError) throw new Error(revokeError.message);
}

async function verifyStripeSignature(header: string, payload: string, secret: string) {
  const entries = header.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = Number(entries.find(([key]) => key === "t")?.[1]);
  const signatures = entries.filter(([key]) => key === "v1").map(([, value]) => value).filter(Boolean) as string[];
  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`)));
  const expected = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return signatures.some((signature) => timingSafeEqual(expected, signature));
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}
