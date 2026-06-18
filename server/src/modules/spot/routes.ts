import { Router } from 'express';
import { SpotController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Anyone authenticated can read spots (needed at checkout); admins manage them.
router.use(authenticate);
router.get('/', SpotController.list);

router.use(authorize(['ADMIN', 'MANAGER']));
router.post('/', SpotController.create);
router.patch('/:id', SpotController.update);
router.delete('/:id', SpotController.delete);

export default router;
