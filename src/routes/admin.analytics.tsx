import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, RefreshCw } from "lucide-react";
import { AdminLoadingState, Btn, PageHead, Panel, Tag } from "@/components/admin/AdminUI";
import type { Database } from "@/integrations/supabase/types";
import { getAdminAnalytics } from "@/lib/admin-analytics.functions";

type View = Database["public"]["Tables"]["page_views"]["Row"];
type Range = 7 | 30 | 90;
type AcquisitionMode = "source" | "campaign";

type RecentSession = {
  sessionId: string;
  startedAt: string;
  lastSeenAt: string;
  entryPath: string;
  pageViews: number;
  deviceType: string;
  source: string;
  campaign: string | null;
  countryCode: string | null;
  regionCode: string | null;
  observedDurationSeconds: number | null;
};

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

function groupRecentSessions(views: View[]): RecentSession[] {
  const sessions = new Map<string, View[]>();
  views.forEach((view) => sessions.set(view.session_id, [...(sessions.get(view.session_id) || []), view]));

  return [...sessions.entries()].map(([sessionId, sessionViews]) => {
    const chronological = [...sessionViews].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const entry = chronological[0];
    const latest = chronological.at(-1) || entry;
    return {
      sessionId,
      startedAt: entry.created_at,
      lastSeenAt: latest.created_at,
      entryPath: entry.path,
      pageViews: sessionViews.length,
      deviceType: entry.device_type,
      source: entry.utm_source || entry.referrer_host || "Direct",
      campaign: entry.utm_campaign,
      countryCode: entry.country_code,
      regionCode: entry.region_code,
      observedDurationSeconds: sessionViews.length > 1 ? Math.max(0, (Date.parse(latest.created_at) - Date.parse(entry.created_at)) / 1000) : null,
    };
  }).sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
}

