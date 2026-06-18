import { Router } from 'express';
import { OrderController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// All order endpoints require an authenticated session.
router.use(authenticate);

router.post('/', OrderController.create);
router.get('/', OrderController.list);
router.get('/:id', OrderController.getById);

// Only internal staff can change an order's status.
router.patch('/:id/status', authorize(['ADMIN', 'MANAGER', 'WORKER']), OrderController.updateStatus);

export default router;
