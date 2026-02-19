import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

export const authRequired = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    next(new AppError('Unauthorized', StatusCodes.UNAUTHORIZED));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED));
  }
};
