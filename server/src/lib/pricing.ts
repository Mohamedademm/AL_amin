import prisma from '../config/database';
import { Prisma } from '../generated/prisma';

// Minimal shape of a discount needed to compute an effective price.
interface DiscountRule {
  percentage: number;
  productId: string | null;
  categoryId: string | null;
}

// Fetch discounts that are active right now (respecting the stealth window).
export async function getActiveDiscounts(): Promise<DiscountRule[]> {
  const now = new Date();
  return prisma.discount.findMany({
    where: {
      active: true,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    select: { percentage: true, productId: true, categoryId: true },
  });
}

// Resolve the best applicable percentage (product-specific beats category).
export function discountPercentFor(
  product: { id: string; categoryId: string },
  discounts: DiscountRule[],
): number {
  const productLevel = discounts.filter((d) => d.productId === product.id).map((d) => d.percentage);
  if (productLevel.length) return Math.max(...productLevel);

  const categoryLevel = discounts
    .filter((d) => !d.productId && d.categoryId === product.categoryId)
    .map((d) => d.percentage);
  if (categoryLevel.length) return Math.max(...categoryLevel);

  return 0;
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
