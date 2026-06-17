import { Router } from 'express';
import { ProductController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Public access: View products
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Protected access: Manage products (Staff/Admin only)
router.use(authenticate);
router.use(authorize(['STAFF', 'ADMIN']));

router.post('/', ProductController.create);
router.patch('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
