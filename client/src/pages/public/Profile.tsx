import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Shield, Calendar, Package, Pencil, KeyRound, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, buttonClasses } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { formatDate, initials } from '../../utils/format';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [edit, setEdit] = useState({ firstName: '', lastName: '', phone: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const openEdit = () => { setEdit({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' }); setError(''); setEditOpen(true); };
  const openPw = () => { setPw({ currentPassword: '', newPassword: '' }); setError(''); setPwOpen(true); };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await updateProfile(edit);
      setEditOpen(false);
      toast.success('Profile updated');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not update your profile.');
    } finally { setBusy(false); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await updateProfile(pw);
      setPwOpen(false);
      toast.success('Password changed');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not change your password.');
    } finally { setBusy(false); }
  };

  const rows = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone || '—' },
    { icon: Shield, label: 'Role', value: user.role },
    { icon: Calendar, label: 'Member since', value: user.createdAt ? formatDate(user.createdAt) : '—' },
  ];

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-bold">Your Profile</h1>
      <p className="mt-2 text-muted">Manage your account details and preferences.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-6 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 text-2xl font-bold text-primary">
            {initials(user.firstName, user.lastName)}
          </span>
          <h2 className="mt-4 text-xl font-semibold">{user.firstName} {user.lastName}</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">{user.role}</p>
          <Link to="/orders" className={buttonClasses('outline', 'md', 'mt-6 w-full')}>
            <Package size={16} /> My orders
          </Link>
          <Button variant="ghost" className="mt-2 w-full text-red-500 hover:bg-red-500/10" onClick={logout}>
            Log out
          </Button>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Account information</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={openEdit}><Pencil size={15} /> Edit</Button>
              <Button size="sm" variant="ghost" onClick={openPw}><KeyRound size={15} /> Password</Button>
            </div>
          </div>
          <div className="mt-5 divide-y divide-line">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center gap-4 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-primary">
                  <r.icon size={18} />
                </span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted">{r.label}</p>
                  <p className="text-content">{r.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit profile modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile">
        <form onSubmit={saveProfile} className="space-y-4">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={edit.firstName} onChange={(e) => setEdit({ ...edit, firstName: e.target.value })} required />
            <Input label="Last name" value={edit.lastName} onChange={(e) => setEdit({ ...edit, lastName: e.target.value })} required />
          </div>
          <Input label="Phone" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} icon={<Phone size={17} />} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Change password modal */}
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Change password">
        <form onSubmit={savePassword} className="space-y-4">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
          <Input label="Current password" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} icon={<Lock size={17} />} required />
          <Input label="New password" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} icon={<KeyRound size={17} />} required minLength={8} placeholder="≥ 8 chars, 1 letter + 1 number" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
