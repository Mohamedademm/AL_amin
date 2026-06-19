import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { productApi, categoryApi } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ProductImage } from '../../components/common/ProductImage';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/format';
import type { Product } from '../../types';

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
}

const EMPTY: FormState = { name: '', description: '', price: '', categoryId: '', imageUrl: '' };

export default function ProductManagement() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: productApi.list });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryApi.list });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['products'] });

  const save = useMutation({
    mutationFn: (f: FormState) => {
      const payload = { name: f.name, description: f.description, price: Number(f.price), categoryId: f.categoryId, imageUrl: f.imageUrl || undefined };
      return f.id ? productApi.update(f.id, payload) : productApi.create(payload);
    },
    onSuccess: () => { invalidate(); setOpen(false); toast.success('Product saved'); },
    onError: () => toast.error('Could not save the product'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productApi.remove(id),
    onSuccess: () => { invalidate(); toast.success('Product deleted'); },
    onError: () => toast.error('Could not delete the product'),
  });

  // Ask for confirmation before deleting a product.
  const askDelete = async (p: Product) => {
    if (await confirm({ title: 'Delete product', message: `Delete "${p.name}"? This cannot be undone.`, danger: true, confirmLabel: 'Delete' })) {
      remove.mutate(p.id);
    }
  };

  const openCreate = () => { setForm({ ...EMPTY, categoryId: categories?.[0]?.id ?? '' }); setOpen(true); };
  const openEdit = (p: Product) => {
    setForm({ id: p.id, name: p.name, description: p.description ?? '', price: String(p.price), categoryId: p.categoryId, imageUrl: p.imageUrl ?? '' });
    setOpen(true);
  };

  const columns: Column<Product>[] = [
    {
      key: 'product', header: 'Product', sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-lg bg-surface-2">
            <ProductImage src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
          </div>
          <p className="font-medium text-content">{p.name}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortValue: (p) => p.category?.name ?? '', render: (p) => <span className="text-muted">{p.category?.name}</span> },
    { key: 'price', header: 'Price', align: 'right', sortValue: (p) => Number(p.price), render: (p) => <span className="font-mono">{formatPrice(p.price)}</span> },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => openEdit(p)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-primary" aria-label="Edit"><Pencil size={15} /></button>
          <button onClick={() => askDelete(p)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-red-500" aria-label="Delete"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Product Catalog"
        subtitle="Create, update and remove products."
        action={<Button onClick={openCreate}><Plus size={16} /> Add product</Button>}
      />

      <DataTable
        data={products ?? []}
        columns={columns}
        rowKey={(p) => p.id}
        loading={isLoading}
        search={(p) => `${p.name} ${p.category?.name ?? ''}`}
        searchPlaceholder="Search products…"
        emptyIcon={<Package size={32} />}
        emptyText="No products yet — add your first one."
      />

      <Modal open={open} onClose={() => setOpen(false)} title={form.id ? 'Edit product' : 'New product'}>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-base resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (TND)" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-content">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-base" required>
                <option value="" disabled>Select…</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <Input label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
          {save.isError && <p className="text-sm text-red-500">Could not save the product.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save product'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
