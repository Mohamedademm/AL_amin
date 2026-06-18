// Format a numeric/string price as Tunisian Dinar (3 decimals is local norm).
export const formatPrice = (value: string | number): string => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return `${(isNaN(n) ? 0 : n).toFixed(2)} TND`;
};

// Human-friendly date, e.g. "18 Jun 2026".
export const formatDate = (value: string | Date): string =>
  new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// Date + time, e.g. "18 Jun 2026, 14:30".
export const formatDateTime = (value: string | Date): string =>
  new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Initials for avatar fallbacks.
export const initials = (first?: string, last?: string): string =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';

// Effective price for a product: the discounted price when one applies.
export const effectivePrice = (p: { price: string | number; discountedPrice?: number }): number =>
  p.discountedPrice ?? (typeof p.price === 'string' ? parseFloat(p.price) : p.price);
