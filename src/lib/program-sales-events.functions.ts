import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProgramSale = {
  programId: string;
  label: string;
  amountMinor: number;
  currency: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

function assertAdmin(claims: unknown) {
  const value = claims as { email?: string; app_metadata?: { is_admin?: boolean } };
  if (value.app_metadata?.is_admin !== true || value.email?.trim().toLowerCase() !== "thriveinside@protonmail.com") {
    throw new Error("Administrator access required.");
  }
}

export async function readProgramSales(client: unknown, programIds: string[], activeNowOnly = false): Promise<ProgramSale[]> {
  if (!programIds.length) return [];
  const db = client as { from: (table: string) => any };
  let query = db.from("program_sale_events").select("program_id,label,amount_minor,currency,starts_at,ends_at,active").in("program_id", programIds);
  if (activeNowOnly) {
    const now = new Date().toISOString();
    query = query.eq("active", true).lte("starts_at", now).gt("ends_at", now);
  }
  const { data, error } = await query;
  if (error) {
    if (/program_sale_events|schema cache|does not exist/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []).map((row: any) => ({ programId: row.program_id, label: row.label, amountMinor: row.amount_minor, currency: row.currency, startsAt: row.starts_at, endsAt: row.ends_at, active: row.active }));
}

export const getAdminProgramSale = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ programId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    return (await readProgramSales(context.supabase, [data.programId]))[0] ?? null;
  });

export const saveAdminProgramSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({
    programId: z.string().uuid(),
    label: z.string().trim().min(1).max(80),
    amount: z.number().positive().max(1_000_000),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    active: z.boolean(),
  }).refine((value) => new Date(value.endsAt) > new Date(value.startsAt), "Sale end must be after its start.").parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    const db = context.supabase as unknown as { from: (table: string) => any };
    const { error } = await db.from("program_sale_events").upsert({
      program_id: data.programId,
      label: data.label,
      amount_minor: Math.round(data.amount * 100),
      currency: data.currency,
      starts_at: data.startsAt,
      ends_at: data.endsAt,
      active: data.active,
      updated_at: new Date().toISOString(),
    }, { onConflict: "program_id" });
    if (error) throw new Error(error.message);
    return { saved: true };
  });

export const removeAdminProgramSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => z.object({ programId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    assertAdmin(context.claims);
    const db = context.supabase as unknown as { from: (table: string) => any };
    const { error } = await db.from("program_sale_events").delete().eq("program_id", data.programId);
    if (error) throw new Error(error.message);
    return { removed: true };
  });