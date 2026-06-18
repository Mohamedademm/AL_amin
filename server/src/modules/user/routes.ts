import { Router } from 'express';
import { UserController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// User administration is restricted to admins.
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', UserController.list);
router.post('/', UserController.create);
router.patch('/:id', UserController.update);
router.delete('/:id', UserController.delete);

export default router;
