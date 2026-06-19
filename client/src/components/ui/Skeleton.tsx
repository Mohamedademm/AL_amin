import { cn } from '../../lib/cn';

// Shimmering placeholder block used for loading states.
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-2', className)} />;
}

// Loading placeholder shaped like a product card.
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
