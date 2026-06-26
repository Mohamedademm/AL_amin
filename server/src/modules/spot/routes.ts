import { Router } from "express";
import { SpotController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";
import {
  validate,
  createSpotSchema,
  updateSpotSchema,
} from "../../lib/validation";

const router = Router();

// Anyone authenticated can read spots (needed at checkout); admins manage them.
router.use(authenticate);
router.get("/", SpotController.list);

router.use(authorize(["ADMIN", "MANAGER"]));
router.post("/", validate(createSpotSchema), SpotController.create);
router.patch("/:id", validate(updateSpotSchema), SpotController.update);
router.delete("/:id", SpotController.delete);

export default router;
