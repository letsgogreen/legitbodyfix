import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Program = Pick<Database["public"]["Tables"]["programs"]["Row"], "id" | "name" | "slug">;

export const Route = createFileRoute("/library/account")({
  head: () => ({ meta: [{ title: "Account & purchases — LegitBodyFix" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AccountPage,
});

function AccountPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [programs, setPrograms] = useState<Record<string, Program>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      setEmail(auth.user.email ?? "");
      const [{ data: profile }, { data: orderRows }] = await Promise.all([
        supabase.from("customer_profiles").select("display_name").eq("user_id", auth.user.id).maybeSingle(),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
      setName(profile?.display_name ?? "");
      setOrders(orderRows ?? []);
      const ids = [...new Set((orderRows ?? []).map((order) => order.program_id).filter((id): id is string => !!id))];
      if (ids.length) {
        const { data } = await supabase.from("programs").select("id,name,slug").in("id", ids);
        setPrograms(Object.fromEntries((data ?? []).map((program) => [program.id, program])));
      }
      setLoading(false);
    })();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const { data } = await supabase.auth.getUser();
    if (!data.user) { setSaving(false); return; }
    const { error } = await supabase.from("customer_profiles").update({ display_name: name.trim() || null }).eq("user_id", data.user.id);
    setMessage(error ? error.message : "Profile saved.");
    setSaving(false);
  }

  return <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Customer account</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-6xl">Account & purchases.</h1><div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><section className="border border-border bg-card p-6 sm:p-8"><h2 className="text-2xl font-extrabold">Profile</h2><form onSubmit={save} className="mt-6 grid gap-5"><Field label="Email"><input value={email} readOnly className="min-h-12 border border-border bg-secondary px-3 text-sm text-muted-foreground" /></Field><Field label="Display name"><input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} className="min-h-12 border border-border bg-background px-3 text-sm" /></Field><button disabled={saving} className="min-h-12 bg-ink px-5 text-sm font-bold text-ink-foreground disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button>{message && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4" />{message}</p>}</form></section><section><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Payment history</p><h2 className="mt-2 text-2xl font-extrabold">Your orders</h2></div><Link to="/library" className="inline-flex items-center gap-2 text-sm font-bold">My programs <ArrowRight className="h-4 w-4" /></Link></div>{loading ? <p className="mt-8 flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading purchases…</p> : orders.length ? <div className="mt-6 divide-y divide-border border-y border-border">{orders.map((order) => <article key={order.id} className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><h3 className="font-bold">{order.program_id ? programs[order.program_id]?.name ?? "Program purchase" : "Program purchase"}</h3><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatDate(order.purchased_at ?? order.created_at)} · {order.status}</p></div><p className="text-lg font-extrabold">{formatMoney(order.amount_total, order.currency)}</p></article>)}</div> : <div className="mt-6 border border-border bg-card p-6"><p className="text-sm text-muted-foreground">No purchases are linked to this account yet.</p></div>}</section></div></main>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">{label}{children}</label>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value)); }
function formatMoney(amount: number, currency: string) { return new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100); }
