import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  Store,
  TrendingUp,
} from "lucide-react";
import { restockApi } from "../../services/api";
import { Skeleton } from "../ui/Skeleton";
import { formatDate } from "../../utils/format";
import type { RestockItem, RestockRisk } from "../../types";

// Per-risk styling so the board reads at a glance, like a control tower.
const RISK_STYLE: Record<
  RestockRisk,
  { label: string; chip: string; dot: string }
> = {
  CRITICAL: {
    label: "Critical",
    chip: "border-red-500/40 bg-red-500/10 text-red-500",
    dot: "bg-red-500",
  },
  WARNING: {
    label: "Low",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    dot: "bg-amber-500",
  },
  HEALTHY: {
    label: "Healthy",
    chip: "border-primary/40 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  IDLE: {
    label: "Idle",
    chip: "border-line bg-surface-2 text-muted",
    dot: "bg-muted",
  },
};

// One forecast row: product · boutique, demand velocity, runway and reorder qty.
function RestockRow({ item }: { item: RestockItem }) {
  const style = RISK_STYLE[item.risk];
  return (
    <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
          <span className="truncate">{item.productName}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
          <Store size={12} />
          {item.spotName}
          {item.isWarehouse && (
            <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
              Warehouse
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Current stock */}
        <div className="text-right">
          <p className="font-mono text-sm font-semibold">
            {item.currentQuantity}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-muted">stock</p>
        </div>

        {/* Demand velocity */}
        <div className="hidden text-right sm:block">
          <p className="flex items-center justify-end gap-1 font-mono text-sm">
            <TrendingUp size={12} className="text-sky-500" />
            {item.velocityPerDay}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-muted">/day</p>
        </div>

        {/* Runway / predicted stockout */}
        <div className="text-right">
          <p className="font-mono text-sm font-semibold">
            {item.daysToStockout === null ? "—" : `${item.daysToStockout}d`}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-muted">
            {item.predictedStockoutDate
              ? formatDate(item.predictedStockoutDate)
              : "no demand"}
          </p>
        </div>

        {/* Suggested reorder */}
        <div className="w-24 text-right">
          {item.suggestedReorder > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
              <Package size={12} />+{item.suggestedReorder}
            </span>
          ) : (
            <span className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${style.chip}`}>
              {style.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// "Control-tower" panel: ranks every product/boutique by how soon it will run
// out of stock and proposes a reorder quantity — predictive replenishment.
export function SmartRestock() {
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["restock", "forecast"],
    queryFn: () => restockApi.forecast(),
  });

  const actionable = (data?.items ?? []).filter(
    (i) => i.risk === "CRITICAL" || i.risk === "WARNING",
  );
  const visible = showAll ? (data?.items ?? []) : actionable;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Package size={18} className="text-primary" /> Smart Restock
          </h3>
          <p className="mt-1 text-sm text-muted">
            Predicted stockouts &amp; suggested replenishment
          </p>
        </div>
        {data && (
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 font-semibold text-red-500">
              <AlertTriangle size={12} />
              {data.summary.critical} critical
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-500">
              {data.summary.warning} low
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full border border-primary/30 bg-primary/10 p-3 text-primary">
              <Package size={22} />
            </div>
            <p className="mt-3 text-sm font-medium">All boutiques well stocked</p>
            <p className="text-xs text-muted">
              No predicted stockouts within the forecast window.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {visible.map((item) => (
              <RestockRow
                key={`${item.productId}:${item.spotId}`}
                item={item}
              />
            ))}
          </div>
        )}
      </div>

      {data && (data.summary.healthy > 0 || data.summary.idle > 0) && (
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
          <Link
            to="/staff/inventory"
            className="font-medium text-primary hover:underline"
          >
            Manage inventory →
          </Link>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="font-medium hover:text-content"
          >
            {showAll
              ? "Show only at-risk"
              : `Show all (${data.summary.healthy + data.summary.idle} more)`}
          </button>
        </div>
      )}
    </div>
  );
}

export default SmartRestock;
