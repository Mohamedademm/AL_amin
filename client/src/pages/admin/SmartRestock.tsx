import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  Minus,
  RefreshCw,
  Zap,
  ArrowUpRight,
  Clock,
  Package,
} from "lucide-react";
import { restockApi, discountApi, spotApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { PageLoader } from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../lib/cn";
import { formatDate } from "../../utils/format";
import type { RestockItem, RestockRisk } from "../../types";

const RISK_CONFIG: Record<
  RestockRisk,
  { label: string; tone: "red" | "amber" | "success" | "neutral"; icon: typeof AlertTriangle }
> = {
  CRITICAL: { label: "Critical", tone: "red", icon: AlertTriangle },
  WARNING: { label: "Warning", tone: "amber", icon: TrendingDown },
  HEALTHY: { label: "Healthy", tone: "success", icon: CheckCircle2 },
  IDLE: { label: "Idle", tone: "neutral", icon: Minus },
};

export default function SmartRestock() {
  const qc = useQueryClient();
  const toast = useToast();
  const [spotFilter, setSpotFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState<RestockRisk | "">("");

  const { data: spots } = useQuery({ queryKey: ["spots"], queryFn: spotApi.list });
  const { data: forecast, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["restock", spotFilter],
    queryFn: () => restockApi.forecast(spotFilter || undefined),
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 minutes
  });

  const autoPricing = useMutation({
    mutationFn: discountApi.runAutoPricing,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["discounts"] });
      toast.success(
        `Auto-pricing done: ${result.created} discount(s) created, ${result.retired} retired`
      );
    },
    onError: () => toast.error("Auto-pricing run failed"),
  });

  const items = (forecast?.items ?? []).filter(
    (it) => !riskFilter || it.risk === riskFilter
  );

  const columns: Column<RestockItem>[] = [
    {
      key: "product",
      header: "Product",
      sortValue: (r) => r.productName,
      render: (r) => (
        <div>
          <p className="font-medium text-content">{r.productName}</p>
          <p className="text-xs text-muted">{r.spotName}</p>
        </div>
      ),
    },
    {
      key: "risk",
      header: "Risk",
      sortValue: (r) => r.risk,
      render: (r) => {
        const cfg = RISK_CONFIG[r.risk];
        const Icon = cfg.icon;
        return (
          <Badge tone={cfg.tone}>
            <Icon size={12} /> {cfg.label}
          </Badge>
        );
      },
    },
    {
      key: "stock",
      header: "In stock",
      align: "right",
      sortValue: (r) => r.currentQuantity,
      render: (r) => (
        <span
          className={cn(
            "font-mono font-semibold",
            r.currentQuantity === 0
              ? "text-red-500"
              : r.currentQuantity < 5
                ? "text-amber-500"
                : "text-content"
          )}
        >
          {r.currentQuantity}
        </span>
      ),
    },
    {
      key: "velocity",
      header: "Sales / day",
      align: "right",
      sortValue: (r) => r.velocityPerDay,
      render: (r) => (
        <span className="font-mono text-sm text-muted">
          {r.velocityPerDay > 0 ? r.velocityPerDay.toFixed(2) : "—"}
        </span>
      ),
    },
    {
      key: "stockout",
      header: "Stockout in",
      align: "right",
      sortValue: (r) => r.daysToStockout ?? 9999,
      render: (r) => {
        if (r.daysToStockout === null) return <span className="text-muted">—</span>;
        return (
          <div className="text-right">
            <p
              className={cn(
                "font-mono font-semibold",
                r.daysToStockout <= 3 ? "text-red-500" : r.daysToStockout <= 7 ? "text-amber-500" : "text-content"
              )}
            >
              {r.daysToStockout}d
            </p>
            {r.predictedStockoutDate && (
              <p className="text-[10px] text-muted">{formatDate(r.predictedStockoutDate)}</p>
            )}
          </div>
        );
      },
    },
    {
      key: "reorder",
      header: "Suggested order",
      align: "right",
      sortValue: (r) => r.suggestedReorder,
      render: (r) =>
        r.suggestedReorder > 0 ? (
          <span className="flex items-center justify-end gap-1 font-mono text-sm font-semibold text-primary">
            <ArrowUpRight size={14} /> {r.suggestedReorder} units
          </span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
  ];

  if (isLoading) return <PageLoader label="Analyzing inventory…" />;

  const summary = forecast?.summary;

  return (
    <div>
      <PageHeader
        title="Smart Restock"
        subtitle="AI-driven stockout predictions and reorder suggestions per boutique."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button
              onClick={() => autoPricing.mutate()}
              disabled={autoPricing.isPending}
            >
              <Zap size={16} />
              {autoPricing.isPending ? "Running…" : "Run Auto-Pricing"}
            </Button>
          </div>
        }
      />

      {/* Forecast meta */}
      {forecast && (
        <p className="mb-5 text-xs text-muted">
          <Clock size={11} className="mr-1 inline" />
          Generated {new Date(forecast.generatedAt).toLocaleString()} · Based on{" "}
          {forecast.params.windowDays}-day sales window ·{" "}
          {forecast.params.leadTimeDays}d lead time · {forecast.params.coverDays}d coverage target
        </p>
      )}

      {/* Summary stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Critical"
          value={summary?.critical ?? 0}
          icon={<AlertTriangle size={20} />}
          tone={(summary?.critical ?? 0) > 0 ? "red" : "primary"}
          hint="Need reorder now"
        />
        <StatCard
          label="Warning"
          value={summary?.warning ?? 0}
          icon={<TrendingDown size={20} />}
          tone={(summary?.warning ?? 0) > 0 ? "amber" : "primary"}
          hint="Running low soon"
        />
        <StatCard
          label="Healthy"
          value={summary?.healthy ?? 0}
          icon={<CheckCircle2 size={20} />}
          tone="success"
          hint="Sufficient stock"
        />
        <StatCard
          label="Idle"
          value={summary?.idle ?? 0}
          icon={<Package size={20} />}
          hint="No recent sales"
        />
      </div>

      {/* Filters */}
      <DataTable
        data={items}
        columns={columns}
        rowKey={(r) => `${r.productId}:${r.spotId}`}
        search={(r) => `${r.productName} ${r.spotName}`}
        searchPlaceholder="Search product or boutique…"
        emptyIcon={<CheckCircle2 size={32} />}
        emptyText="No items match your filters — all stock is healthy!"
        toolbar={
          <>
            {/* Risk filter */}
            {(["", "CRITICAL", "WARNING", "HEALTHY", "IDLE"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r as RestockRisk | "")}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  riskFilter === r
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-line text-muted hover:text-content"
                )}
              >
                {r === "" ? "All risks" : RISK_CONFIG[r as RestockRisk].label}
              </button>
            ))}
            {/* Spot filter */}
            <select
              value={spotFilter}
              onChange={(e) => setSpotFilter(e.target.value)}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
            >
              <option value="">All boutiques</option>
              {spots?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </>
        }
      />
    </div>
  );
}
