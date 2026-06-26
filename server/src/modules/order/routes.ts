import { Router } from "express";
import { OrderController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";
import {
  validate,
  createOrderSchema,
  updateOrderStatusSchema,
} from "../../lib/validation";

const router = Router();

// All order endpoints require an authenticated session.
router.use(authenticate);

router.post("/", validate(createOrderSchema), OrderController.create);
router.get("/", OrderController.list);
router.get("/:id", OrderController.getById);

// Clients can cancel their own pending order (staff may cancel any).
router.post("/:id/cancel", OrderController.cancel);

// Only internal staff can change an order's status.
router.patch(
  "/:id/status",
  authorize(["ADMIN", "MANAGER", "WORKER"]),
  validate(updateOrderStatusSchema),
  OrderController.updateStatus,
);

export default router;
