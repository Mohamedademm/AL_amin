import { Router } from 'express';
import { Response, NextFunction } from 'express';
import { DashboardService } from './service';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';

const router = Router();

// Dashboard metrics are staff-only.
router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER', 'WORKER']));

// GET /api/dashboard/stats — aggregated KPIs for the operations dashboards.
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: await DashboardService.getStats() });
  } catch (error) {
    next(error);
  }
});

export default router;