function AnalyticsPage() {
  const [range, setRange] = useState<Range>(30);
  const [rawViews, setRawViews] = useState<View[]>([]);
  const [showVerification, setShowVerification] = useState(false);
  const [acquisitionMode, setAcquisitionMode] = useState<AcquisitionMode>("source");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminAnalytics({ data: { range } });
      setRawViews(result.views);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
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
  const recentSessions = useMemo(() => groupRecentSessions(report.views), [report.views]);
  const measuredSessions = recentSessions.filter((session) => session.observedDurationSeconds !== null);
  const averageDuration = measuredSessions.length ? measuredSessions.reduce((sum, session) => sum + (session.observedDurationSeconds ?? 0), 0) / measuredSessions.length : null;
  const collectionActive = latestView ? Date.now() - new Date(latestView).getTime() < 86_400_000 : false;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const bestHour = report.hourly.reduce((best, item) => item[1] > best[1] ? item : best, report.hourly[0]);
  const topPage = report.pages[0];
  const statCards = [
    { label: "Avg. estimated duration", value: formatSessionDuration(averageDuration), note: measuredSessions.length + " of " + recentSessions.length + " sessions measurable", delta: undefined },
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

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map((stat) => <Panel key={stat.label} className="p-5"><div className="flex items-start justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p><Delta value={stat.delta} /></div><p className="mt-3 text-4xl font-extrabold tracking-tight">{stat.value}</p><p className="mt-1 text-xs text-muted-foreground">{stat.note}</p></Panel>)}
        </section>

        <Panel className="mt-4 bg-ink px-6 py-5 text-ink-foreground">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_repeat(3,1fr)] lg:items-center">
            <div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-ink-foreground/55">Quick read</p><h2 className="mt-2 text-xl font-extrabold">{report.views.length ? "What changed at a glance" : "Waiting for real traffic"}</h2></div>
            <div><p className="text-xs text-ink-foreground/55">Most viewed</p><p className="mt-1 text-sm font-bold">{topPage ? `${topPage[0] === "/" ? "Homepage" : topPage[0]} · ${topPage[1]} views` : "No page data yet"}</p></div>
            <div><p className="text-xs text-ink-foreground/55">Most active hour</p><p className="mt-1 text-sm font-bold">{bestHour?.[1] ? `${String(bestHour[0]).padStart(2, "0")}:00–${String((bestHour[0] + 1) % 24).padStart(2, "0")}:00 · ${bestHour[1]} views` : "No pattern yet"}</p></div>
            <div><p className="text-xs text-ink-foreground/55">Acquisition</p><p className="mt-1 text-sm font-bold">{report.sessions ? `${report.acquired} of ${report.sessions} sessions identified` : "No sessions yet"}</p></div>
          </div>
        </Panel>

        <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
          <div className="space-y-4">
            <Panel className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-extrabold">Acquisition trend</h2><p className="mt-1 text-xs text-muted-foreground">Compare how each source changes over time.</p></div><ModeToggle value={acquisitionMode} onChange={setAcquisitionMode} /></div>
              <AcquisitionTrend views={report.views} range={range} mode={acquisitionMode} />
              <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground"><span>{report.daily[0]?.[0]}</span><span>{report.daily.at(-1)?.[0]}</span></div>
            </Panel>
            <Panel className="p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><h2 className="text-lg font-extrabold">Visits by hour</h2><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Local time · {timeZone}</span></div>
              <HourlyLine rows={report.hourly} />
              <div className="mt-2 grid grid-cols-4 font-mono text-[10px] text-muted-foreground"><span>00:00</span><span className="text-center">06:00</span><span className="text-center">12:00</span><span className="text-right">18:00</span></div>
            </Panel>
          </div>
          <div className="space-y-4">
            <Panel className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-lg font-extrabold">{acquisitionMode === "source" ? "Traffic sources" : "Campaigns"}</h2><ModeToggle value={acquisitionMode} onChange={setAcquisitionMode} /></div><RankList rows={acquisitionMode === "source" ? report.sources : report.campaigns} empty={acquisitionMode === "source" ? "Direct and referred traffic will appear here." : "Add UTM campaign tags to marketing links to measure them here."} /></Panel>
            <DevicePanel rows={report.devices} />
          </div>
        </section>

        <div className="mt-4">
          <RankPanel title="Top pages" rows={report.pages} empty="Page activity will appear after visitors browse the site." formatLabel={(label) => label === "/" ? "Homepage" : label} />
        </div>

        <Panel className="mt-4 overflow-hidden">
          <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between"><div><h2 className="text-lg font-extrabold">Recent sessions</h2><p className="mt-1 text-xs text-muted-foreground">Each browser session appears once. Duration is estimated from its first to last page view within the selected period. Time on the final page and whether the tab was visible are unknown. Single-page sessions are not measurable and are excluded from the average.</p></div><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Newest first · {timeZone}</span></div>
          <div className="divide-y divide-border">{recentSessions.slice(0, 15).map((session) => <div key={session.sessionId} className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] sm:items-center sm:gap-5"><div className="min-w-0"><p className="truncate font-bold">{session.entryPath === "/" ? "Homepage" : session.entryPath}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{session.source}{session.campaign ? " · " + session.campaign : ""} · Entry page</p></div><span className="text-xs font-bold text-muted-foreground">{session.pageViews} {session.pageViews === 1 ? "page" : "pages"}</span><div className="text-xs text-muted-foreground"><p className="font-bold" title="Estimated time from first to last page view. Time on the final page is not measured.">{formatSessionDuration(session.observedDurationSeconds)}{session.observedDurationSeconds !== null ? " · estimated" : ""}</p><p className="mt-1">{formatLocation(session.countryCode, session.regionCode)}</p></div><Tag tone="muted">{session.deviceType}</Tag><time dateTime={session.lastSeenAt} title={"Started " + new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(session.startedAt))} className="font-mono text-[11px] text-muted-foreground sm:text-right">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(session.lastSeenAt))}</time></div>)}{!recentSessions.length && <p className="px-5 py-12 text-center text-sm text-muted-foreground">Real visitor activity will appear here.</p>}</div>
        </Panel>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Privacy note: analytics stores a random per-tab session ID, page path, device category, referrer domain, UTM tags, and coarse country/region codes. It does not store IP addresses, names, email addresses, city-level or precise location, or full referrer URLs. Administrator pages and automated browser checks are excluded.</p>
      </>}
    </div>
  );
}

