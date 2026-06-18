import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, UserCog } from 'lucide-react';
import { userApi } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { initials } from '../../utils/format';
import type { Role } from '../../types';

const STAFF_ROLES: Role[] = ['ADMIN', 'MANAGER', 'WORKER'];
const roleTone: Record<string, 'primary' | 'sky' | 'amber'> = { ADMIN: 'primary', MANAGER: 'sky', WORKER: 'amber' };

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', password: '', role: 'WORKER' as Role };

export default function StaffManagement() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => userApi.list() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: () => userApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setOpen(false); setForm(EMPTY); },
    onError: (e: any) => setError(e?.response?.data?.message || 'Could not create staff account.'),
  });
  const remove = useMutation({ mutationFn: (id: string) => userApi.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) });

  if (isLoading) return <PageLoader label="Loading staff" />;

  const staff = (users ?? []).filter((u) => STAFF_ROLES.includes(u.role));

  return (
    <div>
      <PageHeader
        title="Staff Management"
        subtitle="Create and manage internal operator accounts."
        action={<Button onClick={() => { setForm(EMPTY); setError(''); setOpen(true); }}><Plus size={16} /> Add staff</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((u) => (
          <div key={u.id} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-sm font-bold text-primary">{initials(u.firstName, u.lastName)}</span>
              <button onClick={() => confirm(`Remove ${u.firstName}?`) && remove.mutate(u.id)} className="text-muted hover:text-red-500" aria-label="Remove"><Trash2 size={16} /></button>
            </div>
            <p className="mt-3 font-semibold text-content">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-muted">{u.email}</p>
            <div className="mt-3"><Badge tone={roleTone[u.role]}>{u.role}</Badge></div>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 py-16 text-muted"><UserCog size={32} className="opacity-50" />No staff accounts yet.</div>
        )}
      </div>

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
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create account'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
