import { Router } from 'express';
import { CategoryController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Public access: View categories
router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Protected access: Manage categories (Admin / Manager only)
router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER']));

router.post('/', CategoryController.create);
router.patch('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
