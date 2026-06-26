import { cn } from "../../lib/cn";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

// Brand mark: company logo image — magenta "A" monogram with network node accent.
export function LogoMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/logo.png"
      alt="Al Amine"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

// Full lockup: brand mark + "Al Amine" wordmark and a small system label.
export function Logo({
  size = 40,
  showText = true,
  className,
  textClassName,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3 group", className)}>
      <span className="relative">
        <span className="absolute inset-0 rounded-[13px] bg-primary/40 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <LogoMark
          size={size}
          className="relative transition-transform duration-300 group-hover:scale-105"
        />
      </span>
      {showText && (
        <span className={cn("leading-none", textClassName)}>
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
