import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Check, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Btn, PageHead, Panel, Tag, Td, Th } from "@/components/admin/AdminUI";
import {
  getIntegrationReadiness,
  type IntegrationReadiness,
} from "@/lib/admin-readiness.functions";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Program = Database["public"]["Tables"]["programs"]["Row"];
type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
type Customer = Database["public"]["Tables"]["customer_profiles"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Dashboard — LegitBodyFix Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const fetchDashboard = () =>
      Promise.all([
        supabase
          .from("programs")
          .select("*")
          .order("featured_rank", { ascending: true, nullsFirst: false }),
        supabase.from("lessons").select("*").order("position"),
        supabase.from("customer_profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
        getIntegrationReadiness(),
      ]);
    let results = await fetchDashboard();
    let firstError = results[0].error ?? results[1].error ?? results[2].error ?? results[3].error;
    if (firstError?.message.includes("JWT issued at future")) {
      await new Promise((resolve) => window.setTimeout(resolve, 3_000));
      results = await fetchDashboard();
      firstError = results[0].error ?? results[1].error ?? results[2].error ?? results[3].error;
    }
    const [programResult, lessonResult, customerResult, orderResult, integrationResult] = results;
    if (firstError) setError(firstError.message);
    else {
      setPrograms(programResult.data ?? []);
      setLessons(lessonResult.data ?? []);
      setCustomers(customerResult.data ?? []);
      setOrders(orderResult.data ?? []);
      setIntegrations(integrationResult);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const paidTotal = useMemo(
    () =>
      orders
        .filter((order) => order.status === "paid")
        .reduce((sum, order) => sum + order.amount_total, 0),
    [orders],
  );
  const programName = (id: string | null) =>
    programs.find((program) => program.id === id)?.name ?? "Unknown program";
  const stats = [
    {
      label: "Programs",
      value: String(programs.length),
      note: `${programs.filter((p) => p.published).length} published`,
    },
    {
      label: "Lessons",
      value: String(lessons.length),
      note: `${lessons.filter((l) => l.published).length} published · ${lessons.filter((l) => l.video_path).length} with video`,
    },
    { label: "Customers", value: String(customers.length), note: "Supabase accounts" },
    {
      label: "Paid orders",
      value: formatMoney(paidTotal, "USD"),
      note: `${orders.filter((o) => o.status === "paid").length} recorded payments`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <PageHead
        title="Control room"
        meta="Live operational overview"
        actions={
          <Btn onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Btn>
        }
      />
      {error && (
        <div className="mt-5 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {loading && !programs.length ? (
        <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading live workspace…
        </div>
      ) : (
        <>
          {integrations && <IntegrationPanel integrations={integrations} />}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Panel key={stat.label} className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
              </Panel>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Panel className="overflow-x-auto">
              <PanelHead title="Recent orders" to="/admin/orders" />
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr>
                    <Th>Customer</Th>
                    <Th>Program</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <Td>{order.customer_email || "Email unavailable"}</Td>
                      <Td>{programName(order.program_id)}</Td>
                      <Td className="font-mono text-xs">
                        {formatMoney(order.amount_total, order.currency)}
                      </Td>
                      <Td>
                        <Tag
                          tone={
                            order.status === "paid"
                              ? "accent"
                              : order.status === "refunded"
                                ? "warn"
                                : "muted"
                          }
                        >
                          {order.status}
                        </Tag>
                      </Td>
                    </tr>
                  ))}
                  {!orders.length && (
                    <tr>
                      <Td colSpan={4} className="py-10 text-center text-muted-foreground">
                        No orders recorded yet.
                      </Td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Panel>
            <Panel>
              <PanelHead title="Recent signups" to="/admin/customers" />
              <ul className="divide-y divide-border/70">
                {customers.slice(0, 5).map((customer) => (
                  <li key={customer.user_id} className="px-4 py-3">
                    <p className="truncate text-sm font-medium">
                      {customer.display_name || customer.email || "Customer"}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {customer.email || "No email"}
                    </p>
                  </li>
                ))}
                {!customers.length && (
                  <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No customer accounts yet.
                  </li>
                )}
              </ul>
            </Panel>
          </div>
          <Panel className="mt-4">
            <PanelHead title="Program readiness" to="/admin/programs" />
            <ul className="divide-y divide-border/70">
              {programs.map((program) => {
                const curriculum = lessons.filter((lesson) => lesson.program_id === program.id);
                const readyVideos = curriculum.filter(
                  (lesson) => lesson.stream_status === "ready",
                ).length;
                const hasPrice = Boolean(program.paddle_price_id);
                return (
                  <li key={program.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <span className="min-w-52 flex-1 text-sm font-medium">{program.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {curriculum.length} lessons · {readyVideos} ready videos
                    </span>
                    <Tag tone={hasPrice ? "accent" : "warn"}>
                      {hasPrice ? "Price linked" : "No Paddle price"}
                    </Tag>
                    <Tag tone={program.published ? "accent" : "muted"}>
                      {program.published ? "Published" : "Draft"}
                    </Tag>
                  </li>
                );
              })}
              {!programs.length && (
                <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No programs configured.
                </li>
              )}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}

function IntegrationPanel({ integrations }: { integrations: IntegrationReadiness }) {
  const items = [
    { label: "Database", ready: integrations.supabase },
    { label: "Paddle checkout", ready: integrations.paddleCheckout },
    { label: "Paddle webhook", ready: integrations.paddleWebhook },
    { label: "Stream upload", ready: integrations.streamUpload },
    { label: "Stream playback", ready: integrations.streamPlayback },
    { label: "Stream webhook", ready: integrations.streamWebhook },
  ];
  const missing = items.filter((item) => !item.ready).length;
  const setupItems = [
    ...(!integrations.paddleCheckout
      ? [
          {
            key: "PADDLE_CLIENT_TOKEN / PADDLE_API_KEY",
            source: "Paddle → Developer tools → Authentication",
          },
        ]
      : []),
    ...(!integrations.paddleWebhook
      ? [
          {
            key: "PADDLE_NOTIFICATION_WEBHOOK_SECRET",
            source: "Paddle → Developer tools → Notifications",
            endpoint: "https://www.legitbodyfix.com/api/public/paddle-webhook",
          },
        ]
      : []),
    ...(!integrations.streamWebhook
      ? [
          {
            key: "CLOUDFLARE_STREAM_WEBHOOK_SECRET",
            source: "Cloudflare Stream webhook signing secret",
            endpoint: "https://www.legitbodyfix.com/api/cloudflare-stream-webhook",
          },
        ]
      : []),
  ];
  return (
    <Panel
      className={`mt-5 p-4 ${missing ? "border-destructive/40 bg-destructive/5" : "bg-accent/10"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Launch systems
          </p>
          <h2 className="mt-1 text-lg font-extrabold">
            {missing ? `${missing} configuration blockers` : "Core integrations ready"}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            This checks whether each required server credential exists in the active deployment. It
            never exposes credential values.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
          {items.map((item) => (
            <span
              key={item.label}
              className={`inline-flex items-center gap-1.5 text-xs font-bold ${item.ready ? "text-foreground" : "text-destructive"}`}
            >
              {item.ready ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              {item.label}
            </span>
          ))}
        </div>
      </div>
      {setupItems.length > 0 && (
        <div className="mt-4 border-t border-border/70 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-extrabold">Finish setup in Vercel</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add these as Production environment variables, then redeploy. Never paste their
                values into source code.
              </p>
            </div>
            <a
              href="https://vercel.com/legitbodyfix/legitbodyfix/settings/environment-variables"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-1.5 border border-border bg-background px-3 text-xs font-bold"
            >
              Open Vercel settings <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-3">
            {setupItems.map((item) => (
              <div key={item.key} className="border border-border bg-background p-3">
                <p className="break-all font-mono text-[11px] font-bold">{item.key}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.source}</p>
                {item.endpoint && (
                  <p className="mt-2 break-all border-t border-border/70 pt-2 font-mono text-[10px] leading-4 text-muted-foreground">
                    Endpoint: {item.endpoint}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

function PanelHead({
  title,
  to,
}: {
  title: string;
  to: "/admin/orders" | "/admin/customers" | "/admin/programs";
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <h2 className="text-sm font-extrabold tracking-tight">{title}</h2>
      <Link
        to={to}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
      >
        View all
      </Link>
    </div>
  );
}

function formatMoney(amount: number, currency: string) {
  const normalized = currency.toUpperCase();
  const value = ["KRW", "JPY", "VND"].includes(normalized) ? amount : amount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalized,
    maximumFractionDigits: normalized === "USD" ? 2 : 0,
  }).format(value);
}
