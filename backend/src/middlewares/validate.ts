import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      const primary = issues[0];
      const message = primary
        ? `Validation failed: ${primary.path || 'request'} - ${primary.message}`
        : 'Validation failed';

      next(
        new AppError(message, StatusCodes.BAD_REQUEST, {
          issues,
        }),
      );
      return;
    }

    next();
  };
};
