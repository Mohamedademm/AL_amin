import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

// Elevated surface container used across dashboards, lists and forms.
export function Card({ hover = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'card-surface',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow',
        className,
      )}
      {...props}
    />
  );
}

export default Card;
