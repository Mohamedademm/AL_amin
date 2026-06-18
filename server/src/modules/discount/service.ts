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
};
