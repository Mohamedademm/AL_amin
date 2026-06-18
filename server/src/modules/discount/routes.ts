import { Router } from 'express';
import { DiscountController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Pricing rules are managed by admins and managers only.
router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER']));

router.get('/', DiscountController.list);
router.post('/', DiscountController.create);
router.patch('/:id', DiscountController.setActive);
router.delete('/:id', DiscountController.remove);

export default router;
