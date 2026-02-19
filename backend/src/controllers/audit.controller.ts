import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import { AuditLogModel } from '../models/audit-log.model';

export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit ?? 100), 500);

  const logs = await AuditLogModel.find({
    pharmacyId: req.user!.pharmacyId,
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(StatusCodes.OK).json({ data: logs });
});
