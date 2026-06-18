import { cn } from '../../lib/cn';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

// Brand mark: emerald gradient badge with an "A" monogram and a network node,
// nodding to Al Amine's distributed-inventory identity.
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="alamine-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="0.55" stopColor="#10B981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Rounded badge */}
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#alamine-grad)" />
      <rect x="2" y="2" width="44" height="44" rx="13" fill="white" fillOpacity="0.06" />
      {/* "A" monogram */}
      <path
        d="M24 12L34 36H29.2L27.4 31.2H20.6L18.8 36H14L24 12Z"
        fill="#04130D"
        fillOpacity="0.92"
      />
      <path d="M22.1 27.4H25.9L24 22.2L22.1 27.4Z" fill="url(#alamine-grad)" />
      {/* Network node accent */}
      <circle cx="24" cy="12" r="3.1" fill="#ECFDF5" />
      <circle cx="24" cy="12" r="1.4" fill="#047857" />
    </svg>
  );
}

// Full lockup: brand mark + "Al Amine" wordmark and a small system label.
export function Logo({ size = 40, showText = true, className, textClassName }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3 group', className)}>
      <span className="relative">
        <span className="absolute inset-0 rounded-[13px] bg-primary/40 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <LogoMark size={size} className="relative transition-transform duration-300 group-hover:scale-105" />
      </span>
      {showText && (
        <span className={cn('leading-none', textClassName)}>
          <span className="block font-serif text-xl font-bold tracking-tight text-content">
            Al Amine
          </span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-primary">
            Management System
          </span>
        </span>
      )}
    </span>
  );
}

export default Logo;
