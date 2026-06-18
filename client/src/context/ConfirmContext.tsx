import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

// Promise-based confirmation dialog replacing the native window.confirm().
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});

  const confirm = useCallback<ConfirmFn>((options) => {
    setOpts(options);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const close = (result: boolean) => {
    resolver.current(result);
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!opts} onClose={() => close(false)} title={opts?.title ?? 'Please confirm'}>
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${opts?.danger ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
            <AlertTriangle size={20} />
          </span>
          <p className="pt-1.5 text-sm text-muted">{opts?.message}</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => close(false)}>Cancel</Button>
          <Button variant={opts?.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
            {opts?.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

// Hook returning an async confirm(options) => boolean.
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
