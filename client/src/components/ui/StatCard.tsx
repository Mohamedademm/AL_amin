import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  tone?: 'primary' | 'amber' | 'sky' | 'red';
}

const toneMap = {
  primary: 'bg-primary/10 text-primary',
  amber: 'bg-amber-500/10 text-amber-500',
  sky: 'bg-sky-500/10 text-sky-500',
  red: 'bg-red-500/10 text-red-500',
};

// Headline KPI tile used across the operations and admin dashboards.
export function StatCard({ label, value, icon, hint, tone = 'primary' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-glow">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 font-serif text-3xl font-bold text-content">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', toneMap[tone])}>{icon}</span>
      </div>
    </div>
  );
}

export default StatCard;
