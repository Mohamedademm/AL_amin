import { Router } from 'express';
import { ProductController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Public access: View products
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Protected access: Manage products (Admin / Manager only)
router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER']));

router.post('/', ProductController.create);
router.patch('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
