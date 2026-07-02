import { Response, NextFunction } from 'express';
import { DiscountService } from './service';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

export const DiscountController = {
  // GET /api/discounts — list all pricing rules (staff view).
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({ status: 'success', data: await DiscountService.listAll() });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/discounts — create a category/product discount.
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const discount = await DiscountService.create(req.user!.id, req.body);
      res.status(201).json({ status: 'success', data: discount });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/discounts/:id — enable/disable a discount.
  async setActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (typeof req.body.active !== 'boolean') throw new AppError('active (boolean) is required', 400);
      const updated = await DiscountService.setActive(req.user!.id, req.params.id as string, req.body.active);
      res.json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/discounts/:id — remove a discount.
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await DiscountService.remove(req.user!.id, req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // POST /api/discounts/auto-pricing — run the overstock-liquidation engine.
  async runAutoPricing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await DiscountService.runAutoPricing(req.user!.id);
      res.json({ status: 'success', data: summary });
    } catch (error) {
      next(error);
    }
  },
};
