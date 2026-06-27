import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { Request, Response, NextFunction } from "express";

// ─── Legacy helpers (defense-in-depth for non-HTTP call sites) ───

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertEmail(email: string) {
  if (!EMAIL_RE.test(email))
    throw new AppError("A valid email address is required", 400);
}

export function assertPasswordStrength(password: string) {
  if (typeof password !== "string" || password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError(
      "Password must contain at least one letter and one number",
      400,
    );
  }
}

// ─── Middleware factory ──────────────────────────────────────────

export const validate =
  (schema: z.ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return next(new AppError(message, 400));
    }
    // Replace with parsed (and coerced) data so downstream code gets clean values.
    req[source] = result.data;
    next();
  };

// ─── Auth ────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().max(20).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/, "Must contain at least one letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .optional(),
});

// ─── User management (admin) ─────────────────────────────────────

const roleSchema = z.enum(["ADMIN", "MANAGER", "WORKER", "CLIENT"]);

export const createUserSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional().nullable(),
  role: roleSchema,
  assignedSpotId: z.string().uuid().optional().nullable(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  role: roleSchema.optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  assignedSpotId: z.string().uuid().optional().nullable(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/)
    .optional(),
});

// ─── Products ────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().positive("Price must be positive"),
  categoryId: z.string().uuid("Valid category ID is required"),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().positive().optional(),
  categoryId: z.string().uuid().optional(),
});

// ─── Categories ──────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().max(500).optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

// ─── Orders ──────────────────────────────────────────────────────

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
  address: z.string().min(1, "Address is required").max(500),
  phone: z.string().min(1, "Phone is required").max(20),
  spotId: z.string().uuid().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "VERIFYING",
    "ACCEPTED",
    "SHIPPING",
    "DELIVERED",
    "REFUSED",
  ]),
});

// ─── Vending Spots ───────────────────────────────────────────────

export const createSpotSchema = z.object({
  name: z.string().min(1, "Spot name is required").max(100),
  location: z.string().min(1, "Location is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  phone: z.string().max(20).optional().nullable(),
});

export const updateSpotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  location: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(500).optional(),
  phone: z.string().max(20).optional().nullable(),
});

// ─── Inventory ───────────────────────────────────────────────────

export const setInventorySchema = z.object({
  productId: z.string().uuid(),
  spotId: z.string().uuid(),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});

// ─── Discounts ───────────────────────────────────────────────────

export const createDiscountSchema = z.object({
  percentage: z.number().int().min(1, "Minimum 1%").max(90, "Maximum 90%"),
  scope: z.enum(["CATEGORY", "PRODUCT"]),
  categoryId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  endsAt: z.string().optional(),
  maxQuantity: z.number().int().positive().optional(),
});

export const updateDiscountSchema = z.object({
  active: z.boolean(),
});

// ─── UUID param validator ────────────────────────────────────────

export const uuidParamSchema = z.object({
  id: z.string().uuid("Valid ID is required"),
});

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
