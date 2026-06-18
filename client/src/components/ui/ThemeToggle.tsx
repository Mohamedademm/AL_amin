import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

// Animated light/dark switch backed by ThemeContext.
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-content transition-all hover:border-primary/50 hover:text-primary focus-ring',
        className,
      )}
    >
      <Sun
        size={17}
        className={cn('absolute transition-all duration-300', isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100')}
      />
      <Moon
        size={17}
        className={cn('absolute transition-all duration-300', isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0')}
      />
    </button>
  );
}

export default ThemeToggle;
