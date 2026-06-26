import { Router } from "express";
import { InventoryController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate, setInventorySchema } from "../../lib/validation";

const router = Router();

// Stock data and mutations are staff-only (ADMIN / MANAGER).
router.use(authenticate);
router.use(authorize(["ADMIN", "MANAGER"]));

router.get("/", InventoryController.list);
router.put("/", validate(setInventorySchema), InventoryController.setQuantity);

export default router;
