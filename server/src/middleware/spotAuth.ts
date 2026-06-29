import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';
import { AppError } from './errorHandler';

/**
 * Middleware factory that authorizes access to a vending spot.
 * - ADMIN users bypass all checks.
 * - MANAGER users can only act on spots they manage.
 *
 * @param paramName - Route parameter name holding the spot ID (default 'id')
 */
export const authorizeSpotManager = (paramName: string = 'id') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // ADMIN bypasses spot ownership checks
      if (req.user?.role === 'ADMIN') {
        return next();
      }

      // Only MANAGER role (non-ADMIN) is allowed past this point
      if (req.user?.role !== 'MANAGER') {
        throw new AppError('Only managers can modify spots', 403);
      }

      const spotId = req.params[paramName] as string | undefined;
      if (!spotId) {
        throw new AppError('Spot ID is required', 400);
      }

      const spot = await prisma.vendingSpot.findUnique({
        where: { id: spotId },
        select: { managerId: true },
      });

      if (!spot) {
        throw new AppError('Spot not found', 404);
      }

      if (spot.managerId !== req.user.id) {
        throw new AppError('You do not manage this spot', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
