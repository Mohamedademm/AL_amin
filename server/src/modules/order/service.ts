import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { OrderCreateInput } from './types';
import { OrderStatus, Prisma } from '@prisma/client';

// Allowed status transitions enforcing the order state machine.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['VERIFYING', 'REFUSED'],
  VERIFYING: ['ACCEPTED', 'REFUSED'],
  ACCEPTED: [],
  REFUSED: [],
};

export const OrderService = {
  // Create an order, pricing every line from the live product price server-side.
  async create(clientId: string, data: OrderCreateInput) {
    if (!data.items?.length) throw new AppError('Order must contain at least one item', 400);
    if (!data.address || !data.phone) throw new AppError('address and phone are required', 400);

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) throw new AppError('One or more products do not exist', 400);

    // Resolve a fulfillment spot: the requested one, else the first available.
    let spotId = data.spotId;
    if (!spotId) {
      const spot = await prisma.vendingSpot.findFirst();
      if (!spot) throw new AppError('No vending spot available to fulfill the order', 400);
      spotId = spot.id;
    }

    const priceMap = new Map(products.map((p) => [p.id, p.price]));
    let total = new Prisma.Decimal(0);
    const items = data.items.map((i) => {
      if (i.quantity <= 0) throw new AppError('Quantity must be greater than zero', 400);
      const price = priceMap.get(i.productId)!;
      total = total.add(price.mul(i.quantity));
      return { productId: i.productId, quantity: i.quantity, price };
    });

    return prisma.order.create({
      data: {
        clientId,
        spotId,
        address: data.address,
        phone: data.phone,
        totalAmount: total,
        status: OrderStatus.PENDING,
        items: { create: items },
      },
      include: { items: { include: { product: true } }, spot: true },
    });
  },

  // List a single client's orders (newest first).
  async listForClient(clientId: string) {
    return prisma.order.findMany({
      where: { clientId },
      include: { items: { include: { product: true } }, spot: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  // List every order in the system (staff/admin view).
  async listAll() {
    return prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        spot: true,
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Fetch a single order with all relations.
  async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        spot: true,
        client: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  },

  // Advance an order through the state machine, rejecting illegal jumps.
  async updateStatus(id: string, next: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError('Order not found', 404);

    if (!TRANSITIONS[order.status].includes(next)) {
      throw new AppError(`Cannot move order from ${order.status} to ${next}`, 400);
    }

    return prisma.order.update({
      where: { id },
      data: { status: next },
      include: { items: { include: { product: true } }, spot: true },
    });
  },
};
