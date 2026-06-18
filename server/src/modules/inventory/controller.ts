import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './service';
import { AppError } from '../../middleware/errorHandler';

export const InventoryController = {
  // GET /api/inventory — full stock matrix (optionally filtered by ?spotId).
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { spotId } = req.query as { spotId?: string };
      const data = spotId
        ? await InventoryService.listBySpot(spotId)
        : await InventoryService.listAll();
      res.json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/inventory — set the stock quantity for a product at a spot.
  async setQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, spotId, quantity } = req.body;
      if (!productId || !spotId || quantity === undefined) {
        throw new AppError('productId, spotId and quantity are required', 400);
      }
      const record = await InventoryService.setQuantity(productId, spotId, Number(quantity));
      res.json({ status: 'success', data: record });
    } catch (error) {
      next(error);
    }
  },
};
