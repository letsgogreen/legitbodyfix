import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, RefreshCw } from "lucide-react";
import { AdminLoadingState, Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
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

function isVerificationEvent(view: View) {
  return view.path === "/analytics-verification" || view.utm_source === "codex-verification" || view.utm_campaign?.startsWith("analytics-check-");
}

function localDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function change(current: number, previous: number) {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function AnalyticsPage() {
  const [range, setRange] = useState<Range>(30);
  const [rawViews, setRawViews] = useState<View[]>([]);
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const since = new Date(Date.now() - range * 2 * 86_400_000).toISOString();
    const { data, error: queryError } = await supabase
      .from("page_views")
      .select("id,created_at,session_id,path,referrer_host,utm_source,utm_medium,utm_campaign,device_type")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);
    if (queryError) setError(queryError.message);
    else setRawViews(data || []);
    setLoading(false);
  }, [range]);

  useEffect(() => { void load(); }, [load]);

  const report = useMemo(() => {
    const now = Date.now();
    const boundary = now - range * 86_400_000;
    const cleaned = showVerification ? rawViews : rawViews.filter((view) => !isVerificationEvent(view));
    const views = cleaned.filter((view) => new Date(view.created_at).getTime() >= boundary);
    const previous = cleaned.filter((view) => {
      const time = new Date(view.created_at).getTime();
      return time < boundary;
    });
    const sessionCount = (rows: View[]) => new Set(rows.map((view) => view.session_id)).size;
    const acquiredCount = (rows: View[]) => new Set(rows.filter((view) => view.referrer_host || view.utm_source).map((view) => view.session_id)).size;
    const sessions = sessionCount(views);
    const previousSessions = sessionCount(previous);
    const acquired = acquiredCount(views);
    const previousAcquired = acquiredCount(previous);
    const pagesPerSession = sessions ? views.length / sessions : 0;
    const previousPagesPerSession = previousSessions ? previous.length / previousSessions : 0;
    const acquisitionRate = sessions ? acquired / sessions * 100 : 0;
    const previousAcquisitionRate = previousSessions ? previousAcquired / previousSessions * 100 : 0;
    const daily = Array.from({ length: range }, (_, index) => {
      const date = new Date(now - (range - index - 1) * 86_400_000);
      const key = localDateKey(date);
      return [key, views.filter((view) => localDateKey(view.created_at) === key).length] as const;
    });
    const hourly = Array.from({ length: 24 }, (_, hour) => [hour, views.filter((view) => new Date(view.created_at).getHours() === hour).length] as const);
    return {
      views,
      previous,
      sessions,
      acquired,
      pagesPerSession,
      acquisitionRate,
      excluded: rawViews.filter(isVerificationEvent).length,
      pages: countBy(views, (view) => view.path),
      sources: countBy(views, (view) => view.utm_source || view.referrer_host || "Direct"),
      campaigns: countBy(views, (view) => view.utm_campaign),
      devices: countBy(views, (view) => view.device_type),
      daily,
      hourly,
      changes: {
        views: change(views.length, previous.length),
        sessions: change(sessions, previousSessions),
        depth: change(pagesPerSession, previousPagesPerSession),
        acquisition: change(acquisitionRate, previousAcquisitionRate),
      },
    };
  }, [rawViews, range, showVerification]);

  const latestView = report.views[0]?.created_at;
  const collectionActive = latestView ? Date.now() - new Date(latestView).getTime() < 86_400_000 : false;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const bestHour = report.hourly.reduce((best, item) => item[1] > best[1] ? item : best, report.hourly[0]);
  const topPage = report.pages[0];
  const statCards = [
    { label: "Page views", value: report.views.length.toLocaleString(), note: `Last ${range} days`, delta: report.changes.views },
    { label: "Sessions", value: report.sessions.toLocaleString(), note: "Approximate visits", delta: report.changes.sessions },
    { label: "Pages / session", value: report.sessions ? report.pagesPerSession.toFixed(1) : "—", note: "Browsing depth", delta: report.changes.depth },
    { label: "Acquired visits", value: report.sessions ? `${Math.round(report.acquisitionRate)}%` : "—", note: "Referrer or UTM found", delta: report.changes.acquisition },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <PageHead title="Website analytics" meta="Understand traffic, acquisition, and content demand" actions={<Btn onClick={() => void load()} disabled={loading}><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</Btn>} />

      <div className="mt-5 flex flex-col gap-3 border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="Date range">
          {([7, 30, 90] as Range[]).map((days) => <button key={days} onClick={() => setRange(days)} className={`min-h-10 border px-4 font-mono text-xs font-bold uppercase tracking-wider ${range === days ? "border-ink bg-ink text-ink-foreground" : "border-border bg-background"}`}>{days} days</button>)}
        </div>
        {report.excluded > 0 && <label className="flex min-h-10 items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={showVerification} onChange={(event) => setShowVerification(event.target.checked)} className="h-4 w-4 accent-lime" />Show {report.excluded} verification {report.excluded === 1 ? "event" : "events"}</label>}
      </div>

      {error && <div className="mt-5 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">Could not load analytics: {error}</div>}
      {loading && !rawViews.length ? <div className="mt-5"><AdminLoadingState /></div> : <>
        <section className={`mt-4 flex flex-col gap-3 border px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${collectionActive ? "border-accent/70 bg-accent/10" : "border-border bg-card"}`}>
          <div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${collectionActive ? "bg-accent" : "bg-muted-foreground"}`} /><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Collection health</p><p className="mt-1 text-sm font-bold">{collectionActive ? "Receiving page views" : latestView ? "No page views in the last 24 hours" : "Waiting for the first real visit"}</p></div></div>
          <p className="text-xs text-muted-foreground">Latest real event: <strong className="text-foreground">{latestView ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(latestView)) : "None"}</strong></p>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => <Panel key={stat.label} className="p-5"><div className="flex items-start justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p><Delta value={stat.delta} /></div><p className="mt-3 text-4xl font-extrabold tracking-tight">{stat.value}</p><p className="mt-1 text-xs text-muted-foreground">{stat.note}</p></Panel>)}
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,.7fr)]">
          <Panel className="p-5">
            <div className="flex items-baseline justify-between"><h2 className="text-lg font-extrabold">Traffic trend</h2><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Daily views</span></div>
            <TrendLine rows={report.daily} />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground"><span>{report.daily[0]?.[0]}</span><span>{report.daily.at(-1)?.[0]}</span></div>
          </Panel>
          <Panel className="bg-ink p-6 text-ink-foreground">
            <p className="font-mono text-[10px] uppercase tracking-[.16em] text-ink-foreground/55">Quick read</p>
            <h2 className="mt-4 text-2xl font-extrabold">{report.views.length ? "Where attention is going" : "Waiting for real traffic"}</h2>
            <div className="mt-7 space-y-6 text-sm">
              <div><p className="text-ink-foreground/55">Most viewed</p><p className="mt-1 font-bold">{topPage ? `${topPage[0] === "/" ? "Homepage" : topPage[0]} · ${topPage[1]} views` : "No page data yet"}</p></div>
              <div><p className="text-ink-foreground/55">Most active hour</p><p className="mt-1 font-bold">{bestHour?.[1] ? `${String(bestHour[0]).padStart(2, "0")}:00–${String((bestHour[0] + 1) % 24).padStart(2, "0")}:00 · ${bestHour[1]} views` : "No hourly pattern yet"}</p></div>
              <div><p className="text-ink-foreground/55">Acquisition</p><p className="mt-1 font-bold">{report.sessions ? `${report.acquired} of ${report.sessions} sessions identified` : "No sessions yet"}</p></div>
            </div>
          </Panel>
        </section>

        <Panel className="mt-4 p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><h2 className="text-lg font-extrabold">Visits by hour</h2><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Local time · {timeZone}</span></div>
          <HourlyActivity rows={report.hourly} />
          <div className="mt-2 grid grid-cols-4 font-mono text-[10px] text-muted-foreground"><span>00:00</span><span className="text-center">06:00</span><span className="text-center">12:00</span><span className="text-right">18:00</span></div>
        </Panel>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <RankPanel title="Top pages" rows={report.pages} empty="Page activity will appear after visitors browse the site." formatLabel={(label) => label === "/" ? "Homepage" : label} />
          <RankPanel title="Traffic sources" rows={report.sources} empty="Direct and referred traffic will appear here." />
          <RankPanel title="Campaigns" rows={report.campaigns} empty="Add UTM campaign tags to marketing links to measure them here." />
          <RankPanel title="Device mix" rows={report.devices} empty="Device data will appear after the first visit." />
        </div>

        <Panel className="mt-4 overflow-hidden">
          <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between"><h2 className="text-lg font-extrabold">Recent visits</h2><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Newest first · {timeZone}</span></div>
          <div className="divide-y divide-border">{report.views.slice(0, 15).map((view) => <div key={view.id} className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5"><div className="min-w-0"><p className="truncate font-bold">{view.path === "/" ? "Homepage" : view.path}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{view.utm_source || view.referrer_host || "Direct"}{view.utm_campaign ? ` · ${view.utm_campaign}` : ""}</p></div><Tag tone="muted">{view.device_type}</Tag><time dateTime={view.created_at} className="font-mono text-[11px] text-muted-foreground sm:text-right">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(view.created_at))}</time></div>)}{!report.views.length && <p className="px-5 py-12 text-center text-sm text-muted-foreground">Real visitor activity will appear here.</p>}</div>
        </Panel>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Privacy note: analytics stores a random per-tab session ID, page path, device category, referrer domain, and UTM tags. It does not store IP addresses, names, email addresses, precise location, or full referrer URLs. Administrator pages and automated browser checks are excluded.</p>
      </>}
    </div>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[10px] text-muted-foreground">New</span>;
  const positive = value > 0;
  const negative = value < 0;
  return <span className={`inline-flex items-center text-[10px] font-bold ${positive ? "text-emerald-700" : negative ? "text-destructive" : "text-muted-foreground"}`}>{positive ? <ArrowUpRight className="h-3 w-3" /> : negative ? <ArrowDownRight className="h-3 w-3" /> : null}{Math.abs(value)}%</span>;
}

function TrendLine({ rows }: { rows: readonly (readonly [string, number])[] }) {
  const width = 1000;
  const height = 210;
  const inset = 10;
  const max = Math.max(1, ...rows.map(([, count]) => count));
  const points = rows.map(([, count], index) => {
    const x = inset + index / Math.max(1, rows.length - 1) * (width - inset * 2);
    const y = height - inset - count / max * (height - inset * 2);
    return { x, y, count };
  });
  const line = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = points.length ? `${inset},${height - inset} ${line} ${width - inset},${height - inset}` : "";

  return <div className="mt-7 h-52 w-full" aria-label="Daily page view trend">
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img">
      {[0, 1, 2].map((lineIndex) => <line key={lineIndex} x1={inset} x2={width - inset} y1={inset + lineIndex * (height - inset * 2) / 2} y2={inset + lineIndex * (height - inset * 2) / 2} className="stroke-border" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
      <polygon points={area} className="fill-secondary/60" />
      <polyline points={line} fill="none" className="stroke-ink" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      {points.filter((point) => point.count > 0).map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4" className="fill-accent stroke-ink" strokeWidth="2" vectorEffect="non-scaling-stroke"><title>{point.count} views</title></circle>)}
    </svg>
  </div>;
}

function HourlyActivity({ rows }: { rows: readonly (readonly [number, number])[] }) {
  const max = Math.max(1, ...rows.map(([, count]) => count));
  return <div className="mt-7 grid grid-cols-12 gap-2 sm:grid-cols-24" aria-label="Page views by local hour">
    {rows.map(([hour, count]) => <div key={hour} title={`${String(hour).padStart(2, "0")}:00–${String((hour + 1) % 24).padStart(2, "0")}:00 · ${count} views`} className="group flex flex-col items-center gap-2">
      <span className={`aspect-square w-full border transition-colors group-hover:border-accent ${count ? "border-ink" : "border-border bg-secondary/30"}`} style={count ? { backgroundColor: `rgb(15 15 14 / ${0.18 + count / max * 0.82})` } : undefined} />
      <span className="font-mono text-[9px] text-muted-foreground sm:hidden">{String(hour).padStart(2, "0")}</span>
    </div>)}
  </div>;
}

function RankPanel({ title, rows, empty, formatLabel = (label) => label }: { title: string; rows: [string, number][]; empty: string; formatLabel?: (label: string) => string }) {
  const max = rows[0]?.[1] || 1;
  const total = rows.reduce((sum, [, value]) => sum + value, 0);
  return <Panel className="p-5"><div className="flex items-baseline justify-between"><h2 className="text-lg font-extrabold">{title}</h2><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Share</span></div><div className="mt-5 space-y-5">{rows.slice(0, 8).map(([label, value]) => <div key={label}><div className="mb-1.5 flex items-center justify-between gap-4 text-sm"><span className="truncate font-medium">{formatLabel(label)}</span><span className="shrink-0 font-mono text-xs text-muted-foreground">{value.toLocaleString()} · {total ? Math.round(value / total * 100) : 0}%</span></div><div className="h-2 bg-secondary"><div className="h-full bg-ink" style={{ width: `${value / max * 100}%` }} /></div></div>)}{!rows.length && <p className="py-10 text-sm text-muted-foreground">{empty}</p>}</div></Panel>;
}
