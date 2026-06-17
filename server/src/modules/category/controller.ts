import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './service';
import { AppError } from '../../middleware/errorHandler';

/**
 * Controller for handling Category API requests.
 */
export const CategoryController = {
  /**
   * GET /api/categories
   * Returns all categories.
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAll();
      res.json({ status: 'success', data: categories });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/categories/:id
   * Returns a specific category.
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getById(req.params.id);
      if (!category) throw new AppError('Category not found', 404);
      res.json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/categories
   * Creates a new category.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.create(req.body);
      res.status(201).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/categories/:id
   * Updates a category.
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.update(req.params.id, req.body);
      if (!category) throw new AppError('Category not found', 404);
      res.json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/categories/:id
   * Deletes a category.
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
