import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const API = { sandbox: "https://sandbox-api.paddle.com", production: "https://api.paddle.com" } as const;
type Environment = keyof typeof API;
const environment = (): Environment => process.env["PADDLE_ENVIRONMENT"] === "production" ? "production" : "sandbox";

export const getPaddleClientConfig = createServerFn({ method: "GET" }).handler(async () => ({
  token: process.env["PADDLE_CLIENT_TOKEN"] ?? null,
  environment: environment(),
}));

async function request(path: string, init: RequestInit = {}) {
  const key = process.env["PADDLE_API_KEY"];
  if (!key) throw new Error("Paddle is not configured: PADDLE_API_KEY is missing.");
  const response = await fetch(`${API[environment()]}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) as { data?: Record<string, unknown>; error?: { detail?: string } } : {};
  if (!response.ok) throw new Error(payload.error?.detail || `Paddle API error (${response.status}).`);
  return payload;
}

export async function fetchPaddlePrices(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  const result: Record<string, string> = {};
  await Promise.all(unique.map(async (id) => {
    try {
      const payload = await request(`/prices/${id}`);
      const data = payload.data as { unit_price?: { amount?: string; currency_code?: string } } | undefined;
      if (data?.unit_price?.amount && data.unit_price.currency_code) {
        result[id] = new Intl.NumberFormat("en-US", { style: "currency", currency: data.unit_price.currency_code })
          .format(Number(data.unit_price.amount) / 100);
      }
    } catch (error) { console.error(`Paddle price ${id} unavailable:`, error); }
  }));
  return result;
}

export const getProgramPrice = createServerFn({ method: "GET" })
  .validator((input) => z.object({ priceId: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => ({ price: (await fetchPaddlePrices([data.priceId]))[data.priceId] ?? null }));

export const updateProgramPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    programId: z.string().uuid(),
    amount: z.number().positive().max(1_000_000),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const claims = context.claims as Record<string, unknown>;
    if ((claims["app_metadata"] as Record<string, unknown> | undefined)?.["is_admin"] !== true) throw new Error("Forbidden.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: program, error } = await supabaseAdmin.from("programs")
      .select("id,name,paddle_product_id,paddle_price_id").eq("id", data.programId).maybeSingle();
    if (error || !program) throw new Error(error?.message || "Program not found.");
    if (!program.paddle_product_id) throw new Error("Add and save a Paddle product ID first.");
    const created = await request("/prices", { method: "POST", body: JSON.stringify({
      product_id: program.paddle_product_id,
      description: `${program.name} — one-time`,
      type: "standard",
      unit_price: { amount: String(Math.round(data.amount * 100)), currency_code: data.currency },
      quantity: { minimum: 1, maximum: 1 },
    }) });
    const priceId = (created.data as { id?: string } | undefined)?.id;
    if (!priceId) throw new Error("Paddle did not return a price ID.");
    const { error: saveError } = await supabaseAdmin.from("programs").update({ paddle_price_id: priceId }).eq("id", program.id);
    if (saveError) throw new Error(saveError.message);
    let previousArchived = false;
    if (program.paddle_price_id && program.paddle_price_id !== priceId) {
      try { await request(`/prices/${program.paddle_price_id}`, { method: "PATCH", body: JSON.stringify({ status: "archived" }) }); previousArchived = true; }
      catch (archiveError) { console.error("Previous Paddle price could not be archived:", archiveError); }
    }
    await supabaseAdmin.from("program_price_changes").insert({
      program_id: program.id, paddle_product_id: program.paddle_product_id,
      previous_price_id: program.paddle_price_id, new_price_id: priceId,
      amount_minor: Math.round(data.amount * 100), currency: data.currency,
      previous_archived: previousArchived, changed_by: context.userId,
      changed_by_email: (claims as { email?: string }).email ?? null,
    });
    return { priceId, livePrice: (await fetchPaddlePrices([priceId]))[priceId] ?? null, previousArchived };
  });
