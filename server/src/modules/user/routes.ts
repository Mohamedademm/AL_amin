import { Router } from 'express';
import { UserController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate, createUserSchema, updateUserSchema } from '../../lib/validation';

const router = Router();

router.use(authenticate);

// ADMIN & MANAGER — list users (filtered by role in controller).
router.get('/', authorize(['ADMIN', 'MANAGER']), UserController.list);
router.post('/', authorize(['ADMIN', 'MANAGER']), validate(createUserSchema), UserController.create);

// ADMIN only — update and delete any user.
router.patch('/:id', authorize(['ADMIN']), validate(updateUserSchema), UserController.update);
router.delete('/:id', authorize(['ADMIN']), UserController.delete);

export default router;
