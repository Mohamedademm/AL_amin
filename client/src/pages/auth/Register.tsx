import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/layout/AuthShell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

// Absolute API origin so OAuth works across the two *.vercel.app domains.
const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Could not create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Al Amine and start shopping."
    >
      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            value={form.firstName}
            onChange={set("firstName")}
            icon={<User size={17} />}
            required
          />
          <Input
            label="Last name"
            value={form.lastName}
            onChange={set("lastName")}
            required
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
          icon={<Mail size={17} />}
          required
        />
        <Input
          label="Phone (optional)"
          value={form.phone}
          onChange={set("phone")}
          icon={<Phone size={17} />}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={set("password")}
          icon={<Lock size={17} />}
          required
          minLength={6}
        />
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg px-2 text-muted">Or sign up with</span>
        </div>
      </div>

      <a
        href={GOOGLE_AUTH_URL}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-content transition-colors hover:bg-surface-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign up with Google
      </a>
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