const KOREA_REGIONS: Record<string, string> = {
  "11": "Seoul", "26": "Busan", "27": "Daegu", "28": "Incheon", "29": "Gwangju", "30": "Daejeon", "31": "Ulsan", "36": "Sejong",
  "41": "Gyeonggi", "42": "Gangwon", "43": "North Chungcheong", "44": "South Chungcheong", "45": "North Jeolla", "46": "South Jeolla", "47": "North Gyeongsang", "48": "South Gyeongsang", "49": "Jeju",
};

function formatLocation(countryCode: string | null, regionCode: string | null) {
  if (!countryCode) return "Location unknown";
  let country = countryCode;
  try { country = new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || countryCode; } catch { /* use the code */ }
  const region = countryCode === "KR" && regionCode ? KOREA_REGIONS[regionCode] || regionCode : regionCode;
  return region ? country + " · " + region : country;
}
function formatSessionDuration(seconds: number | null) {
  if (seconds === null) return "Not measurable";
  const total = Math.floor(seconds);
  if (total < 1) return "<1s";
  if (total < 60) return total + "s";
  if (total < 3600) return Math.floor(total / 60) + "m " + total % 60 + "s";
  return Math.floor(total / 3600) + "h " + Math.floor(total % 3600 / 60) + "m";
}
function Delta({ value }: { value: number | null | undefined }) {
  if (value === undefined) return null;
  if (value === null) return <span className="text-[10px] text-muted-foreground">New</span>;
  const positive = value > 0;
  const negative = value < 0;
  return <span className={`inline-flex items-center text-[10px] font-bold ${positive ? "text-emerald-700" : negative ? "text-destructive" : "text-muted-foreground"}`}>{positive ? <ArrowUpRight className="h-3 w-3" /> : negative ? <ArrowDownRight className="h-3 w-3" /> : null}{Math.abs(value)}%</span>;
}

function ModeToggle({ value, onChange }: { value: AcquisitionMode; onChange: (value: AcquisitionMode) => void }) {
  return <div className="inline-flex self-start rounded-full border border-border bg-background p-1 text-xs font-bold">
    <button type="button" onClick={() => onChange("source")} className={`rounded-full px-3 py-2 transition-colors ${value === "source" ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground"}`}>Sources</button>
    <button type="button" onClick={() => onChange("campaign")} className={`rounded-full px-3 py-2 transition-colors ${value === "campaign" ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground"}`}>Campaigns</button>
  </div>;
}

const SERIES_COLORS = ["#17c98b", "#3478f6", "#ff6078", "#e9b949", "#19bfd0"];

