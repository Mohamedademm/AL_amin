import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { OrderCreateInput } from './types';
import { OrderStatus, Prisma } from '@prisma/client';
import { getActiveDiscounts, discountPercentFor } from '../../lib/pricing';

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

    // Price each line from the live product price minus any active discount,
    // so the charged amount matches what the storefront displayed.
    const discounts = await getActiveDiscounts();
    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = new Prisma.Decimal(0);
    const items = data.items.map((i) => {
      if (i.quantity <= 0) throw new AppError('Quantity must be greater than zero', 400);
      const product = productMap.get(i.productId)!;
      const percent = discountPercentFor(product, discounts);
      const price = percent > 0 ? product.price.mul(100 - percent).div(100) : product.price;
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
  // Accepting an order atomically decrements boutique stock (and fails if a
  // line can no longer be fulfilled).
  async updateStatus(id: string, next: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new AppError('Order not found', 404);

    if (!TRANSITIONS[order.status].includes(next)) {
      throw new AppError(`Cannot move order from ${order.status} to ${next}`, 400);
    }

    if (next === 'ACCEPTED') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const key = { productId_spotId: { productId: item.productId, spotId: order.spotId } };
          const stock = await tx.inventory.findUnique({ where: key });
          if (!stock || stock.quantity < item.quantity) {
            throw new AppError('Insufficient stock at the boutique to accept this order', 400);
          }
          await tx.inventory.update({ where: key, data: { quantity: { decrement: item.quantity } } });
        }
        await tx.order.update({ where: { id }, data: { status: next } });
      });
    } else {
      await prisma.order.update({ where: { id }, data: { status: next } });
    }

    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, spot: true },
    });
  },
};
