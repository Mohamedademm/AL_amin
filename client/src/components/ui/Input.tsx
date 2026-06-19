import { type InputHTMLAttributes, forwardRef, type ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

// Labelled text input with optional leading icon, error message, and a
// show/hide toggle that appears automatically on password fields.
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, type = 'text', ...props }, ref) => {
    const inputId = id || props.name;
    const isPassword = type === 'password';
    const [visible, setVisible] = useState(false);
    const resolvedType = isPassword && visible ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-content">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn('input-base', !!icon && 'pl-11', isPassword && 'pr-11', error && 'border-red-500 focus:ring-red-500/30', className)}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-content"
              aria-label={visible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export default Input;
