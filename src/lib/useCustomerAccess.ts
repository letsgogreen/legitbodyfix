import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCustomerAccess } from "@/lib/customer-access";

export function useCustomerAccess(programId: string) {
  const [state, setState] = useState({ programId, loading: true, owned: false, error: false });
  useEffect(() => {
    let active = true;
    let revision = 0;
    async function refresh() {
      const request = ++revision;
      setState({ programId, loading: true, owned: false, error: false });
      try {
        const result = await getCustomerAccess();
        if (active && request === revision) setState({ programId, loading: false, owned: result.programIds.includes(programId), error: false });
      } catch {
        if (active && request === revision) setState({ programId, loading: false, owned: false, error: true });
      }
    }
    void refresh();
    const { data } = supabase.auth.onAuthStateChange(() => { queueMicrotask(() => { if (active) void refresh(); }); });
    window.addEventListener("focus", refresh);
    return () => { active = false; revision++; data.subscription.unsubscribe(); window.removeEventListener("focus", refresh); };
  }, [programId]);
  return state.programId === programId ? state : { programId, loading: true, owned: false, error: false };
}
