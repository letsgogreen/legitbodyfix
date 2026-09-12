import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { AdminLoadingState, Btn, PageHead, Panel } from "@/components/admin/AdminUI";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type View = Database["public"]["Tables"]["page_views"]["Row"];
type Range = 7 | 30 | 90;

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — LegitBodyFix Admin" }, { name: "robots", content: "noindex" }] }),
  component: AnalyticsPage,
});

function countBy(rows: View[], value: (row: View) => string | null) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const key = value(row);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function AnalyticsPage() {
  const [range, setRange] = useState<Range>(30);
  const [views, setViews] = useState<View[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const since = new Date(Date.now() - range * 86_400_000).toISOString();
    const { data, error: queryError } = await supabase
      .from("page_views")
      .select("id,created_at,session_id,path,referrer_host,utm_source,utm_medium,utm_campaign,device_type")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);
    if (queryError) setError(queryError.message);
    else setViews(data || []);
    setLoading(false);
  }, [range]);

  useEffect(() => { void load(); }, [load]);

  const report = useMemo(() => {
    const sessions = new Set(views.map((view) => view.session_id));
    const referred = new Set(views.filter((view) => view.referrer_host || view.utm_source).map((view) => view.session_id));
    const pages = countBy(views, (view) => view.path);
    const sources = countBy(views, (view) => view.utm_source || view.referrer_host || "Direct");
    const campaigns = countBy(views, (view) => view.utm_campaign);
    const devices = countBy(views, (view) => view.device_type);
    const daily = Array.from({ length: range }, (_, index) => {
      const date = new Date(Date.now() - (range - index - 1) * 86_400_000);
      const key = date.toISOString().slice(0, 10);
      return [key, views.filter((view) => view.created_at.slice(0, 10) === key).length] as const;
    });
    return { sessions, referred, pages, sources, campaigns, devices, daily };
  }, [views, range]);

  const maxDaily = Math.max(1, ...report.daily.map(([, count]) => count));
  const statCards = [
    ["Page views", views.length.toLocaleString(), `Last ${range} days`],
    ["Sessions", report.sessions.size.toLocaleString(), "Approximate browser visits"],
    ["Pages / session", report.sessions.size ? (views.length / report.sessions.size).toFixed(1) : "—", "Average depth"],
    ["Acquired visits", report.sessions.size ? `${Math.round(report.referred.size / report.sessions.size * 100)}%` : "—", "Referrer or UTM identified"],
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead title="Website analytics" meta="Traffic, acquisition, and content performance" actions={
        <Btn onClick={() => void load()} disabled={loading}><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</Btn>
      } />
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Date range">
        {([7, 30, 90] as Range[]).map((days) => <button key={days} onClick={() => setRange(days)} className={`border px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider ${range === days ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card"}`}>{days} days</button>)}
      </div>
      {error && <div className="mt-5 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">Could not load analytics: {error}</div>}
      {loading && !views.length ? <div className="mt-5"><AdminLoadingState /></div> : <>
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(([label, value, note]) => <Panel key={label} className="p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></Panel>)}
        </section>
        <Panel className="mt-4 p-5">
          <div className="flex items-baseline justify-between"><h2 className="text-lg font-extrabold">Traffic trend</h2><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Daily page views</span></div>
          <div className="mt-6 flex h-44 items-end gap-1" aria-label="Daily page view chart">
            {report.daily.map(([date, count]) => <div key={date} className="group relative flex min-w-0 flex-1 items-end" title={`${date}: ${count} views`}><div className="w-full bg-ink transition-colors group-hover:bg-accent" style={{ height: `${Math.max(count ? 6 : 1, count / maxDaily * 100)}%` }} /></div>)}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground"><span>{report.daily[0]?.[0]}</span><span>{report.daily.at(-1)?.[0]}</span></div>
        </Panel>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <RankPanel title="Top pages" rows={report.pages} empty="Page activity will appear after visitors browse the site." />
          <RankPanel title="Traffic sources" rows={report.sources} empty="Referrer domains and UTM sources will appear here." />
          <RankPanel title="Campaigns" rows={report.campaigns} empty="Add utm_campaign to campaign links to measure them here." />
          <RankPanel title="Device mix" rows={report.devices} empty="Device data will appear after the first visit." />
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Privacy note: analytics stores a random per-tab session ID, page path, device category, referrer domain, and UTM tags. It does not store IP addresses, names, email addresses, or full referrer URLs. Admin visits are excluded.</p>
      </>}
    </div>
  );
}

function RankPanel({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const max = rows[0]?.[1] || 1;
  return <Panel className="p-5"><h2 className="text-lg font-extrabold">{title}</h2><div className="mt-4 space-y-4">{rows.slice(0, 8).map(([label, value]) => <div key={label}><div className="mb-1.5 flex items-center justify-between gap-4 text-sm"><span className="truncate font-medium">{label}</span><span className="font-mono text-xs text-muted-foreground">{value.toLocaleString()}</span></div><div className="h-1.5 bg-secondary"><div className="h-full bg-ink" style={{ width: `${value / max * 100}%` }} /></div></div>)}{!rows.length && <p className="py-8 text-sm text-muted-foreground">{empty}</p>}</div></Panel>;
}
