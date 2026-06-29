import { Response, NextFunction } from "express";
import { OrderService } from "./service";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";
import { OrderStatus } from "../../generated/prisma";
import prisma from "../../config/database";
import { toCsv } from "../../lib/csv";

// Roles considered "staff" (internal operators) for order management.
const STAFF_ROLES = ["ADMIN", "MANAGER", "WORKER"];

// Resolve the spot an order list should be scoped to: admins see everything,
// other staff only their assigned boutique.
async function resolveAssignedSpot(
  userId: string,
  role: string,
): Promise<string | null | undefined> {
  if (role === "ADMIN") return undefined;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { assignedSpotId: true },
  });
  return user?.assignedSpotId;
}

export const OrderController = {
  // POST /api/orders — place a new order for the authenticated client.
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.create(req.user!.id, req.body);
      res.status(201).json({ status: "success", data: order });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders — staff see all orders (filtered by assigned spot for non-admin),
  // clients see only their own.
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isStaff = STAFF_ROLES.includes(req.user!.role);
      const orders = isStaff
        ? await OrderService.listAll(
            await resolveAssignedSpot(req.user!.id, req.user!.role),
          )
        : await OrderService.listForClient(req.user!.id);
      res.json({ status: "success", data: orders });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/export — staff download the order list as a CSV file.
  async exportCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.listAll(
        await resolveAssignedSpot(req.user!.id, req.user!.role),
      );
      const rows = orders.map((o) => ({
        id: o.id,
        date: o.createdAt.toISOString(),
        status: o.status,
        client: o.client
          ? `${o.client.firstName} ${o.client.lastName}`
          : "",
        email: o.client?.email ?? "",
        spot: o.spot?.name ?? "",
        fulfilment: o.fulfilment ?? "",
        items: o.items.reduce((n, it) => n + it.quantity, 0),
        total: Number(o.totalAmount).toFixed(2),
      }));
      const csv = toCsv(rows);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      );
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/:id — fetch one order (clients restricted to their own via service).
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getById(
        req.params.id as string,
        req.user!.id,
        req.user!.role,
      );
      res.json({ status: "success", data: order });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/:id/cancel — client (owner) or staff cancels a PENDING order.
  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.cancel(
        req.user!.id,
        req.user!.role,
        req.params.id as string,
      );
      res.json({ status: "success", data: order });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/orders/:id/status — staff move an order along the pipeline.
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body as { status: OrderStatus };
      if (!status || !Object.values(OrderStatus).includes(status)) {
        throw new AppError("A valid status is required", 400);
      }
      const order = await OrderService.updateStatus(
        req.params.id as string,
        status,
      );
      res.json({ status: "success", data: order });
    } catch (error) {
      next(error);
    }
  },
};
