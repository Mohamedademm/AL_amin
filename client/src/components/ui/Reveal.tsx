import { type ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import { cn } from '../../lib/cn';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  as?: 'div' | 'section' | 'li' | 'article';
}

// Wraps content and fades/slides it up the first time it scrolls into view.
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
