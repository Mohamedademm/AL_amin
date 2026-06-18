import { cn } from '../../lib/cn';

// Lightweight emerald loading spinner.
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

// Full-area centered loading state.
export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-muted">
      <Spinner className="h-8 w-8" />
      <p className="font-mono text-xs uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}

export default Spinner;
