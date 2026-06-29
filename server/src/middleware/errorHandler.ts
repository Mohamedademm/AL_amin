import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

/**
 * Custom Error class to handle operational errors with specific status codes.
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handling middleware to standardize API error responses.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Prisma errors handling
  if (err.code === 'P2002') {
    statusCode = 400;
    message = `Unique constraint violation: ${err.meta?.target || 'Field'} already exists.`;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Log the real error server-side so it is never lost...
  if (statusCode >= 500) {
    logger.error({ err, method: req.method, url: req.originalUrl }, "Unhandled server error");
  }

  // ...but never leak internal 5xx details (stack traces, DB errors) to clients
  // in production — only our explicit, safe messages reach the user.
  if (isProduction && statusCode >= 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    stack: isProduction ? undefined : err.stack,
  });
};
