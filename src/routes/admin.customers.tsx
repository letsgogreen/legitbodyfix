import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search, X } from "lucide-react";
import { Btn, PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["customer_profiles"]["Row"];
type Entitlement = Database["public"]["Tables"]["entitlements"]["Row"];
type Program = Database["public"]["Tables"]["programs"]["Row"];

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — LegitBodyFix Admin" }, { name: "robots", content: "noindex" }] }),
  component: CustomersView,
});

function CustomersView() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [profileResult, entitlementResult, programResult] = await Promise.all([
      supabase.from("customer_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("entitlements").select("*").order("granted_at", { ascending: false }),
      supabase.from("programs").select("*").order("name"),
    ]);
    const firstError = profileResult.error ?? entitlementResult.error ?? programResult.error;
    if (firstError) setError(firstError.message);
    else {
      setProfiles(profileResult.data ?? []);
      setEntitlements(entitlementResult.data ?? []);
      setPrograms(programResult.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return profiles;
    return profiles.filter((profile) => `${profile.display_name ?? ""} ${profile.email ?? ""}`.toLowerCase().includes(needle));
  }, [profiles, query]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead title="Customers" meta={`${profiles.length} real accounts · ${entitlements.filter((item) => item.active).length} active program grants`} />
      {error && <div className="mt-5 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
      <div className="relative mt-5 max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm" /></div>
      <Panel className="mt-4 overflow-x-auto">
        {loading ? <div className="flex min-h-44 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading customers…</div> : (
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr><Th>Customer</Th><Th>Joined</Th><Th>Programs</Th><Th>Status</Th><Th /></tr></thead>
            <tbody>
              {filtered.map((profile) => {
                const owned = entitlements.filter((item) => item.user_id === profile.user_id && item.active);
                return <tr key={profile.user_id} className="hover:bg-secondary/50"><Td><p className="font-medium">{profile.display_name || "Unnamed customer"}</p><p className="text-xs text-muted-foreground">{profile.email || "No email"}</p></Td><Td className="font-mono text-xs text-muted-foreground">{new Date(profile.created_at).toLocaleDateString()}</Td><Td>{owned.length}</Td><Td><Tag tone={owned.length ? "accent" : "muted"}>{owned.length ? "Has access" : "No purchases"}</Tag></Td><Td className="text-right"><Btn onClick={() => setSelected(profile)}>Manage access</Btn></Td></tr>;
              })}
              {!filtered.length && <tr><Td colSpan={5} className="py-12 text-center text-muted-foreground">No matching customers.</Td></tr>}
            </tbody>
          </table>
        )}
      </Panel>
      {selected && <AccessDrawer profile={selected} programs={programs} entitlements={entitlements.filter((item) => item.user_id === selected.user_id)} onClose={() => setSelected(null)} onChanged={load} />}
    </div>
  );
}

function AccessDrawer({ profile, programs, entitlements, onClose, onChanged }: { profile: Profile; programs: Program[]; entitlements: Entitlement[]; onClose: () => void; onChanged: () => Promise<void> }) {
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setAccess = async (program: Program, active: boolean) => {
    setWorking(program.id);
    setError(null);
    const current = entitlements.find((item) => item.program_id === program.id);
    const result = current
      ? await supabase.from("entitlements").update({ active, revoked_at: active ? null : new Date().toISOString(), source: current.source || "manual" }).eq("id", current.id)
      : await supabase.from("entitlements").insert({ user_id: profile.user_id, program_id: program.id, source: "manual", active: true });
    if (result.error) setError(result.error.message);
    else await onChanged();
    setWorking(null);
  };

  return <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true"><div className="flex h-full w-full max-w-lg flex-col border-l border-border bg-background"><div className="flex items-start justify-between border-b border-border px-5 py-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Customer access</p><h2 className="mt-1 text-lg font-extrabold">{profile.display_name || profile.email || "Customer"}</h2><p className="mt-1 text-xs text-muted-foreground">{profile.email}</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-sm border border-border p-1.5"><X className="h-4 w-4" /></button></div><div className="flex-1 space-y-3 overflow-y-auto p-5">{programs.map((program) => { const access = entitlements.find((item) => item.program_id === program.id); const active = access?.active === true; return <div key={program.id} className="flex items-center justify-between gap-3 border border-border bg-card p-4"><div><p className="text-sm font-bold">{program.name}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{access ? `${access.source} · ${active ? "active" : "revoked"}` : "no access"}</p></div><Btn variant={active ? "ghost" : "ink"} disabled={working === program.id} onClick={() => void setAccess(program, !active)}>{working === program.id ? "Saving…" : active ? "Revoke" : "Grant"}</Btn></div>; })}{error && <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}</div></div></div>;
}
