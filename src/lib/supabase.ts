import { supabase } from "@/integrations/supabase/client";

const url = import.meta.env["VITE_SUPABASE_URL"]?.trim();
const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim();

export const isSupabaseConfigured = Boolean(url && publishableKey);

export function getSupabaseClient() {
  if (!url || !publishableKey) return undefined;
  return supabase;
}
