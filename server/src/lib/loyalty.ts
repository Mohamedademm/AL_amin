// Gamified loyalty tiers. Cumulative accepted-order spend (lifetimeSpend) places
// each client in a tier that grants an automatic extra discount at checkout.

export interface LoyaltyTier {
  name: string;
  minSpend: number; // TND of lifetime spend required to reach this tier
  discountPercent: number; // extra % off applied on top of product/category deals
}

// Ordered low → high. `tierFor` walks this to find the highest tier reached.
export const LOYALTY_TIERS: LoyaltyTier[] = [
  { name: "BRONZE", minSpend: 0, discountPercent: 0 },
  { name: "SILVER", minSpend: 500, discountPercent: 5 },
  { name: "GOLD", minSpend: 2000, discountPercent: 10 },
  { name: "PLATINUM", minSpend: 5000, discountPercent: 15 },
];

// Highest tier a given lifetime spend qualifies for.
export function tierFor(lifetimeSpend: number): LoyaltyTier {
  let current = LOYALTY_TIERS[0]!;
  for (const t of LOYALTY_TIERS) if (lifetimeSpend >= t.minSpend) current = t;
  return current;
}

// The extra loyalty discount (%) for a spend level — 0 for BRONZE.
export function loyaltyDiscountPercent(lifetimeSpend: number): number {
  return tierFor(lifetimeSpend).discountPercent;
}

// Progress toward the next tier, for the client-facing loyalty card.
export function nextTierProgress(lifetimeSpend: number): {
  current: LoyaltyTier;
  next: LoyaltyTier | null;
  remaining: number; // TND still needed to reach `next` (0 at the top tier)
  progress: number; // 0..1 across the current band
} {
  const current = tierFor(lifetimeSpend);
  const idx = LOYALTY_TIERS.findIndex((t) => t.name === current.name);
  const next = LOYALTY_TIERS[idx + 1] ?? null;
  if (!next) return { current, next: null, remaining: 0, progress: 1 };
  const band = next.minSpend - current.minSpend;
  const into = lifetimeSpend - current.minSpend;
  return {
    current,
    next,
    remaining: Math.max(0, next.minSpend - lifetimeSpend),
    progress: band > 0 ? Math.min(1, into / band) : 1,
  };
}