function AcquisitionTrend({ views, range, mode }: { views: View[]; range: Range; mode: AcquisitionMode }) {
  const [activePoint, setActivePoint] = useState<{ label: string; date: string; count: number; x: number; y: number; color: string } | null>(null);
  const width = 1000;
  const height = 180;
  const inset = 12;
  const labels = Array.from({ length: range }, (_, index) => localDateKey(new Date(Date.now() - (range - index - 1) * 86_400_000)));
  const getKey = (view: View) => mode === "source" ? view.utm_source || view.referrer_host || "Direct" : view.utm_campaign;
  const leaders = countBy(views, getKey).slice(0, 5).map(([label]) => label);
  const series = leaders.map((label) => ({ label, values: labels.map((date) => views.filter((view) => localDateKey(view.created_at) === date && getKey(view) === label).length) }));
  const max = Math.max(1, ...series.flatMap((item) => item.values));

  if (!series.length) return <div className="mt-6 grid h-44 place-items-center border border-dashed border-border text-center text-sm text-muted-foreground">No {mode === "source" ? "source" : "campaign"} trend data yet.</div>;

  return <>
    <div className="relative mt-6 h-44 w-full" aria-label={`${mode} traffic trend`}><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" onPointerLeave={() => setActivePoint(null)}>
      {[0, 1, 2].map((lineIndex) => <line key={lineIndex} x1={inset} x2={width - inset} y1={inset + lineIndex * (height - inset * 2) / 2} y2={inset + lineIndex * (height - inset * 2) / 2} className="stroke-border" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
      {series.map((item, seriesIndex) => {
        const color = SERIES_COLORS[seriesIndex];
        const points = item.values.map((count, index) => ({ count, date: labels[index], x: inset + index / Math.max(1, labels.length - 1) * (width - inset * 2), y: height - inset - count / max * (height - inset * 2) }));
        return <g key={item.label}><polyline points={points.map(({ x, y }) => `${x},${y}`).join(" ")} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />{points.map(({ count, date, x, y }) => <g key={date}><circle cx={x} cy={y} r={count > 0 ? "3" : "2"} fill={color} opacity={count > 0 ? 1 : 0.35} vectorEffect="non-scaling-stroke" /><circle cx={x} cy={y} r="12" fill="transparent" className="cursor-crosshair" tabIndex={0} onPointerEnter={() => setActivePoint({ label: item.label, date, count, x, y, color })} onPointerDown={() => setActivePoint({ label: item.label, date, count, x, y, color })} onFocus={() => setActivePoint({ label: item.label, date, count, x, y, color })} onBlur={() => setActivePoint(null)}><title>{date} · {item.label} · {count} views</title></circle></g>)}</g>;
      })}
    </svg>{activePoint && <ChartTooltip x={activePoint.x / width * 100} y={activePoint.y / height * 100} accent={activePoint.color} title={activePoint.label} detail={`${activePoint.date} · ${activePoint.count.toLocaleString()} ${activePoint.count === 1 ? "view" : "views"}`} />}</div>
    <div className="mt-4 flex flex-wrap gap-2">{series.map((item, index) => <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_COLORS[index] }} />{item.label}</span>)}</div>
  </>;
}

