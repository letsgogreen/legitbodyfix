import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Search, X } from "lucide-react";
import { AdminLoadingState, Btn, PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import { CustomerAccessTabs } from "@/components/admin/CustomerAccessTabs";
import type { Database } from "@/integrations/supabase/types";
import { getAdminCustomerAccessData, grantAdminCustomerAccessByEmail, setAdminCustomerAccess } from "@/lib/admin-customers.functions";

type Profile = Database["public"]["Tables"]["customer_profiles"]["Row"];
type Entitlement = Database["public"]["Tables"]["entitlements"]["Row"];
type Program = Database["public"]["Tables"]["programs"]["Row"];
type Account = { userId: string; emailConfirmedAt: string | null; lastSignInAt: string | null; createdAt: string };
type CustomerFilter = "all" | "access" | "none" | "unconfirmed";
type CustomerSort = "newest" | "name" | "access" | "recent";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — LegitBodyFix Admin" }, { name: "robots", content: "noindex" }] }),
  component: CustomersView,
});

function CustomersView() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [sort, setSort] = useState<CustomerSort>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCustomerAccessData();
      setProfiles(data.profiles);
      setEntitlements(data.entitlements);
      setPrograms(data.programs);
      setAccounts(data.accounts);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const items = profiles.filter((profile) => {
      const owned = entitlements.filter((item) => item.user_id === profile.user_id && item.active).length;
      const account = accounts.find((item) => item.userId === profile.user_id);
      const matchesQuery = !needle || `${profile.display_name ?? ""} ${profile.email ?? ""}`.toLowerCase().includes(needle);
      const matchesFilter = filter === "all" || (filter === "access" && owned > 0) || (filter === "none" && owned === 0) || (filter === "unconfirmed" && !account?.emailConfirmedAt);
      return matchesQuery && matchesFilter;
    });
    return [...items].sort((a, b) => {
      if (sort === "name") return (a.display_name || a.email || "").localeCompare(b.display_name || b.email || "");
      if (sort === "access") return entitlements.filter((item) => item.user_id === b.user_id && item.active).length - entitlements.filter((item) => item.user_id === a.user_id && item.active).length;
      if (sort === "recent") return Date.parse(accounts.find((item) => item.userId === b.user_id)?.lastSignInAt || "0") - Date.parse(accounts.find((item) => item.userId === a.user_id)?.lastSignInAt || "0");
      return Date.parse(b.created_at) - Date.parse(a.created_at);
    });
  }, [accounts, entitlements, filter, profiles, query, sort]);

  const customersWithAccess = new Set(entitlements.filter((item) => item.active).map((item) => item.user_id)).size;
  const unconfirmed = profiles.filter((profile) => !accounts.find((account) => account.userId === profile.user_id)?.emailConfirmedAt).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead title="Customers & access" meta={loading ? "Loading account totals" : `${profiles.length} real accounts · ${entitlements.filter((item) => item.active).length} active program grants`} />
      <CustomerAccessTabs current="customers" />
      {error && <div className="mt-5 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
      {!loading && !error && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total customers" value={profiles.length} />
        <Metric label="Customers with access" value={customersWithAccess} />
        <Metric label="Without access" value={profiles.length - customersWithAccess} />
        <Metric label="Email unconfirmed" value={unconfirmed} warning={unconfirmed > 0} />
      </div>}
      <DirectAccessGrant programs={programs} disabled={loading || Boolean(error)} onChanged={load} />
      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input disabled={loading || Boolean(error)} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm disabled:cursor-wait disabled:opacity-50" /></div><select aria-label="Filter customers" value={filter} onChange={(event) => setFilter(event.target.value as CustomerFilter)} className="rounded-sm border border-border bg-card px-3 py-2 text-sm"><option value="all">All customers</option><option value="access">Has access</option><option value="none">No access</option><option value="unconfirmed">Email unconfirmed</option></select><select aria-label="Sort customers" value={sort} onChange={(event) => setSort(event.target.value as CustomerSort)} className="rounded-sm border border-border bg-card px-3 py-2 text-sm"><option value="newest">Newest first</option><option value="recent">Recent sign-in</option><option value="name">Name A–Z</option><option value="access">Most programs</option></select></div>
      {loading ? <div className="mt-4"><AdminLoadingState variant="list" label="Loading customers" /></div> : <Panel className="mt-4 overflow-x-auto">
        {(
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr><Th>Customer</Th><Th>Joined</Th><Th>Last sign-in</Th><Th>Programs</Th><Th>Status</Th><Th /></tr></thead>
            <tbody>
              {filtered.map((profile) => {
                const owned = entitlements.filter((item) => item.user_id === profile.user_id && item.active);
                const account = accounts.find((item) => item.userId === profile.user_id);
                return <tr key={profile.user_id} className="hover:bg-secondary/50"><Td><p className="font-medium">{profile.display_name || "Unnamed customer"}</p><p className="text-xs text-muted-foreground">{profile.email || "No email"}</p></Td><Td className="font-mono text-xs text-muted-foreground">{formatDate(profile.created_at)}</Td><Td className="font-mono text-xs text-muted-foreground">{account?.lastSignInAt ? formatDate(account.lastSignInAt) : "Never"}</Td><Td>{owned.length}</Td><Td><div className="flex flex-wrap gap-1.5"><Tag tone={owned.length ? "accent" : "muted"}>{owned.length ? "Has access" : "No access"}</Tag>{!account?.emailConfirmedAt && <Tag tone="muted">Unconfirmed</Tag>}</div></Td><Td className="text-right"><Btn onClick={() => setSelected(profile)}>Manage</Btn></Td></tr>;
              })}
              {!filtered.length && <tr><Td colSpan={6} className="py-12 text-center text-muted-foreground">No matching customers.</Td></tr>}
            </tbody>
          </table>
        )}
      </Panel>}
      {selected && <AccessDrawer profile={selected} account={accounts.find((item) => item.userId === selected.user_id)} programs={programs} entitlements={entitlements.filter((item) => item.user_id === selected.user_id)} onClose={() => setSelected(null)} onChanged={load} />}
    </div>
  );
}

