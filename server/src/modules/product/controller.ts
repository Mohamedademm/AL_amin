import { Request, Response, NextFunction } from 'express';
import { ProductService } from './service';
import { AppError } from '../../middleware/errorHandler';

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
      res.json({ status: 'success', data: products });
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
      const product = await ProductService.getById(req.params.id);
      if (!product) throw new AppError('Product not found', 404);
      res.json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/products
   * Creates a new product.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.create(req.body);
      res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/products/:id
   * Updates a product.
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.update(req.params.id, req.body);
      if (!product) throw new AppError('Product not found', 404);
      res.json({ status: 'success', data: product });
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
      await ProductService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
