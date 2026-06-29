import { Response, NextFunction } from 'express';
import { UserService } from './service';
import { AuthRequest } from '../../middleware/auth';
import { RoleName } from '../../generated/prisma';

export const UserController = {
  // GET /api/users — list users, optional ?role= filter.
  // ADMIN sees all; MANAGER sees only users in their managed spot.
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as RoleName | undefined;

      if (req.user!.role === 'ADMIN') {
        const users = await UserService.listAll(role);
        return res.json({ status: 'success', data: users });
      }

      // MANAGER — only list staff in their spot.
      const users = await UserService.listByManagedSpot(req.user!.id, role);
      return res.json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/users — admin creates any staff; manager creates WORKER only.
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createStaff(req.body, req.user!);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/users/:id — update role, status or profile.
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.update(req.params.id as string, req.body);
      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/users/:id — remove an account.
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await UserService.delete(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
