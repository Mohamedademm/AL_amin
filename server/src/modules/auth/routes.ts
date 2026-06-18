import { Router } from 'express';
import { AuthController } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Public authentication endpoints.
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Authenticated session endpoint.
router.get('/me', authenticate, AuthController.me);

export default router;
