import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHead({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {meta && (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {meta}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Tag({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "ink" | "warn";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        tone === "muted" && "border-border text-muted-foreground",
        tone === "accent" && "border-accent bg-accent/25 text-foreground",
        tone === "ink" && "border-ink bg-ink text-ink-foreground",
        tone === "warn" && "border-destructive/40 text-destructive",
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ live }: { live: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full",
        live ? "bg-accent" : "bg-muted-foreground/50",
      )}
    />
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-sm border border-border bg-card", className)}>{children}</div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block animate-pulse rounded-sm bg-secondary", className)}
    />
  );
}

export function AdminLoadingState({
  variant = "dashboard",
  label = "Loading workspace",
}: {
  variant?: "dashboard" | "editor" | "list";
  label?: string;
}) {
  if (variant === "editor") {
    return (
      <div role="status" aria-label={label} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel className="min-h-[34rem] space-y-6 p-5 sm:p-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-14 w-4/5" />
          <Skeleton className="h-4 w-36" />
          <div className="space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-11/12" /><Skeleton className="h-5 w-3/4" /></div>
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-32 w-full" />
          <span className="sr-only">{label}…</span>
        </Panel>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 w-full" />)}
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <Panel role="status" aria-label={label} className="space-y-3 p-4">
        {[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-12 w-full" />)}
        <span className="sr-only">{label}…</span>
      </Panel>
    );
  }

  return (
    <div role="status" aria-label={label}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <Panel key={item} className="space-y-3 p-4"><Skeleton className="h-3 w-20" /><Skeleton className="h-9 w-28" /><Skeleton className="h-3 w-32" /></Panel>)}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-72 w-full" /><Skeleton className="h-72 w-full" />
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-border px-3 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn("border-b border-border/70 px-3 py-2.5 align-middle", className)}
    >
      {children}
    </td>
  );
}

export function Btn({
  children,
  variant = "ghost",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "ink" | "accent";
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variant === "ghost" && "border border-border bg-background hover:bg-secondary",
        variant === "ink" && "bg-ink text-ink-foreground hover:opacity-90",
        variant === "accent" && "bg-accent text-accent-foreground hover:opacity-90",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
