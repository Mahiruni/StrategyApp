import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section
      className={cn("surface interactive-surface", className)}
      {...props}
    >
      <div className="relative z-[1] h-full">{children}</div>
    </section>
  );
}

export function PanelHeader({
  title,
  eyebrow,
  meta,
  action,
  className,
}: {
  title: string;
  eyebrow?: string;
  meta?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="eyebrow mb-1.5">{eyebrow}</div> : null}
        <h2 className="truncate text-[13px] font-[560] tracking-[-0.015em] text-ink">
          {title}
        </h2>
        {meta ? (
          <p className="mt-1 text-[11px] leading-relaxed text-faint">{meta}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "mint" | "coral" | "gold" | "blue";
  className?: string;
}) {
  const styles = {
    neutral: "border-line bg-raised text-muted",
    mint: "border-[rgba(var(--mint-rgb),.2)] bg-[var(--mint-soft)] text-mint",
    coral:
      "border-[rgba(var(--coral-rgb),.2)] bg-[var(--coral-soft)] text-coral",
    gold: "border-[rgba(var(--gold-rgb),.2)] bg-[var(--gold-soft)] text-gold",
    blue: "border-[rgba(123,166,255,.2)] bg-[var(--blue-soft)] text-[var(--blue)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10.5px] font-medium",
        styles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("skeleton rounded-[10px]", className)} />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-raised text-faint">
        {icon}
      </div>
      <h3 className="text-[13px] font-medium text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-faint">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function FieldLabel({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="field-label">
        <span>{label}</span>
        {hint ? <span className="font-normal text-faint">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-line", className)} />;
}
