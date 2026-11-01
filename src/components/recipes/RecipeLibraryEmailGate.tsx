import { useEffect, useState } from "react";

const unlockKey = "lbf_recipe_library_lead";

export function RecipeLibraryEmailGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnlocked(window.localStorage.getItem(unlockKey) === "1");
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !unlocked) window.location.replace("/notion-sample?next=/recipes");
  }, [ready, unlocked]);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  return <main className="mx-auto min-h-[calc(100vh-10rem)] max-w-7xl px-5 py-16 text-sm text-muted-foreground lg:px-8">Opening access…</main>;
}
