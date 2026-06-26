import { Router } from "express";
import { ProductController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";
import { upload } from "../../config/upload";
import {
  validate,
  createProductSchema,
  updateProductSchema,
} from "../../lib/validation";

const router = Router();

// Public access: View products
router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);

// Protected access: Manage products (Admin / Manager only)
router.use(authenticate);
router.use(authorize(["ADMIN", "MANAGER"]));

router.post(
  "/",
  upload.array("images", 5),
  validate(createProductSchema),
  ProductController.create,
);
router.patch(
  "/:id",
  upload.array("images", 5),
  validate(updateProductSchema),
  ProductController.update,
);
router.delete("/:id", ProductController.delete);

export default router;
