import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

/**
 * Custom Request interface to include user information after authentication.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to the request object.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token missing or invalid',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing or invalid' });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as unknown as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token',
    });
  }
};

/**
 * Middleware to restrict access based on specific roles.
 * @param allowedRoles Array of roles permitted to access the route.
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user session found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role ${req.user.role} does not have access to this resource`,
      });
    }

    next();
  };
};
