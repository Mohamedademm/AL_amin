import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuditService } from '../audit/service';

interface DiscountInput {
  percentage: number;
  scope: 'CATEGORY' | 'PRODUCT';
  categoryId?: string;
  productId?: string;
  endsAt?: string; // stealth
  maxQuantity?: number; // stealth
}

export const DiscountService = {
  // List every discount with its target name (admin/manager view, full detail).
  async listAll() {
    return prisma.discount.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        product: { select: { name: true } },
      },
    });
  },

  // Create a discount and record the action in the audit trail.
  async create(userId: string, data: DiscountInput) {
    if (!data.percentage || data.percentage < 1 || data.percentage > 90) {
      throw new AppError('percentage must be between 1 and 90', 400);
    }
    const isCategory = data.scope === 'CATEGORY';
    if (isCategory && !data.categoryId) throw new AppError('categoryId is required for a category discount', 400);
    if (!isCategory && !data.productId) throw new AppError('productId is required for a product discount', 400);

    const discount = await prisma.discount.create({
      data: {
        percentage: data.percentage,
        categoryId: isCategory ? (data.categoryId ?? null) : null,
        productId: isCategory ? null : (data.productId ?? null),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        maxQuantity: data.maxQuantity ?? null,
      },
    });

    await AuditService.log({
      userId,
      action: 'DISCOUNT_APPLIED',
      entity: 'Discount',
      entityId: discount.id,
      newValue: JSON.stringify({ percentage: discount.percentage, scope: data.scope }),
    });

    return discount;
  },

  // Toggle a discount on/off (audited).
  async setActive(userId: string, id: string, active: boolean) {
    const updated = await prisma.discount.update({ where: { id }, data: { active } });
    await AuditService.log({
      userId,
      action: active ? 'DISCOUNT_ENABLED' : 'DISCOUNT_DISABLED',
      entity: 'Discount',
      entityId: id,
    });
    return updated;
  },

  // Remove a discount (audited).
  async remove(userId: string, id: string) {
    await prisma.discount.delete({ where: { id } });
    await AuditService.log({ userId, action: 'DISCOUNT_REMOVED', entity: 'Discount', entityId: id });
  },

  // Auto-pricing pass: liquidate overstock by auto-creating a clearance discount
  // for products whose total stock crosses a threshold, and retire that discount
  // once stock normalises. Only ever touches discounts it owns (`auto: true`),
  // so manual pricing is never disturbed. Idempotent — safe to run repeatedly.
  async runAutoPricing(userId: string) {
    const OVERSTOCK_UNITS = 80; // total units across spots that counts as overstock
    const CLEARANCE_PERCENT = 20; // discount applied to liquidate overstock

    // Total stock per product, and the products' current auto-discount (if any).
    const [stockByProduct, autoDiscounts] = await Promise.all([
      prisma.inventory.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
      }),
      prisma.discount.findMany({
        where: { auto: true, productId: { not: null } },
      }),
    ]);

    const autoByProduct = new Map(autoDiscounts.map((d) => [d.productId!, d]));
    const created: string[] = [];
    const retired: string[] = [];

    for (const row of stockByProduct) {
      const total = row._sum.quantity ?? 0;
      const existing = autoByProduct.get(row.productId);
      const overstocked = total >= OVERSTOCK_UNITS;

      if (overstocked && !(existing && existing.active)) {
        // Reactivate a dormant auto-discount, or create a fresh one.
        if (existing) {
          await prisma.discount.update({
            where: { id: existing.id },
            data: { active: true, percentage: CLEARANCE_PERCENT },
          });
        } else {
          await prisma.discount.create({
            data: {
              percentage: CLEARANCE_PERCENT,
              productId: row.productId,
              auto: true,
            },
          });
        }
        created.push(row.productId);
      } else if (!overstocked && existing && existing.active) {
        // Stock back to normal → retire the clearance discount.
        await prisma.discount.update({
          where: { id: existing.id },
          data: { active: false },
        });
        retired.push(row.productId);
      }
    }

    await AuditService.log({
      userId,
      action: 'AUTO_PRICING_RUN',
      entity: 'Discount',
      entityId: 'auto',
      newValue: JSON.stringify({
        created: created.length,
        retired: retired.length,
        thresholdUnits: OVERSTOCK_UNITS,
        clearancePercent: CLEARANCE_PERCENT,
      }),
    });

    return {
      evaluated: stockByProduct.length,
      created: created.length,
      retired: retired.length,
      thresholdUnits: OVERSTOCK_UNITS,
      clearancePercent: CLEARANCE_PERCENT,
    };
  },
};
