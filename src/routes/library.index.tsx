import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Program = Database["public"]["Tables"]["programs"]["Row"];

export const Route = createFileRoute("/library/")({ component: LibraryIndex });

function LibraryIndex() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: access, error: accessError } = await supabase.from("entitlements").select("program_id").eq("active", true);
      if (accessError) { setError(accessError.message); setLoading(false); return; }
      const ids = (access ?? []).map((item) => item.program_id);
      if (!ids.length) { setLoading(false); return; }
      const { data, error: programError } = await supabase.from("programs").select("*").in("id", ids).order("name");
      if (programError) setError(programError.message); else setPrograms(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">My programs</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-6xl">Continue where you left off.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Every program you own appears here. Choose one to view its modules and secure video lessons.</p>
      {loading && <div className="mt-12 flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading your programs…</div>}
      {error && <p className="mt-10 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
      {!loading && !error && !programs.length && <section className="mt-12 border border-border bg-card p-7"><h2 className="text-2xl font-extrabold">No programs yet</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Purchases linked to this email will appear here automatically. If you recently purchased, contact support with your receipt.</p><Link to="/" hash="programs" className="mt-5 inline-flex items-center gap-2 text-sm font-bold">Browse programs <ArrowRight className="h-4 w-4" /></Link></section>}
      <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">{programs.map((program) => <Link key={program.id} to="/library/$programSlug" params={{ programSlug: program.slug }} className="group bg-card p-6 transition-colors hover:bg-secondary"><div className="aspect-[16/9] overflow-hidden bg-secondary">{program.image_url ? <img src={program.image_url} alt={program.image_alt ?? ""} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : <div className="grid h-full place-items-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">LegitBodyFix program</div>}</div><p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{program.duration_label || program.format || "On-demand program"}</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight">{program.name}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{program.outcome}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Open program <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>)}</div>
    </main>
  );
}
