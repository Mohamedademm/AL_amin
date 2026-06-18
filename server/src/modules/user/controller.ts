import { Request, Response, NextFunction } from 'express';
import { UserService } from './service';
import { RoleName } from '@prisma/client';

export const UserController = {
  // GET /api/users — list users, optional ?role= filter.
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const role = req.query.role as RoleName | undefined;
      res.json({ status: 'success', data: await UserService.listAll(role) });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/users — admin creates a staff/admin account.
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createStaff(req.body);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/users/:id — update role, status or profile.
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.update((req.params.id as string), req.body);
      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/users/:id — remove an account.
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.delete((req.params.id as string));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
