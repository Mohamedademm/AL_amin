import { Router } from 'express';
import { InventoryController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Stock data and mutations are staff-only.
router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER', 'WORKER']));

router.get('/', InventoryController.list);
router.put('/', InventoryController.setQuantity);

export default router;
