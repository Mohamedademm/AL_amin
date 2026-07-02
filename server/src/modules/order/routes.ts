import { Router } from "express";
import { OrderController } from "./controller";
import { InvoiceService } from "./invoice";
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

// Staff-only CSV export — declared before "/:id" so "export" is not read as an id.
router.get(
  "/export",
  authorize(["ADMIN", "MANAGER", "WORKER"]),
  OrderController.exportCsv,
);

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

// Download a PDF invoice for a specific order.
// Available to the order's owner and all staff.
router.get("/:id/invoice", async (req, res, next) => {
  try {
    const user = req.user!;
    const stream = await InvoiceService.generate(req.params.id, user.id, user.role);
    const shortId = req.params.id.slice(0, 8).toUpperCase();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${shortId}.pdf"`);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;
