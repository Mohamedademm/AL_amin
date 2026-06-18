import { Link } from 'react-router-dom';
import { Mail, Phone, Shield, Calendar, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { buttonClasses } from '../../components/ui/Button';
import { formatDate, initials } from '../../utils/format';

export default function Profile() {
  const { user, logout } = useAuth();
  if (!user) return null;

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
          <h3 className="text-lg font-semibold">Account information</h3>
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
    </div>
  );
}
