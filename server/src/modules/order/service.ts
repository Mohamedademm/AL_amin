import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { OrderCreateInput } from "./types";
import { OrderStatus, Prisma } from "@prisma/client";
import { getActiveDiscounts, discountPercentFor } from "../../lib/pricing";

// Allowed status transitions enforcing the order state machine.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["VERIFYING", "SHIPPING", "REFUSED"],
  VERIFYING: ["ACCEPTED", "REFUSED"],
  ACCEPTED: ["SHIPPING"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: [],
  REFUSED: [],
};

export const OrderService = {
  // Create an order, pricing every line from the live product price server-side.
  async create(clientId: string, data: OrderCreateInput) {
    if (!data.items?.length)
      throw new AppError("Order must contain at least one item", 400);
    if (!data.address || !data.phone)
      throw new AppError("address and phone are required", 400);

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length)
      throw new AppError("One or more products do not exist", 400);

    // Smart distribution routing: prefer a boutique that can fulfil the whole
    // order from stock (LOCAL → immediate); otherwise fall back to the central
    // warehouse (REMOTE → ~2-day delivery).
    const spots = await prisma.vendingSpot.findMany({
      include: { inventory: { where: { productId: { in: productIds } } } },
    });
    if (spots.length === 0)
      throw new AppError("No vending spot available to fulfill the order", 400);

    const need = new Map(data.items.map((i) => [i.productId, i.quantity]));
    const canFulfill = (spot: (typeof spots)[number]) =>
      productIds.every((pid) => {
        const inv = spot.inventory.find((r) => r.productId === pid);
        return !!inv && inv.quantity >= (need.get(pid) ?? 0);
      });

    let chosen: (typeof spots)[number];
    let fulfilment: "LOCAL" | "REMOTE";
    let etaDays: number;

    if (data.spotId) {
      const requested = spots.find((s) => s.id === data.spotId);
      if (!requested)
        throw new AppError("Selected vending spot does not exist", 400);
      chosen = requested;
      const local = !requested.isWarehouse && canFulfill(requested);
      fulfilment = local ? "LOCAL" : "REMOTE";
      etaDays = local ? 0 : 2;
    } else {
      const boutique = spots.find((s) => !s.isWarehouse && canFulfill(s));
      if (boutique) {
        chosen = boutique;
        fulfilment = "LOCAL";
        etaDays = 0;
      } else {
        chosen = spots.find((s) => s.isWarehouse) ?? spots[0]!;
        fulfilment = "REMOTE";
        etaDays = 2;
      }
    }

    // Price each line from the live product price minus any active discount,
    // so the charged amount matches what the storefront displayed.
    const discounts = await getActiveDiscounts();
    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = new Prisma.Decimal(0);
    const items = data.items.map((i) => {
      if (i.quantity <= 0)
        throw new AppError("Quantity must be greater than zero", 400);
      const product = productMap.get(i.productId)!;
      const percent = discountPercentFor(product, discounts);
      const price =
        percent > 0 ? product.price.mul(100 - percent).div(100) : product.price;
      total = total.add(price.mul(i.quantity));
      return { productId: i.productId, quantity: i.quantity, price };
    });

    return prisma.order.create({
      data: {
        clientId,
        spotId: chosen.id,
        address: data.address,
        phone: data.phone,
        totalAmount: total,
        status: OrderStatus.PENDING,
        fulfilment,
        etaDays,
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
      orderBy: { createdAt: "desc" },
    });
  },

  // List every order in the system (staff/admin view).
  // Non-admin staff with an assigned spot only see orders for that spot.
  async listAll(assignedSpotId?: string | null) {
    return prisma.order.findMany({
      where: assignedSpotId ? { spotId: assignedSpotId } : {},
      include: {
        items: { include: { product: true } },
        spot: true,
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // Fetch a single order with all relations. Staff may see any order; clients
  // may only see their own.
  async getById(id: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        spot: true,
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
    if (!order) throw new AppError("Order not found", 404);

    const isStaff = ["ADMIN", "MANAGER", "WORKER"].includes(role);
    if (!isStaff && order.clientId !== userId) {
      throw new AppError("Forbidden: you cannot access this order", 403);
    }
    return order;
  },

  // Cancel a still-PENDING order. The owning client (or any staff) may do this.
  async cancel(userId: string, role: string, id: string) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError("Order not found", 404);

    const isStaff = ["ADMIN", "MANAGER", "WORKER"].includes(role);
    if (!isStaff && order.clientId !== userId) {
      throw new AppError("Forbidden: you cannot cancel this order", 403);
    }
    if (order.status !== "PENDING") {
      throw new AppError("Only pending orders can be cancelled", 400);
    }

    return prisma.order.update({
      where: { id },
      data: { status: OrderStatus.REFUSED },
      include: { items: { include: { product: true } }, spot: true },
    });
  },

  // Advance an order through the state machine, rejecting illegal jumps.
  // Accepting an order atomically decrements boutique stock (and fails if a
  // line can no longer be fulfilled).
  async updateStatus(id: string, next: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new AppError("Order not found", 404);

    if (!TRANSITIONS[order.status].includes(next)) {
      throw new AppError(
        `Cannot move order from ${order.status} to ${next}`,
        400,
      );
    }

    if (next === "ACCEPTED" || next === "SHIPPING") {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const key = {
            productId_spotId: {
              productId: item.productId,
              spotId: order.spotId,
            },
          };
          const stock = await tx.inventory.findUnique({ where: key });
          if (!stock || stock.quantity < item.quantity) {
            throw new AppError(
              "Insufficient stock at the boutique to accept this order",
              400,
            );
          }
          await tx.inventory.update({
            where: key,
            data: { quantity: { decrement: item.quantity } },
          });
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
