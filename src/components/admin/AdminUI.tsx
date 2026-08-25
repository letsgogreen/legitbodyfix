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
