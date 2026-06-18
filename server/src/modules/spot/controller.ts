import { Request, Response, NextFunction } from 'express';
import { SpotService } from './service';

export const SpotController = {
  // GET /api/spots — list every vending spot.
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ status: 'success', data: await SpotService.listAll() });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/spots — create a vending spot.
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const spot = await SpotService.create(req.body);
      res.status(201).json({ status: 'success', data: spot });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/spots/:id — update a vending spot.
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const spot = await SpotService.update((req.params.id as string), req.body);
      res.json({ status: 'success', data: spot });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/spots/:id — remove a vending spot.
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await SpotService.delete((req.params.id as string));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
