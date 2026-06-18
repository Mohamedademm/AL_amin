import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] whitespace-nowrap';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-contrast hover:bg-primary-strong shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-glow',
  secondary: 'bg-surface-2 text-content hover:bg-line border border-line',
  outline: 'border border-line text-content hover:border-primary hover:text-primary bg-transparent',
  ghost: 'text-content hover:bg-surface-2',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_14px_rgba(239,68,68,0.3)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-xs px-3.5 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-7 py-3.5',
};

// Shared class builder so links can be styled to match buttons too.
export const buttonClasses = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) =>
  cn(base, variants[variant], sizes[size], className);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// Primary interactive button with variant + size styling.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />
  ),
);
Button.displayName = 'Button';

export default Button;