function DirectAccessGrant({ programs, disabled, onChanged }: { programs: Program[]; disabled: boolean; onChanged: () => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [programId, setProgramId] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const grant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWorking(true);
    setMessage(null);
    try {
      await grantAdminCustomerAccessByEmail({ data: { email, programId } });
      const program = programs.find((item) => item.id === programId);
      setMessage({ tone: "success", text: `Access granted to ${email.trim().toLowerCase()} for ${program?.name ?? "the selected program"}.` });
      await onChanged();
    } catch (cause) {
      setMessage({ tone: "error", text: cause instanceof Error ? cause.message : String(cause) });
    }
    setWorking(false);
  };

  return <Panel className="mt-5 p-5"><div className="max-w-3xl"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Quick access grant</p><h2 className="mt-1 text-lg font-extrabold">Grant a program by email</h2><p className="mt-1 text-sm text-muted-foreground">Enter the email used for the customer account, then choose one program.</p><form onSubmit={(event) => void grant(event)} className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"><label className="grid gap-1.5 text-xs font-bold">Customer email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="customer@example.com" disabled={disabled || working} className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm font-normal" /></label><label className="grid gap-1.5 text-xs font-bold">Program<select required value={programId} onChange={(event) => setProgramId(event.target.value)} disabled={disabled || working} className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm font-normal"><option value="">Select a program</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></label><Btn variant="ink" type="submit" disabled={disabled || working || !email.trim() || !programId} className="self-end">{working ? "Granting…" : "Grant access"}</Btn></form>{message && <p role="status" className={`mt-3 border px-3 py-2 text-sm ${message.tone === "success" ? "border-lime-400 bg-lime-50 text-ink" : "border-destructive/40 bg-destructive/5 text-destructive"}`}>{message.text}</p>}</div></Panel>;
}

function Metric({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return <Panel className="p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className={`mt-2 text-3xl font-black ${warning ? "text-destructive" : "text-foreground"}`}>{value}</p></Panel>;
}
function AccessDrawer({ profile, account, programs, entitlements, onClose, onChanged }: { profile: Profile; account?: Account; programs: Program[]; entitlements: Entitlement[]; onClose: () => void; onChanged: () => Promise<void> }) {
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const setAccess = async (program: Program, active: boolean) => {
    setWorking(program.id);
    setError(null);
    try {
      await setAdminCustomerAccess({ data: { userId: profile.user_id, programId: program.id, active } });
      await onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
    setWorking(null);
  };

  const copyEmail = async () => {
    if (!profile.email) return;
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true"><div className="flex h-full w-full max-w-lg flex-col border-l border-border bg-background"><div className="flex items-start justify-between border-b border-border px-5 py-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Customer access</p><h2 className="mt-1 text-lg font-extrabold">{profile.display_name || profile.email || "Customer"}</h2><button type="button" onClick={() => void copyEmail()} className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" disabled={!profile.email}>{profile.email}{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}</button></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-sm border border-border p-1.5"><X className="h-4 w-4" /></button></div><div className="flex-1 overflow-y-auto p-5"><div className="mb-5 grid grid-cols-2 gap-px border border-border bg-border text-xs"><AccountFact label="Email" value={account?.emailConfirmedAt ? "Confirmed" : "Unconfirmed"} /><AccountFact label="Joined" value={formatDate(profile.created_at)} /><AccountFact label="Last sign-in" value={account?.lastSignInAt ? formatDate(account.lastSignInAt) : "Never"} /><AccountFact label="Active programs" value={String(entitlements.filter((item) => item.active).length)} /></div><div className="space-y-3">{programs.map((program) => { const access = entitlements.find((item) => item.program_id === program.id); const active = access?.active === true; return <div key={program.id} className="flex items-center justify-between gap-3 border border-border bg-card p-4"><div><p className="text-sm font-bold">{program.name}</p><p className="mt-1 font-mono text-[10px] text-muted-foreground">{access ? `${access.source} · ${active ? "active" : "revoked"}${access.granted_at ? ` · ${formatDate(access.granted_at)}` : ""}` : "no access"}</p></div><Btn variant={active ? "ghost" : "ink"} disabled={working === program.id} onClick={() => void setAccess(program, !active)}>{working === program.id ? "Saving…" : active ? "Revoke" : "Grant"}</Btn></div>; })}{error && <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}</div></div></div></div>;
}

function AccountFact({ label, value }: { label: string; value: string }) {
  return <div className="bg-card p-3"><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}
