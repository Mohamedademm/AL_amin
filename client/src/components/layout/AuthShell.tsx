import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';
import { Boxes, Route, ShieldCheck } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';

const highlights = [
  { icon: Boxes, text: 'Distributed inventory across every boutique' },
  { icon: Route, text: 'Smart routing for the fastest fulfilment' },
  { icon: ShieldCheck, text: 'Role-based access for total control' },
];

// Two-pane auth layout: emerald brand panel + the form on the right.
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(60%_50%_at_30%_0%,rgba(255,255,255,0.3),transparent_70%)]" />
        <Link to="/" className="relative">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 font-serif text-lg font-bold backdrop-blur">A</span>
            <span className="font-serif text-2xl font-bold">Al Amine</span>
          </span>
        </Link>
        <div className="relative">
          <h2 className="font-serif text-4xl font-bold leading-tight">Operational control, from warehouse to boutique.</h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-center gap-3 text-emerald-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur"><h.icon size={18} /></span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative font-mono text-xs uppercase tracking-[0.2em] text-emerald-100/70">Cyber Serif · Surgical Emerald</p>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center bg-bg p-6 sm:p-10">
        <div className="absolute right-5 top-5"><ThemeToggle /></div>
        <div className="w-full max-w-md">
          <div className="lg:hidden"><Logo size={40} /></div>
          <h1 className="mt-6 text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
