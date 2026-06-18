import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/layout/AuthShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { Role } from '../../types';

const demos = [
  { label: 'Admin', email: 'admin@alamine.com' },
  { label: 'Manager', email: 'manager@alamine.com' },
  { label: 'Worker', email: 'worker@alamine.com' },
  { label: 'Client', email: 'client@alamine.com' },
];

// Routes a user to the right landing area based on their role.
const homeForRole = (role: Role) =>
  role === 'ADMIN' ? '/admin/dashboard' : role === 'CLIENT' ? '/' : '/staff/dashboard';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(homeForRole(user.role));
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Al Amine account.">
      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" icon={<Mail size={17} />} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" icon={<Lock size={17} />} required />
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-widest text-muted">Demo accounts · password Password123!</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {demos.map((d) => (
            <button
              key={d.email}
              onClick={() => fillDemo(d.email)}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-xs font-medium text-content transition-colors hover:border-primary/50 hover:text-primary"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        No account? <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}
