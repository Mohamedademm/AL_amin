import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

interface SpotInput {
  name: string;
  location: string;
  address: string;
  phone?: string;
}

export const SpotService = {
  // List all vending spots (boutiques) with their stock count.
  async listAll() {
    return prisma.vendingSpot.findMany({
      include: { _count: { select: { inventory: true, orders: true } } },
      orderBy: { name: 'asc' },
    });
  },

  // Create a new vending spot.
  async create(data: SpotInput) {
    if (!data.name || !data.location || !data.address) {
      throw new AppError('name, location and address are required', 400);
    }
    return prisma.vendingSpot.create({ data });
  },

  // Update an existing vending spot.
  async update(id: string, data: Partial<SpotInput>) {
    return prisma.vendingSpot.update({ where: { id }, data });
  },

  // Delete a vending spot.
  async delete(id: string) {
    return prisma.vendingSpot.delete({ where: { id } });
  },
};
