import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  ShoppingBag,
  Users,
  Package,
  Store,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { dashboardApi } from "../../services/api";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/Badge";
import { DashboardTrends } from "../../components/dashboard/DashboardTrends";
import { PageLoader } from "../../components/ui/Spinner";
import { formatPrice, formatDate } from "../../utils/format";
import type { OrderStatus } from "../../types";

const statusOrder: OrderStatus[] = [
  "PENDING",
  "VERIFYING",
  "ACCEPTED",
  "SHIPPING",
  "DELIVERED",
  "REFUSED",
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.stats,
  });
  // Only fetch the detailed low-stock list when the headline count is non-zero.
  const { data: lowStockItems } = useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: dashboardApi.lowStock,
    enabled: !!stats && stats.lowStock > 0,
  });
  if (isLoading || !stats) return <PageLoader label="Loading overview" />;

  const maxStatus = Math.max(...statusOrder.map((s) => stats.orders[s]), 1);

  return (
    <div>
      <PageHeader
        title="HQ Overview"
        subtitle="System-wide performance, revenue and network health."
      />

      {lowStockItems && lowStockItems.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle size={18} />
            <h3 className="font-semibold">
              {lowStockItems.length} item
              {lowStockItems.length > 1 ? "s" : ""} need restocking
            </h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {lowStockItems.slice(0, 12).map((it) => (
              <span
                key={it.id}
                className="rounded-full border border-amber-500/30 bg-surface px-3 py-1 text-xs"
              >
                {it.productName} · {it.spotName}{" "}
                <span className="font-mono font-semibold text-amber-500">
                  {it.quantity}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatPrice(stats.revenue)}
          icon={<Wallet size={20} />}
          hint="Accepted orders"
        />
        <StatCard
          label="Orders"
          value={stats.orders.total}
          icon={<ShoppingBag size={20} />}
          tone="sky"
          hint={`${stats.orders.PENDING} pending`}
        />
        <StatCard
          label="Users"
          value={stats.users}
          icon={<Users size={20} />}
          hint="All roles"
        />
        <StatCard
          label="Products"
          value={stats.products}
          icon={<Package size={20} />}
          hint={`${stats.categories} categories`}
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Boutiques"
          value={stats.spots}
          icon={<Store size={20} />}
          tone="primary"
        />
        <StatCard
          label="Categories"
          value={stats.categories}
          icon={<Layers size={20} />}
          tone="sky"
        />
        <StatCard
          label="Low stock"
          value={stats.lowStock}
          icon={<AlertTriangle size={20} />}
          tone={stats.lowStock > 0 ? "amber" : "primary"}
          hint="Below 10 units"
        />
      </div>

      <DashboardTrends />

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold">Order pipeline</h3>
          <div className="mt-6 space-y-4">
            {statusOrder.map((s) => (
              <div key={s}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <StatusBadge status={s} />
                  <span className="font-mono font-medium">
                    {stats.orders[s]}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${(stats.orders[s] / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-3">
          <h3 className="text-lg font-semibold">Recent orders</h3>
          <div className="mt-4 divide-y divide-line">
            {stats.recentOrders.length === 0 && (
              <p className="py-6 text-sm text-muted">No orders yet.</p>
            )}
            {stats.recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted">
                    {o.client
                      ? `${o.client.firstName} ${o.client.lastName}`
                      : "Client"}{" "}
                    · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold">
                    {formatPrice(o.totalAmount)}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
