import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingBag, Wallet, AlertTriangle, TrendingUp } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';
import { DashboardTrends } from '../../components/dashboard/DashboardTrends';
import { PageLoader } from '../../components/ui/Spinner';
import { formatPrice, formatDate } from '../../utils/format';
import type { OrderStatus } from '../../types';

const statusOrder: OrderStatus[] = ['PENDING', 'VERIFYING', 'ACCEPTED', 'REFUSED'];

export default function StaffDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats });

  if (isLoading || !stats) return <PageLoader label="Loading dashboard" />;

  const maxStatus = Math.max(...statusOrder.map((s) => stats.orders[s]), 1);

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.firstName} 👋`} subtitle="Here's what's happening across the network today." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={stats.products} icon={<Package size={20} />} hint={`${stats.categories} categories`} />
        <StatCard label="Total orders" value={stats.orders.total} icon={<ShoppingBag size={20} />} tone="sky" hint={`${stats.orders.PENDING} pending`} />
        <StatCard label="Revenue" value={formatPrice(stats.revenue)} icon={<Wallet size={20} />} hint="Accepted orders" />
        <StatCard label="Low stock" value={stats.lowStock} icon={<AlertTriangle size={20} />} tone={stats.lowStock > 0 ? 'amber' : 'primary'} hint="Below 10 units" />
      </div>

      <DashboardTrends />

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Order pipeline */}
        <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><TrendingUp size={18} className="text-primary" /> Order pipeline</h3>
          <div className="mt-6 space-y-4">
            {statusOrder.map((s) => (
              <div key={s}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <StatusBadge status={s} />
                  <span className="font-mono font-medium">{stats.orders[s]}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(stats.orders[s] / maxStatus) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-3">
          <h3 className="text-lg font-semibold">Recent orders</h3>
          <div className="mt-4 divide-y divide-line">
            {stats.recentOrders.length === 0 && <p className="py-6 text-sm text-muted">No orders yet.</p>}
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted">
                    {o.client ? `${o.client.firstName} ${o.client.lastName}` : 'Client'} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold">{formatPrice(o.totalAmount)}</span>
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
