import { Router } from 'express';
import { SpotController } from './controller';
import { authenticate, authorize } from '../../middleware/auth';
import { authorizeSpotManager } from '../../middleware/spotAuth';
import { validate, createSpotSchema, updateSpotSchema } from '../../lib/validation';

const router = Router();

// Anyone authenticated can read spots (needed at checkout).
router.use(authenticate);
router.get('/', SpotController.list);

// ADMIN only — create, delete.
router.post('/', authorize(['ADMIN']), validate(createSpotSchema), SpotController.create);
router.delete('/:id', authorize(['ADMIN']), authorizeSpotManager('id'), SpotController.delete);

// ADMIN or MANAGER who owns the spot — update.
router.patch('/:id', authorize(['ADMIN', 'MANAGER']), authorizeSpotManager('id'), validate(updateSpotSchema), SpotController.update);

export default router;
