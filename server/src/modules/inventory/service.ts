import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const InventoryService = {
  // List every stock record across all spots, with product + spot detail.
  async listAll() {
    return prisma.inventory.findMany({
      include: { product: { include: { category: true } }, spot: true },
      orderBy: { updatedAt: 'desc' },
    });
  },

  // List stock for a single vending spot.
  async listBySpot(spotId: string) {
    return prisma.inventory.findMany({
      where: { spotId },
      include: { product: { include: { category: true } }, spot: true },
    });
  },

  // Set the absolute stock quantity for a product at a spot (creates if missing).
  async setQuantity(productId: string, spotId: string, quantity: number) {
    if (quantity < 0) throw new AppError('Quantity cannot be negative', 400);
    return prisma.inventory.upsert({
      where: { productId_spotId: { productId, spotId } },
      update: { quantity },
      create: { productId, spotId, quantity },
      include: { product: true, spot: true },
    });
  },
};
