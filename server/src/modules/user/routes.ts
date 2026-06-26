import { Router } from "express";
import { UserController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";
import {
  validate,
  createUserSchema,
  updateUserSchema,
} from "../../lib/validation";

const router = Router();

// User administration is restricted to admins.
router.use(authenticate);
router.use(authorize(["ADMIN"]));

router.get("/", UserController.list);
router.post("/", validate(createUserSchema), UserController.create);
router.patch("/:id", validate(updateUserSchema), UserController.update);
router.delete("/:id", UserController.delete);

export default router;
