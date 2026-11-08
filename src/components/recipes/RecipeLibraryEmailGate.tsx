import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function RecipeLibraryEmailGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const { data } = await supabase.auth.getUser();
        if (active) setUnlocked(Boolean(data.user?.email && data.user.email_confirmed_at));
      } catch {
        if (active) setUnlocked(false);
      } finally {
        if (active) setReady(true);
      }
    }

    void checkAccess();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (active && event === "SIGNED_OUT") setUnlocked(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (ready && !unlocked) window.location.replace("/library-access?next=/recipes");
  }, [ready, unlocked]);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  return (
    <main className="mx-auto min-h-[calc(100vh-10rem)] max-w-7xl px-5 py-16 text-sm text-muted-foreground lg:px-8">
      Opening access…
    </main>
  );
}
