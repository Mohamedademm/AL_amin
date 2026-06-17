import prisma from '../../config/database';
import { ProductCreateInput, ProductUpdateInput } from './types';

/**
 * Service handling business logic for Products.
 */
export const ProductService = {
  /**
   * Retrieves all products with their category details.
   */
  async getAll() {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Retrieves a single product by ID.
   */
  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  /**
   * Creates a new product.
   */
  async create(data: ProductCreateInput) {
    return prisma.product.create({ data });
  },

  /**
   * Updates an existing product.
   */
  async update(id: string, data: ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a product.
   */
  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};
