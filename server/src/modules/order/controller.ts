import { Response, NextFunction } from "express";
import { OrderService } from "./service";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";
import { OrderStatus } from "@prisma/client";
import prisma from "../../config/database";

// Roles considered "staff" (internal operators) for order management.
const STAFF_ROLES = ["ADMIN", "MANAGER", "WORKER"];

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
      let assignedSpotId: string | null | undefined;
      if (isStaff && req.user!.role !== "ADMIN") {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { assignedSpotId: true },
        });
        assignedSpotId = user?.assignedSpotId;
      }
      const orders = isStaff
        ? await OrderService.listAll(assignedSpotId)
        : await OrderService.listForClient(req.user!.id);
      res.json({ status: "success", data: orders });
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
