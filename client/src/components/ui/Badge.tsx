import { type ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { OrderStatus } from "../../types";

type Tone = "primary" | "neutral" | "amber" | "sky" | "red" | "success";

const tones: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-primary/10 text-primary border-primary/20",
  neutral: "bg-surface-2 text-muted border-line",
  amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  sky: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  red: "bg-red-500/10 text-red-500 border-red-500/20",
};

// Small pill used for tags, categories and counts.
export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Maps each order status to a consistent colour tone + label.
const statusTone: Record<OrderStatus, Tone> = {
  PENDING: "amber",
  VERIFYING: "sky",
  ACCEPTED: "success",
  SHIPPING: "primary",
  DELIVERED: "success",
  REFUSED: "red",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={statusTone[status]}>{status}</Badge>;
}

export default Badge;
