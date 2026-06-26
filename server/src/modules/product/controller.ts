import { Request, Response, NextFunction } from "express";
import { ProductService } from "./service";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";
import { ProductCreateInput } from "./types";

// Build public image URLs from uploaded files.
const imageUrlsFromFiles = (
  files: Express.Multer.File[] | undefined,
): string[] => {
  if (!files || files.length === 0) return [];
  return files.map((f) => `/uploads/products/${f.filename}`);
};

/**
 * Controller for handling Product API requests.
 */
export const ProductController = {
  /**
   * GET /api/products
   * Returns all products.
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.getAll();
      res.json({ status: "success", data: products });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/products/:id
   * Returns a specific product.
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getById(req.params.id as string);
      if (!product) throw new AppError("Product not found", 404);
      res.json({ status: "success", data: product });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/products
   * Creates a new product with optional image uploads.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const urls = imageUrlsFromFiles(req.files as Express.Multer.File[]);
      const data: ProductCreateInput = {
        name: String(req.body.name),
        description: req.body.description || undefined,
        price: Number(req.body.price),
        categoryId: String(req.body.categoryId),
        ...(urls[0] ? { imageUrl: urls[0] } : {}),
      };
      const product = await ProductService.create(data, urls);
      res.status(201).json({ status: "success", data: product });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/products/:id
   * Updates a product with optional image uploads.
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const urls = imageUrlsFromFiles(req.files as Express.Multer.File[]);
      const data: any = {
        name: req.body.name ? String(req.body.name) : undefined,
        description:
          req.body.description !== undefined
            ? req.body.description || null
            : undefined,
        price:
          req.body.price !== undefined ? Number(req.body.price) : undefined,
        categoryId: req.body.categoryId
          ? String(req.body.categoryId)
          : undefined,
        imageUrl: urls[0] || req.body.imageUrl || undefined,
      };
      // Strip undefined keys so Prisma doesn't complain.
      Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

      const product = await ProductService.update(
        req.params.id as string,
        data,
        urls,
        (req as AuthRequest).user?.id,
      );
      if (!product) throw new AppError("Product not found", 404);
      res.json({ status: "success", data: product });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/products/:id
   * Deletes a product.
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductService.delete(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
