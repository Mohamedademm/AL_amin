import { Router } from 'express';
import { Response, NextFunction } from 'express';
import { AuditService } from './service';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';

const router = Router();

// The audit trail is admin-only.
router.use(authenticate);
router.use(authorize(['ADMIN']));

// GET /api/audit — recent administrative actions.
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: await AuditService.listAll() });
  } catch (error) {
    next(error);
  }
});

export default router;
