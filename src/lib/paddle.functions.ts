import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const API = { sandbox: "https://sandbox-api.paddle.com", production: "https://api.paddle.com" } as const;
type Environment = keyof typeof API;
const environment = (): Environment => process.env["PADDLE_ENVIRONMENT"]?.trim().toLowerCase() === "production" ? "production" : "sandbox";

const PADDLE_API_KEY_PATTERN = /^pdl_(live|sdbx)_apikey_[a-z\d]{26}_[a-zA-Z\d]{22}_[a-zA-Z\d]{3}$/;
type ProgramPriceRow = Pick<
  Database["public"]["Tables"]["programs"]["Row"],
  "id" | "name" | "paddle_product_id" | "paddle_price_id"
>;

function paddleApiKey() {
  const key = process.env["PADDLE_API_KEY"]
    ?.trim()
    .replace(/^Bearer\s+/i, "")
    .replace(/^(["'])(.*)\1$/, "$2")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (!key) throw new Error("Paddle is not configured: PADDLE_API_KEY is missing.");
  if (!PADDLE_API_KEY_PATTERN.test(key)) {
    throw new Error(`Paddle is not configured: PADDLE_API_KEY has an invalid format (${key.length} characters).`);
  }
  return key;
}

export const getPaddleClientConfig = createServerFn({ method: "GET" }).handler(async () => ({
  token: process.env["PADDLE_CLIENT_TOKEN"]?.trim() || null,
  environment: environment(),
}));

async function request(path: string, init: RequestInit = {}) {
  const key = paddleApiKey();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${API[environment()]}${path}`, {
    ...init,
    headers,
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
  .validator((input) => z.object({
    programId: z.string().uuid(),
    productId: z.string().trim().max(120).nullable().optional(),
    amount: z.number().positive().max(1_000_000),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const claims = context.claims as { email?: string; app_metadata?: { is_admin?: boolean } };
    const isAdmin = claims.app_metadata?.is_admin === true
      && claims.email?.trim().toLowerCase() === "thriveinside@protonmail.com";
    if (!isAdmin) throw new Error("Forbidden.");
    const { data: program, error } = await context.supabase.from("programs")
      .select("id,name,paddle_product_id,paddle_price_id").eq("id", data.programId).maybeSingle();
    if (error || !program) throw new Error(error?.message || "Program not found.");
    const programRow = program as ProgramPriceRow;
    let productId = data.productId || programRow.paddle_product_id;
    if (!productId) {
      const product = await request("/products", { method: "POST", body: JSON.stringify({
        name: programRow.name,
        description: "LegitBodyFix guided movement program",
        type: "standard",
        tax_category: "standard",
        custom_data: { legitbodyfix_program_id: programRow.id },
      }) });
      productId = (product.data as { id?: string } | undefined)?.id ?? null;
      if (!productId) throw new Error("Paddle did not return a product ID.");
    }
    const created = await request("/prices", { method: "POST", body: JSON.stringify({
      product_id: productId,
      description: `${programRow.name} — one-time`,
      type: "standard",
      unit_price: { amount: String(Math.round(data.amount * 100)), currency_code: data.currency },
      quantity: { minimum: 1, maximum: 1 },
    }) });
    const priceId = (created.data as { id?: string } | undefined)?.id;
    if (!priceId) throw new Error("Paddle did not return a price ID.");
    const { error: saveError } = await context.supabase.from("programs")
      .update({ paddle_product_id: productId, paddle_price_id: priceId }).eq("id", programRow.id);
    if (saveError) throw new Error(saveError.message);
    let previousArchived = false;
    if (programRow.paddle_price_id && programRow.paddle_price_id !== priceId) {
      try { await request(`/prices/${programRow.paddle_price_id}`, { method: "PATCH", body: JSON.stringify({ status: "archived" }) }); previousArchived = true; }
      catch (archiveError) { console.error("Previous Paddle price could not be archived:", archiveError); }
    }
    await context.supabase.from("program_price_changes").insert({
      program_id: programRow.id, paddle_product_id: productId,
      previous_price_id: programRow.paddle_price_id, new_price_id: priceId,
      amount_minor: Math.round(data.amount * 100), currency: data.currency,
      previous_archived: previousArchived, changed_by: context.userId,
      changed_by_email: claims.email ?? null,
    });
    return { productId, priceId, livePrice: (await fetchPaddlePrices([priceId]))[priceId] ?? null, previousArchived };
  });
