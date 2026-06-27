import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, UserCog, Store, Pencil, MapPin, Warehouse } from 'lucide-react';
import { userApi, spotApi } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { initials } from '../../utils/format';
import type { Role, User, VendingSpot } from '../../types';

const STAFF_ROLES: Role[] = ['ADMIN', 'MANAGER', 'WORKER'];
const roleTone: Record<string, 'primary' | 'sky' | 'amber'> = { ADMIN: 'primary', MANAGER: 'sky', WORKER: 'amber' };

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  assignedSpotId: string;
}

interface SpotFormState {
  name: string;
  location: string;
  address: string;
  phone: string;
}

const EMPTY_FORM: FormState = { firstName: '', lastName: '', email: '', phone: '', password: '', role: 'WORKER', assignedSpotId: '' };
const EMPTY_SPOT: SpotFormState = { name: '', location: '', address: '', phone: '' };

export default function StaffManagement() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => userApi.list() });
  const { data: spots } = useQuery({ queryKey: ['spots'], queryFn: spotApi.list });

  // ── Staff create ──
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  // ── Staff edit ──
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  // ── Spot CRUD ──
  const [spotOpen, setSpotOpen] = useState(false);
  const [spotForm, setSpotForm] = useState<SpotFormState>(EMPTY_SPOT);
  const [editingSpot, setEditingSpot] = useState<VendingSpot | null>(null);

  const create = useMutation({
    mutationFn: () => userApi.create({
      ...form,
      assignedSpotId: form.assignedSpotId || null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setOpen(false); setForm(EMPTY_FORM); toast.success('Staff account created'); },
    onError: (e: any) => setError(e?.response?.data?.message || 'Could not create staff account.'),
  });

  const updateStaff = useMutation({
    mutationFn: (payload: { id: string; data: Parameters<typeof userApi.update>[1] }) =>
      userApi.update(payload.id, payload.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setEditOpen(false); setEditingUser(null); toast.success('Staff account updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not update staff account.'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Staff member removed'); },
    onError: () => toast.error('Could not remove the staff member'),
  });

  const createSpot = useMutation({
    mutationFn: () => spotApi.create(spotForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['spots'] }); setSpotOpen(false); setSpotForm(EMPTY_SPOT); toast.success('Vending spot created'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not create spot.'),
  });

  const updateSpot = useMutation({
    mutationFn: () => spotApi.update(editingSpot!.id, spotForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['spots'] }); setSpotOpen(false); setEditingSpot(null); setSpotForm(EMPTY_SPOT); toast.success('Vending spot updated'); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Could not update spot.'),
  });

  const removeSpot = useMutation({
    mutationFn: (id: string) => spotApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['spots'] }); toast.success('Vending spot removed'); },
    onError: () => toast.error('Could not remove the vending spot'),
  });

  const askRemove = async (u: User) => {
    if (await confirm({ title: 'Remove staff', message: `Remove ${u.firstName} ${u.lastName}?`, danger: true, confirmLabel: 'Remove' })) {
      remove.mutate(u.id);
    }
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone ?? '',
      password: '',
      role: u.role,
      assignedSpotId: u.assignedSpotId ?? '',
    });
    setEditOpen(true);
  };

  const openSpotCreate = () => {
    setEditingSpot(null);
    setSpotForm(EMPTY_SPOT);
    setSpotOpen(true);
  };

  const openSpotEdit = (s: VendingSpot) => {
    setEditingSpot(s);
    setSpotForm({ name: s.name, location: s.location, address: s.address, phone: s.phone ?? '' });
    setSpotOpen(true);
  };

  if (isLoading) return <PageLoader label="Loading staff" />;

  const staff = (users ?? []).filter((u) => STAFF_ROLES.includes(u.role));
  const spotMap = new Map((spots ?? []).map((s) => [s.id, s.name]));

  return (
    <div className="space-y-12">
      {/* ── Staff section ── */}
      <section>
        <PageHeader
          title="Staff Management"
          subtitle="Create and manage internal operator accounts. Assign each staff member to their vending spot."
          action={<Button onClick={() => { setForm(EMPTY_FORM); setError(''); setOpen(true); }}><Plus size={16} /> Add staff</Button>}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((u) => (
            <div key={u.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-sm font-bold text-primary">{initials(u.firstName, u.lastName)}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(u)} className="text-muted transition-colors hover:text-primary" aria-label="Edit"><Pencil size={16} /></button>
                  <button onClick={() => askRemove(u)} className="text-muted transition-colors hover:text-red-500" aria-label="Remove"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="mt-3 font-semibold text-content">{u.firstName} {u.lastName}</p>
              <p className="text-xs text-muted">{u.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={roleTone[u.role]}>{u.role}</Badge>
                {u.assignedSpotId && spotMap.has(u.assignedSpotId) && (
                  <Badge tone="neutral">
                    <Store size={12} /> {spotMap.get(u.assignedSpotId)}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {staff.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-16 text-muted"><UserCog size={32} className="opacity-50" />No staff accounts yet.</div>
          )}
        </div>
      </section>

      {/* ── Vending Spots section ── */}
      <section>
        <PageHeader
          title="Vending Spots"
          subtitle="Manage boutiques and vending locations. Staff assigned to a spot only see orders from that location."
          action={<Button onClick={openSpotCreate}><Plus size={16} /> Add spot</Button>}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(spots ?? []).map((s) => (
            <div key={s.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                  <Warehouse size={20} />
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openSpotEdit(s)} className="text-muted transition-colors hover:text-primary" aria-label="Edit spot"><Pencil size={16} /></button>
                  <button
                    onClick={async () => {
                      if (await confirm({ title: 'Remove spot', message: `Remove ${s.name}?`, danger: true, confirmLabel: 'Remove' }))
                        removeSpot.mutate(s.id);
                    }}
                    className="text-muted transition-colors hover:text-red-500"
                    aria-label="Remove spot"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-3 font-semibold text-content">{s.name}</p>
              <div className="mt-1.5 space-y-1 text-xs text-muted">
                <p className="flex items-center gap-1.5"><MapPin size={12} /> {s.location}</p>
                <p className="flex items-center gap-1.5"><MapPin size={12} /> {s.address}</p>
                {s.phone && <p>{s.phone}</p>}
              </div>
              {s._count && (
                <div className="mt-3 flex gap-3 text-xs text-muted">
                  <span>{s._count.inventory} products</span>
                  <span>{s._count.orders} orders</span>
                </div>
              )}
            </div>
          ))}
          {(spots ?? []).length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-16 text-muted"><Store size={32} className="opacity-50" />No vending spots yet.</div>
          )}
        </div>
      </section>

      {/* ── Create staff modal ── */}
      <Modal open={open} onClose={() => setOpen(false)} title="New staff member">
        <form onSubmit={(e) => { e.preventDefault(); setError(''); create.mutate(); }} className="space-y-4">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-content">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="input-base">
                {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {form.role !== 'ADMIN' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-content">Assigned vending spot</label>
              <select value={form.assignedSpotId} onChange={(e) => setForm({ ...form, assignedSpotId: e.target.value })} className="input-base">
                <option value="">-- No spot (sees all orders) --</option>
                {(spots ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.location}</option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-muted">Staff will only see orders for their assigned spot.</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create account'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit staff modal ── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${editingUser?.firstName ?? ''} ${editingUser?.lastName ?? ''}`}>
        <form onSubmit={(e) => { e.preventDefault(); if (!editingUser) return; updateStaff.mutate({ id: editingUser.id, data: { firstName: editForm.firstName, lastName: editForm.lastName, email: editForm.email, phone: editForm.phone || null, role: editForm.role, assignedSpotId: editForm.assignedSpotId || null } }); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} required />
            <Input label="Last name" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} required />
          </div>
          <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
          <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-content">Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })} className="input-base">
                {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Input label="New password (leave blank to keep)" type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} minLength={6} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">Assigned vending spot</label>
            <select value={editForm.assignedSpotId} onChange={(e) => setEditForm({ ...editForm, assignedSpotId: e.target.value })} className="input-base">
              <option value="">-- No spot (sees all orders) --</option>
              {(spots ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.location}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={updateStaff.isPending}>{updateStaff.isPending ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Spot create/edit modal ── */}
      <Modal open={spotOpen} onClose={() => { setSpotOpen(false); setEditingSpot(null); setSpotForm(EMPTY_SPOT); }} title={editingSpot ? `Edit ${editingSpot.name}` : 'New vending spot'}>
        <form onSubmit={(e) => { e.preventDefault(); editingSpot ? updateSpot.mutate() : createSpot.mutate(); }} className="space-y-4">
          <Input label="Spot name" value={spotForm.name} onChange={(e) => setSpotForm({ ...spotForm, name: e.target.value })} placeholder="e.g. Downtown Boutique" required />
          <Input label="Location / area" value={spotForm.location} onChange={(e) => setSpotForm({ ...spotForm, location: e.target.value })} placeholder="e.g. City Center" required />
          <Input label="Address" value={spotForm.address} onChange={(e) => setSpotForm({ ...spotForm, address: e.target.value })} placeholder="Full street address" required />
          <Input label="Phone (optional)" value={spotForm.phone} onChange={(e) => setSpotForm({ ...spotForm, phone: e.target.value })} placeholder="+216 XX XXX XXX" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setSpotOpen(false); setEditingSpot(null); setSpotForm(EMPTY_SPOT); }}>Cancel</Button>
            <Button type="submit" disabled={createSpot.isPending || updateSpot.isPending}>
              {(createSpot.isPending || updateSpot.isPending) ? 'Saving…' : editingSpot ? 'Update spot' : 'Create spot'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
