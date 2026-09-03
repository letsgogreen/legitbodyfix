import { supabase } from "@/integrations/supabase/client";

// Navigation hint only: RLS and the playback server still enforce access.
export async function getCustomerAccess() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError && authError.name !== "AuthSessionMissingError") throw authError;
  if (!user) return { user: null, programIds: [] as string[] };
  const { data, error } = await supabase.from("entitlements")
    .select("program_id").eq("user_id", user.id).eq("active", true);
  if (error) throw error;
  return { user, programIds: (data ?? []).map((row) => row.program_id) };
}
