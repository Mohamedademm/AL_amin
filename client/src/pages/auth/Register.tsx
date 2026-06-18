import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/layout/AuthShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join Al Amine and start shopping.">
      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" value={form.firstName} onChange={set('firstName')} icon={<User size={17} />} required />
          <Input label="Last name" value={form.lastName} onChange={set('lastName')} required />
        </div>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} icon={<Mail size={17} />} required />
        <Input label="Phone (optional)" value={form.phone} onChange={set('phone')} icon={<Phone size={17} />} />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} icon={<Lock size={17} />} required minLength={6} />
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
