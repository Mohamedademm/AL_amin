import prisma from '../../config/database';
import { CategoryCreateInput, CategoryUpdateInput } from './types';

/**
 * Service handling business logic for Categories.
 */
export const CategoryService = {
  /**
   * Retrieves all categories.
   */
  async getAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Retrieves a single category by ID.
   */
  async getById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  /**
   * Creates a new category.
   */
  async create(data: CategoryCreateInput) {
    return prisma.category.create({ data });
  },

  /**
   * Updates an existing category.
   */
  async update(id: string, data: CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a category.
   */
  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
