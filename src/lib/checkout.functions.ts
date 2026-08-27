import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const STRIPE_GATEWAY = "https://connector-gateway.lovable.dev/stripe";

function serverClient() {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function stripeHeaders(stripeKey: string, lovableKey?: string) {
  return {
    Authorization: `Bearer ${lovableKey || stripeKey}`,
    ...(lovableKey ? { "X-Connection-Api-Key": stripeKey } : {}),
  };
}

function stripeConfig() {
  const stripeKey = process.env["STRIPE_API_KEY"] ?? process.env["STRIPE_SANDBOX_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (!stripeKey) {
    throw new Error(
      "Stripe checkout is unavailable because STRIPE_API_KEY is missing from this deployment.",
    );
  }
  return { stripeKey, lovableKey, apiBase: lovableKey ? STRIPE_GATEWAY : "https://api.stripe.com" };
}

export const createProgramCheckout = createServerFn({ method: "POST" })
  .validator((input) =>
    z
      .object({ programSlug: z.string().regex(/^[a-z0-9-]+$/), returnOrigin: z.string().url() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const origin = allowedOrigin(data.returnOrigin);
    const { data: program, error } = await serverClient()
      .from("programs")
      .select("id,slug,stripe_price_id,stripe_price_lookup_key,published")
      .eq("slug", data.programSlug)
      .eq("published", true)
      .single();
    if (error || !program) throw new Error("This program is not currently available for purchase.");

    const { stripeKey, lovableKey, apiBase } = stripeConfig();

    let priceId = program.stripe_price_id;
    if (!priceId && program.stripe_price_lookup_key) {
      const params = new URLSearchParams({
        active: "true",
        limit: "1",
        "lookup_keys[]": program.stripe_price_lookup_key,
      });
      const response = await fetch(`${apiBase}/v1/prices?${params}`, {
        headers: stripeHeaders(stripeKey, lovableKey),
      });
      const payload = (await response.json()) as {
        data?: { id: string }[];
        error?: { message?: string };
      };
      if (!response.ok)
        throw new Error(payload.error?.message || "Could not resolve the Stripe price.");
      priceId = payload.data?.[0]?.id ?? null;
    }
    if (!priceId) throw new Error("This program does not have an active Stripe price.");

    const body = new URLSearchParams({
      mode: "payment",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "metadata[program_id]": program.id,
      "metadata[program_slug]": program.slug,
      customer_creation: "always",
      allow_promotion_codes: "true",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#programs`,
    });
    const response = await fetch(`${apiBase}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        ...stripeHeaders(stripeKey, lovableKey),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const payload = (await response.json()) as { url?: string; error?: { message?: string } };
    if (!response.ok)
      throw new Error(payload.error?.message || `Stripe request failed (${response.status}).`);
    if (!payload.url) throw new Error("Stripe did not return a Checkout URL.");
    return { url: payload.url };
  });

export const getCheckoutStatus = createServerFn({ method: "GET" })
  .validator((input) =>
    z.object({ sessionId: z.string().regex(/^cs_(?:test_|live_)[A-Za-z0-9]+$/) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { stripeKey, lovableKey, apiBase } = stripeConfig();
    const response = await fetch(
      `${apiBase}/v1/checkout/sessions/${encodeURIComponent(data.sessionId)}`,
      {
        headers: stripeHeaders(stripeKey, lovableKey),
      },
    );
    const payload = (await response.json()) as {
      payment_status?: "paid" | "unpaid" | "no_payment_required";
      status?: "open" | "complete" | "expired";
      metadata?: { program_slug?: string };
      error?: { message?: string };
    };
    if (!response.ok) throw new Error(payload.error?.message || "Could not verify this payment.");
    return {
      paid: payload.payment_status === "paid" || payload.payment_status === "no_payment_required",
      status: payload.status ?? "open",
      programSlug: payload.metadata?.program_slug ?? null,
    };
  });

function allowedOrigin(value: string) {
  const url = new URL(value);
  const allowed =
    url.protocol === "https:" &&
    (url.hostname === "legitbodyfix.com" ||
      url.hostname === "www.legitbodyfix.com" ||
      url.hostname === "move-system-landing.lovable.app");
  if (!allowed) throw new Error("Checkout is not available from this origin.");
  return url.origin;
}
