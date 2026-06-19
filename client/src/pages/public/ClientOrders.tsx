import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { orderApi } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { Button, buttonClasses } from '../../components/ui/Button';
import { formatDateTime, formatPrice } from '../../utils/format';

export default function ClientOrders() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: orderApi.list });
  const [params] = useSearchParams();
  const success = params.get('success') === '1';

  const cancel = useMutation({
    mutationFn: (id: string) => orderApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order cancelled'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not cancel the order'),
  });

  const askCancel = async (id: string) => {
    if (await confirm({ title: 'Cancel order', message: 'Cancel this pending order? This cannot be undone.', danger: true, confirmLabel: 'Cancel order' })) {
      cancel.mutate(id);
    }
  };

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-bold">My Orders</h1>
      <p className="mt-2 text-muted">Track your current deliveries and order history.</p>

      {success && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 text-primary animate-scale-in">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">Your order was placed successfully and is now pending verification.</p>
        </div>
      )}

      {isLoading ? (
        <PageLoader label="Loading orders" />
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted">
          <Package size={40} className="opacity-50" />
          <p>You have no orders yet.</p>
          <Link to="/catalog" className={buttonClasses('primary', 'md', 'mt-2')}>Start shopping <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-primary/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-muted">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted">{formatDateTime(o.createdAt)}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4">
                <div className="flex -space-x-2">
                  {o.items?.slice(0, 4).map((it) => (
                    <div key={it.id} className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-2 text-[10px] font-bold text-muted">
                      {it.product?.name?.[0] ?? '·'}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted">{o.items?.length ?? 0} item(s) · {o.spot?.name ?? 'Boutique'}</p>
                <span className="ml-auto font-mono text-lg font-semibold text-content">{formatPrice(o.totalAmount)}</span>
              </div>
              <div className="mt-4 flex items-center justify-end gap-3 border-t border-line pt-4">
                {o.status === 'PENDING' && (
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10" disabled={cancel.isPending} onClick={() => askCancel(o.id)}>
                    Cancel
                  </Button>
                )}
                <Link to={`/orders/${o.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                  View details <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
