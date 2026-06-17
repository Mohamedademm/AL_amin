import { Request, Response, NextFunction } from 'express';

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

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
