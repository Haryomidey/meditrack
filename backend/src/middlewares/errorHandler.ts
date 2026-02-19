import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  const appError = err instanceof AppError ? err : new AppError('Internal server error', 500);

  logger.error('request_failed', {
    method: req.method,
    path: req.originalUrl,
    status: appError.statusCode,
    message: appError.message,
    details: appError.details,
  });

  res.status(appError.statusCode).json({
    message: appError.message,
    details: appError.details,
  });
};
