import { Router } from "express";
import { DiscountController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";
import {
  validate,
  createDiscountSchema,
  updateDiscountSchema,
} from "../../lib/validation";

const router = Router();

// Pricing rules are managed by admins and managers only.
router.use(authenticate);
router.use(authorize(["ADMIN", "MANAGER"]));

router.get("/", DiscountController.list);
router.post("/auto-pricing", DiscountController.runAutoPricing);
router.post("/", validate(createDiscountSchema), DiscountController.create);
router.patch(
  "/:id",
  validate(updateDiscountSchema),
  DiscountController.setActive,
);
router.delete("/:id", DiscountController.remove);

export default router;
