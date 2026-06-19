import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import { TrendChart } from '../ui/TrendChart';
import { Skeleton } from '../ui/Skeleton';
import { formatPrice } from '../../utils/format';

// Two-up trend panel (revenue area + orders bars) for the last 14 days.
export function DashboardTrends() {
  const { data: trends, isLoading } = useQuery({ queryKey: ['trends'], queryFn: dashboardApi.trends });

  const labels = (trends ?? []).map((t) => t.date.slice(5)); // MM-DD
  const revenue = (trends ?? []).map((t) => Number(t.revenue));
  const orders = (trends ?? []).map((t) => t.orders);
  const totalRevenue = revenue.reduce((a, b) => a + b, 0);
  const totalOrders = orders.reduce((a, b) => a + b, 0);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold"><TrendingUp size={18} className="text-primary" /> Revenue</h3>
            <p className="mt-1 font-serif text-2xl font-bold text-gradient">{formatPrice(totalRevenue)}</p>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted">14 days</span>
        </div>
        <div className="mt-4">
          {isLoading ? <Skeleton className="h-24 w-full" /> : <TrendChart data={revenue} labels={labels} type="area" format={(n) => formatPrice(n)} />}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold"><ShoppingBag size={18} className="text-sky-500" /> Orders</h3>
            <p className="mt-1 font-serif text-2xl font-bold text-content">{totalOrders}</p>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted">14 days</span>
        </div>
        <div className="mt-4">
          {isLoading ? <Skeleton className="h-24 w-full" /> : <TrendChart data={orders} labels={labels} type="bar" className="text-sky-500" />}
        </div>
      </div>
    </div>
  );
}

export default DashboardTrends;
