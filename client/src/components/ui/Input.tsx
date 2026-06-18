import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

// Labelled text input with optional leading icon and error message.
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || props.name;
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
            className={cn('input-base', !!icon && 'pl-11', error && 'border-red-500 focus:ring-red-500/30', className)}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export default Input;
