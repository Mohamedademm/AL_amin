import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Boxes } from 'lucide-react';
import { inventoryApi, spotApi } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/cn';

const LOW = 10;

export default function Inventory() {
  const qc = useQueryClient();
  const toast = useToast();
  const [spotId, setSpotId] = useState('');
  const { data: spots } = useQuery({ queryKey: ['spots'], queryFn: spotApi.list });
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory', spotId],
    queryFn: () => inventoryApi.list(spotId || undefined),
  });

  const [edits, setEdits] = useState<Record<string, number>>({});

  const mutation = useMutation({
    mutationFn: ({ productId, spot, quantity }: { productId: string; spot: string; quantity: number }) =>
      inventoryApi.setQuantity(productId, spot, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Stock updated');
    },
    onError: () => toast.error('Could not update stock'),
  });

  return (
    <div>
      <PageHeader
        title="Inventory Control"
        subtitle="Manage stock levels across every vending spot."
        action={
          <select value={spotId} onChange={(e) => setSpotId(e.target.value)} className="input-base w-56">
            <option value="">All spots</option>
            {spots?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        }
      />

      {isLoading ? (
        <PageLoader label="Loading inventory" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Spot</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Quantity</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(inventory ?? []).map((rec) => {
                  const current = edits[rec.id] ?? rec.quantity;
                  const dirty = edits[rec.id] !== undefined && edits[rec.id] !== rec.quantity;
                  const low = rec.quantity < LOW;
                  return (
                    <tr key={rec.id} className="border-b border-line/60 last:border-0 hover:bg-surface-2/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-content">{rec.product?.name}</p>
                        <p className="text-xs text-muted">{rec.product?.category?.name}</p>
                      </td>
                      <td className="px-5 py-3 text-muted">{rec.spot?.name}</td>
                      <td className="px-5 py-3">
                        <Badge tone={low ? 'amber' : 'emerald'}>{low ? 'Low' : 'In stock'}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          value={current}
                          onChange={(e) => setEdits((p) => ({ ...p, [rec.id]: Number(e.target.value) }))}
                          className={cn('w-20 rounded-lg border bg-surface px-2 py-1.5 text-right outline-none focus:border-primary', dirty ? 'border-primary' : 'border-line')}
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          disabled={!dirty || mutation.isPending}
                          onClick={() => mutation.mutate({ productId: rec.productId, spot: rec.spotId, quantity: current })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-contrast disabled:opacity-30"
                          aria-label="Save"
                        >
                          <Save size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {inventory?.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-16 text-center text-muted"><Boxes size={32} className="mx-auto mb-2 opacity-50" />No stock records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
