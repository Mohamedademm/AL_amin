import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, XCircle, MapPin, Phone, Store, Truck, Zap } from 'lucide-react';
import { orderApi } from '../../services/api';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { ProductImage } from '../../components/common/ProductImage';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { cn } from '../../lib/cn';
import { formatDateTime, formatPrice } from '../../utils/format';
import type { OrderStatus } from '../../types';

// The three forward stages of a successful order.
const steps: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'PENDING', label: 'Placed', icon: Clock },
  { status: 'VERIFYING', label: 'Verifying', icon: ShieldCheck },
  { status: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => orderApi.get(id!), enabled: !!id });

  const cancel = useMutation({
    mutationFn: () => orderApi.cancel(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not cancel the order'),
  });

  const askCancel = async () => {
    if (await confirm({ title: 'Cancel order', message: 'Cancel this pending order? This cannot be undone.', danger: true, confirmLabel: 'Cancel order' })) {
      cancel.mutate();
    }
  };

  if (isLoading) return <div className="container-page"><PageLoader /></div>;
  if (!order) return <div className="container-page py-24 text-center text-muted">Order not found.</div>;

  const refused = order.status === 'REFUSED';
  const currentIndex = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="container-page py-10">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-3xl font-bold">#{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        {refused ? (
          <div className="flex items-center gap-3 text-red-500">
            <XCircle size={22} />
            <p className="font-medium">This order was {order.status === 'REFUSED' ? 'cancelled / refused' : 'closed'}.</p>
          </div>
        ) : (
          <div className="flex items-center">
            {steps.map((step, i) => {
              const done = i <= currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <span className={cn('flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors', done ? 'border-primary bg-primary/10 text-primary' : 'border-line text-muted')}>
                      <Icon size={20} />
                    </span>
                    <span className={cn('mt-2 text-xs font-medium', done ? 'text-content' : 'text-muted')}>{step.label}</span>
                  </div>
                  {i < steps.length - 1 && <div className={cn('mx-2 h-0.5 flex-1 rounded', i < currentIndex ? 'bg-primary' : 'bg-line')} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-3 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="mt-4 divide-y divide-line">
              {order.items?.map((it) => (
                <div key={it.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-surface-2">
                    <ProductImage src={it.product?.imageUrl} alt={it.product?.name ?? ''} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-content">{it.product?.name}</p>
                    <p className="text-xs text-muted">Qty {it.quantity} × {formatPrice(it.price)}</p>
                  </div>
                  <span className="font-mono text-sm">{formatPrice(Number(it.price) * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><MapPin size={18} className="text-primary" /> Delivery</h2>
            <div className="mt-3 space-y-2 text-sm text-muted">
              <p className="flex items-center gap-2"><Store size={15} /> {order.spot?.name ?? 'Boutique'}</p>
              <p className="flex items-center gap-2"><MapPin size={15} /> {order.address}</p>
              <p className="flex items-center gap-2"><Phone size={15} /> {order.phone}</p>
            </div>
            {order.fulfilment && (
              <div className={cn('mt-4 flex items-center gap-3 rounded-xl border p-3', order.fulfilment === 'LOCAL' ? 'border-primary/30 bg-primary/5 text-primary' : 'border-sky-500/30 bg-sky-500/5 text-sky-500')}>
                {order.fulfilment === 'LOCAL' ? <Zap size={18} /> : <Truck size={18} />}
                <div className="text-sm">
                  <p className="font-semibold">{order.fulfilment === 'LOCAL' ? 'Local match' : 'Remote fulfilment'}</p>
                  <p className="text-muted">{order.fulfilment === 'LOCAL' ? 'Shipped from the nearest boutique — immediate delivery' : `From the central warehouse — est. ${order.etaDays ?? 2} days`}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Summary</h2>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-mono text-lg font-bold">{formatPrice(order.totalAmount)}</span>
          </div>
          {order.status === 'PENDING' && (
            <Button variant="danger" className="mt-5 w-full" disabled={cancel.isPending} onClick={askCancel}>
              {cancel.isPending ? 'Cancelling…' : 'Cancel order'}
            </Button>
          )}
          <Link to="/orders" className="mt-3 block text-center text-sm text-muted hover:text-primary">All my orders</Link>
        </div>
      </div>
    </div>
  );
}
