import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/layout/AuthShell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import type { Role } from "../../types";

// Absolute API origin so OAuth works across the two *.vercel.app domains.
const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`;

const demos = [
  { label: "Admin", email: "admin@alamine.com" },
  { label: "Manager", email: "manager@alamine.com" },
  { label: "Worker", email: "worker@alamine.com" },
  { label: "Client", email: "client@alamine.com" },
];

// Routes a user to the right landing area based on their role.
const homeForRole = (role: Role) =>
  role === "ADMIN"
    ? "/admin/dashboard"
    : role === "CLIENT"
      ? "/"
      : "/staff/dashboard";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(homeForRole(user.role));
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Al Amine account."
    >
      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<Mail size={17} />}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={<Lock size={17} />}
          required
        />
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg px-2 text-muted">Or continue with</span>
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
        Sign in with Google
      </a>

      <div className="mt-6">
        <p className="text-center font-mono text-[11px] uppercase tracking-widest text-muted">
          Demo accounts · password Password123!
        </p>
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
        No account?{" "}
        <Link
          to="/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
