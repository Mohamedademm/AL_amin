import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Boxes } from 'lucide-react';
import { inventoryApi, spotApi } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/cn';
import type { InventoryRecord } from '../../types';

const LOW = 10;

export default function Inventory() {
  const qc = useQueryClient();
  const toast = useToast();
  const [spotId, setSpotId] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
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

  const columns: Column<InventoryRecord>[] = [
    {
      key: 'product', header: 'Product', sortValue: (r) => r.product?.name ?? '',
      render: (r) => (
        <div>
          <p className="font-medium text-content">{r.product?.name}</p>
          <p className="text-xs text-muted">{r.product?.category?.name}</p>
        </div>
      ),
    },
    { key: 'spot', header: 'Spot', sortValue: (r) => r.spot?.name ?? '', render: (r) => <span className="text-muted">{r.spot?.name}</span> },
    { key: 'status', header: 'Status', sortValue: (r) => r.quantity, render: (r) => <Badge tone={r.quantity < LOW ? 'amber' : 'emerald'}>{r.quantity < LOW ? 'Low' : 'In stock'}</Badge> },
    {
      key: 'quantity', header: 'Quantity', align: 'right', sortValue: (r) => r.quantity,
      render: (r) => {
        const current = edits[r.id] ?? r.quantity;
        const dirty = edits[r.id] !== undefined && edits[r.id] !== r.quantity;
        return (
          <input
            type="number"
            min={0}
            value={current}
            onChange={(e) => setEdits((p) => ({ ...p, [r.id]: Number(e.target.value) }))}
            className={cn('w-20 rounded-lg border bg-surface px-2 py-1.5 text-right outline-none focus:border-primary', dirty ? 'border-primary' : 'border-line')}
          />
        );
      },
    },
    {
      key: 'save', header: '', align: 'right',
      render: (r) => {
        const current = edits[r.id] ?? r.quantity;
        const dirty = edits[r.id] !== undefined && edits[r.id] !== r.quantity;
        return (
          <button
            disabled={!dirty || mutation.isPending}
            onClick={() => mutation.mutate({ productId: r.productId, spot: r.spotId, quantity: current })}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-contrast disabled:opacity-30"
            aria-label="Save"
          >
            <Save size={15} />
          </button>
        );
      },
    },
  ];

  const rows = (inventory ?? []).filter((r) => !lowOnly || r.quantity < LOW);

  return (
    <div>
      <PageHeader title="Inventory Control" subtitle="Manage stock levels across every vending spot." />

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        loading={isLoading}
        search={(r) => `${r.product?.name ?? ''} ${r.spot?.name ?? ''}`}
        searchPlaceholder="Search products…"
        emptyIcon={<Boxes size={32} />}
        emptyText="No stock records."
        toolbar={
          <>
            <button
              onClick={() => setLowOnly((v) => !v)}
              className={cn('rounded-full border px-4 py-1.5 text-xs font-medium transition-all', lowOnly ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-line text-muted hover:text-content')}
            >
              Low stock only
            </button>
            <select value={spotId} onChange={(e) => setSpotId(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary">
              <option value="">All spots</option>
              {spots?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>
        }
      />
    </div>
  );
}
