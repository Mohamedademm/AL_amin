import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X, ShieldCheck, PackageOpen } from 'lucide-react';
import { orderApi } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { cn } from '../../lib/cn';
import { formatDateTime, formatPrice } from '../../utils/format';
import type { Order, OrderStatus } from '../../types';

const filters: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'VERIFYING', 'ACCEPTED', 'REFUSED'];

export default function StaffOrders() {
  const qc = useQueryClient();
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: orderApi.list });
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => orderApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isLoading) return <PageLoader label="Loading orders" />;

  const filtered = (orders ?? []).filter((o) => filter === 'ALL' || o.status === filter);

  return (
    <div>
      <PageHeader title="Order Management" subtitle="Verify, accept or refuse incoming customer orders." />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-medium transition-all',
              filter === f ? 'border-primary bg-primary text-primary-contrast' : 'border-line text-muted hover:text-content',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-muted">
          <PackageOpen size={40} className="opacity-50" />
          <p>No orders in this view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <OrderRow key={o.id} order={o} busy={mutation.isPending} onUpdate={(status) => mutation.mutate({ id: o.id, status })} />
          ))}
        </div>
      )}
    </div>
  );
}

// Single order card with contextual state-machine actions.
function OrderRow({ order, onUpdate, busy }: { order: Order; onUpdate: (s: OrderStatus) => void; busy: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <p className="font-mono text-sm font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-muted">
            {order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Client'} · {formatDateTime(order.createdAt)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {order.items?.length ?? 0} item(s) · {order.spot?.name ?? 'Boutique'} · {order.address}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold">{formatPrice(order.totalAmount)}</p>
          <div className="mt-2 flex justify-end gap-2">
            {order.status === 'PENDING' && (
              <>
                <Button size="sm" disabled={busy} onClick={() => onUpdate('VERIFYING')}><ShieldCheck size={15} /> Verify</Button>
                <Button size="sm" variant="danger" disabled={busy} onClick={() => onUpdate('REFUSED')}><X size={15} /></Button>
              </>
            )}
            {order.status === 'VERIFYING' && (
              <>
                <Button size="sm" disabled={busy} onClick={() => onUpdate('ACCEPTED')}><Check size={15} /> Accept</Button>
                <Button size="sm" variant="danger" disabled={busy} onClick={() => onUpdate('REFUSED')}><X size={15} /></Button>
              </>
            )}
            {(order.status === 'ACCEPTED' || order.status === 'REFUSED') && (
              <span className="text-xs text-muted">Finalized</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
