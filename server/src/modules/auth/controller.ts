import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

export const AuthController = {
  // POST /api/auth/register — self-service client signup.
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      if (!email || !password || !firstName || !lastName) {
        throw new AppError('email, password, firstName and lastName are required', 400);
      }
      const result = await AuthService.register({ email, password, firstName, lastName, phone });
      res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/login — exchange credentials for a JWT.
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw new AppError('email and password are required', 400);
      const result = await AuthService.login({ email, password });
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me — return the profile of the authenticated user.
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.me(req.user!.id);
      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  },
};
