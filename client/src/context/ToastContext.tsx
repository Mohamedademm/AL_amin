import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/cn';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; type: ToastType; message: string }

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const config: Record<ToastType, { icon: typeof Info; cls: string }> = {
  success: { icon: CheckCircle2, cls: 'border-primary/30 text-primary' },
  error: { icon: XCircle, cls: 'border-red-500/30 text-red-500' },
  info: { icon: Info, cls: 'border-sky-500/30 text-sky-500' },
};

let counter = 0;

// App-wide toast notifications (bottom-right stack, auto-dismiss).
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++counter;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => remove(id), 3800);
  }, [remove]);

  const value: ToastContextValue = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const { icon: Icon, cls } = config[t.type];
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-card-dark animate-scale-in',
                cls,
              )}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm text-content">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-muted hover:text-content" aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// Hook to fire toast notifications.
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