function HourlyLine({ rows }: { rows: readonly (readonly [number, number])[] }) {
  const [activePoint, setActivePoint] = useState<{ hour: number; count: number; x: number; y: number } | null>(null);
  const width = 1000;
  const height = 160;
  const inset = 12;
  const max = Math.max(1, ...rows.map(([, count]) => count));
  const points = rows.map(([hour, count], index) => ({ hour, count, x: inset + index / Math.max(1, rows.length - 1) * (width - inset * 2), y: height - inset - count / max * (height - inset * 2) }));
  return <div className="relative mt-6 h-40 w-full" aria-label="Visits by local hour"><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" onPointerLeave={() => setActivePoint(null)}>
    {[0, 1, 2].map((lineIndex) => <line key={lineIndex} x1={inset} x2={width - inset} y1={inset + lineIndex * (height - inset * 2) / 2} y2={inset + lineIndex * (height - inset * 2) / 2} className="stroke-border" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
    <polyline points={points.map(({ x, y }) => `${x},${y}`).join(" ")} fill="none" className="stroke-accent" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    {points.map(({ hour, count, x, y }) => <g key={hour}><circle cx={x} cy={y} r={count > 0 ? "4" : "2"} className={count > 0 ? "fill-card stroke-ink" : "fill-accent"} opacity={count > 0 ? 1 : 0.45} strokeWidth={count > 0 ? "2" : "0"} vectorEffect="non-scaling-stroke" /><circle cx={x} cy={y} r="13" fill="transparent" className="cursor-crosshair" tabIndex={0} onPointerEnter={() => setActivePoint({ hour, count, x, y })} onPointerDown={() => setActivePoint({ hour, count, x, y })} onFocus={() => setActivePoint({ hour, count, x, y })} onBlur={() => setActivePoint(null)}><title>{String(hour).padStart(2, "0")}:00 · {count} views</title></circle></g>)}
  </svg>{activePoint && <ChartTooltip x={activePoint.x / width * 100} y={activePoint.y / height * 100} accent="hsl(var(--accent))" title={`${String(activePoint.hour).padStart(2, "0")}:00–${String((activePoint.hour + 1) % 24).padStart(2, "0")}:00`} detail={`${activePoint.count.toLocaleString()} ${activePoint.count === 1 ? "view" : "views"}`} />}</div>;
}

function ChartTooltip({ x, y, accent, title, detail }: { x: number; y: number; accent: string; title: string; detail: string }) {
  const horizontal = x < 18 ? "translateX(0)" : x > 82 ? "translateX(-100%)" : "translateX(-50%)";
  const vertical = y < 30 ? "translateY(12px)" : "translateY(calc(-100% - 12px))";
  return <div className="pointer-events-none absolute z-10 min-w-max border border-ink bg-ink px-3 py-2 text-left text-ink-foreground shadow-lg" style={{ left: `${x}%`, top: `${y}%`, transform: `${horizontal} ${vertical}` }} role="status">
    <p className="flex items-center gap-2 text-xs font-bold"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />{title}</p>
    <p className="mt-1 font-mono text-[10px] text-ink-foreground/70">{detail}</p>
  </div>;
}

function DevicePanel({ rows }: { rows: [string, number][] }) {
  const total = rows.reduce((sum, [, value]) => sum + value, 0);
  const first = rows[0]?.[1] || 0;
  const angle = total ? first / total * 360 : 0;
  return <Panel className="p-5"><h2 className="text-lg font-extrabold">Device mix</h2>{rows.length ? <div className="mt-5 flex items-center gap-6"><div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(hsl(var(--accent)) 0deg ${angle}deg, hsl(var(--ink)) ${angle}deg 360deg)` }}><div className="absolute inset-5 grid place-items-center rounded-full bg-card text-center"><span className="text-lg font-extrabold">{total}</span></div></div><div className="min-w-0 flex-1 space-y-3">{rows.map(([label, value], index) => <div key={label} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 capitalize"><span className={`h-2.5 w-2.5 ${index === 0 ? "bg-accent" : "bg-ink"}`} />{label}</span><strong>{Math.round(value / total * 100)}%</strong></div>)}</div></div> : <p className="py-8 text-sm text-muted-foreground">Device data will appear after the first visit.</p>}</Panel>;
}

function RankList({ rows, empty }: { rows: [string, number][]; empty: string }) {
  const total = rows.reduce((sum, [, value]) => sum + value, 0);
  return <div className="mt-4 divide-y divide-border">{rows.slice(0, 8).map(([label, value], index) => <div key={label} className={`grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 py-3 text-sm ${index === 0 ? "text-emerald-700" : ""}`}><strong>{index + 1}</strong><span className="truncate font-medium">{label}</span><strong>{total ? Math.round(value / total * 100) : 0}%</strong></div>)}{!rows.length && <p className="py-10 text-sm text-muted-foreground">{empty}</p>}</div>;
}

function RankPanel({ title, rows, empty, formatLabel = (label) => label, numbered = false }: { title: string; rows: [string, number][]; empty: string; formatLabel?: (label: string) => string; numbered?: boolean }) {
  const max = rows[0]?.[1] || 1;
  const total = rows.reduce((sum, [, value]) => sum + value, 0);
  return <Panel className="p-5"><div className="flex items-baseline justify-between"><h2 className="text-lg font-extrabold">{title}</h2><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Share</span></div><div className={numbered ? "mt-4 divide-y divide-border" : "mt-5 space-y-5"}>{rows.slice(0, 8).map(([label, value], index) => numbered ? <div key={label} className={`grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 py-3 text-sm ${index === 0 ? "text-emerald-700" : ""}`}><strong>{index + 1}</strong><span className="truncate font-medium">{formatLabel(label)}</span><strong>{total ? Math.round(value / total * 100) : 0}%</strong></div> : <div key={label}><div className="mb-1.5 flex items-center justify-between gap-4 text-sm"><span className="truncate font-medium">{formatLabel(label)}</span><span className="shrink-0 font-mono text-xs text-muted-foreground">{value.toLocaleString()} · {total ? Math.round(value / total * 100) : 0}%</span></div><div className="h-2 bg-secondary"><div className="h-full bg-ink" style={{ width: `${value / max * 100}%` }} /></div></div>)}{!rows.length && <p className="py-10 text-sm text-muted-foreground">{empty}</p>}</div></Panel>;
}
