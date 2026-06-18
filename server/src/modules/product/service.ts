import prisma from '../../config/database';
import { ProductCreateInput, ProductUpdateInput } from './types';
import { getActiveDiscounts, attachPricing } from '../../lib/pricing';
import { AuditService } from '../audit/service';

/**
 * Service handling business logic for Products.
 */
export const ProductService = {
  /**
   * Retrieves all products with their category and live discounted price.
   */
  async getAll() {
    const [products, discounts] = await Promise.all([
      prisma.product.findMany({ include: { category: true }, orderBy: { name: 'asc' } }),
      getActiveDiscounts(),
    ]);
    return products.map((p) => attachPricing(p, discounts));
  },

  /**
   * Retrieves a single product by ID with its live discounted price.
   */
  async getById(id: string) {
    const [product, discounts] = await Promise.all([
      prisma.product.findUnique({ where: { id }, include: { category: true } }),
      getActiveDiscounts(),
    ]);
    return product ? attachPricing(product, discounts) : null;
  },

  /**
   * Creates a new product.
   */
  async create(data: ProductCreateInput) {
    return prisma.product.create({ data });
  },

  /**
   * Updates a product, recording any price change in the audit trail.
   */
  async update(id: string, data: ProductUpdateInput, userId?: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    const updated = await prisma.product.update({ where: { id }, data });

    // Audit price changes for full administrative transparency.
    if (userId && existing && data.price !== undefined && Number(existing.price) !== Number(updated.price)) {
      await AuditService.log({
        userId,
        action: 'UPDATE_PRICE',
        entity: 'Product',
        entityId: id,
        oldValue: String(existing.price),
        newValue: String(updated.price),
      });
    }

    return updated;
  },

  /**
   * Deletes a product.
   */
  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};
