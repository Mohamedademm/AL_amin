import prisma from '../config/database';
import { Prisma } from '../generated/prisma';

// Full discount shape needed to enforce maxQuantity at pricing time.
interface DiscountRule {
  id: string;
  percentage: number;
  productId: string | null;
  categoryId: string | null;
  maxQuantity: number | null;
  usedQuantity: number;
}

// Fetch discounts that are active right now, respecting the stealth window and
// the maxQuantity cap — exhausted discounts are excluded before pricing.
export async function getActiveDiscounts(): Promise<DiscountRule[]> {
  const now = new Date();
  const rows = await prisma.discount.findMany({
    where: {
      active: true,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    select: {
      id: true,
      percentage: true,
      productId: true,
      categoryId: true,
      maxQuantity: true,
      usedQuantity: true,
    },
  });
  // Exclude discounts whose quantity cap has already been hit.
  return rows.filter(
    (d) => d.maxQuantity === null || d.usedQuantity < d.maxQuantity,
  );
}

// Resolve the best applicable percentage (product-specific beats category).
// Returns the discount ID as well so the caller can track usage.
export function discountFor(
  product: { id: string; categoryId: string },
  discounts: DiscountRule[],
): { percentage: number; discountId: string | null } {
  const productLevel = discounts.filter((d) => d.productId === product.id);
  if (productLevel.length) {
    const best = productLevel.reduce((a, b) => (a.percentage >= b.percentage ? a : b));
    return { percentage: best.percentage, discountId: best.id };
  }

  const categoryLevel = discounts.filter(
    (d) => !d.productId && d.categoryId === product.categoryId,
  );
  if (categoryLevel.length) {
    const best = categoryLevel.reduce((a, b) => (a.percentage >= b.percentage ? a : b));
    return { percentage: best.percentage, discountId: best.id };
  }

  return { percentage: 0, discountId: null };
}

// Backward-compat wrapper used by callers that only need the percentage.
export function discountPercentFor(
  product: { id: string; categoryId: string },
  discounts: DiscountRule[],
): number {
  return discountFor(product, discounts).percentage;
}

// Augment a product with its discount percentage and final price (client-safe).
export function attachPricing<T extends { id: string; categoryId: string; price: Prisma.Decimal }>(
  product: T,
  discounts: DiscountRule[],
) {
  const percent = discountPercentFor(product, discounts);
  const original = Number(product.price);
  const discountedPrice = percent > 0 ? Number((original * (1 - percent / 100)).toFixed(2)) : original;
  return { ...product, discountPercent: percent, discountedPrice };
}
