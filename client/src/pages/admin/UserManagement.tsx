import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Users as UsersIcon } from 'lucide-react';
import { userApi } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/cn';
import { formatDate, initials } from '../../utils/format';
import type { Role, User } from '../../types';

const roles: (Role | 'ALL')[] = ['ALL', 'ADMIN', 'MANAGER', 'WORKER', 'CLIENT'];
const allRoles: Role[] = ['ADMIN', 'MANAGER', 'WORKER', 'CLIENT'];

export default function UserManagement() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const [filter, setFilter] = useState<Role | 'ALL'>('ALL');
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => userApi.list() });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => userApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated'); },
    onError: () => toast.error('Could not update the user'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted'); },
    onError: () => toast.error('Could not delete the user'),
  });

  // Confirm before permanently deleting a user account.
  const askDelete = async (u: User) => {
    if (await confirm({ title: 'Delete user', message: `Delete ${u.firstName} ${u.lastName}? This cannot be undone.`, danger: true, confirmLabel: 'Delete' })) {
      remove.mutate(u.id);
    }
  };

  if (isLoading) return <PageLoader label="Loading users" />;

  const filtered = (users ?? []).filter((u) => filter === 'ALL' || u.role === filter);

  return (
    <div>
      <PageHeader title="User Directory" subtitle="Manage accounts, roles and access across the platform." />

      <div className="mb-6 flex flex-wrap gap-2">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={cn('rounded-full border px-4 py-1.5 text-xs font-medium transition-all', filter === r ? 'border-primary bg-primary text-primary-contrast' : 'border-line text-muted hover:text-content')}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-line/60 last:border-0 hover:bg-surface-2/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{initials(u.firstName, u.lastName)}</span>
                      <div>
                        <p className="font-medium text-content">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => update.mutate({ id: u.id, data: { role: e.target.value as Role } })}
                      className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs outline-none focus:border-primary"
                    >
                      {allRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => update.mutate({ id: u.id, data: { status: u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } })}>
                      <Badge tone={u.status === 'ACTIVE' ? 'emerald' : 'red'}>{u.status}</Badge>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-muted">{u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => askDelete(u)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted hover:text-red-500" aria-label="Delete"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-16 text-center text-muted"><UsersIcon size={32} className="mx-auto mb-2 opacity-50" />No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
