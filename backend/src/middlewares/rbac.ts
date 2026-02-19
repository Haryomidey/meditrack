import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';

type Role = 'Owner' | 'Pharmacist' | 'SalesStaff';

export const requireRoles = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      next(new AppError('Forbidden', StatusCodes.FORBIDDEN));
      return;
    }

    next();
  };
};
