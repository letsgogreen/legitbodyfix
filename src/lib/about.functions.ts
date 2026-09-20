import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { aboutCopyDefaults, type AboutCopy, type AboutCopyKey } from "@/data/about-copy";
import type { Database } from "@/integrations/supabase/types";

export const getAboutCopy = createServerFn({ method: "GET" }).handler(async (): Promise<AboutCopy> => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return { ...aboutCopyDefaults };

  const supabase = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("site_copy")
    .select("key,value")
    .like("key", "about_%")
    .abortSignal(AbortSignal.timeout(8000));
  if (error) return { ...aboutCopyDefaults };

  const copy = { ...aboutCopyDefaults } as AboutCopy;
  for (const item of data ?? []) {
    if (item.key in copy) copy[item.key as AboutCopyKey] = item.value;
  }
  return copy;
});

