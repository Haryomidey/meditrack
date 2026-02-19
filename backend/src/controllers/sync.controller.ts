import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import { processSyncQueue } from '../sync/queue-processor';
import { createAuditLog } from '../services/audit.service';

export const syncQueue = asyncHandler(async (req: Request, res: Response) => {
  const result = await processSyncQueue(
    {
      pharmacyId: req.user!.pharmacyId,
      branchId: req.user!.branchId,
      actorId: req.user!.userId,
    },
    req.body.queue,
  );

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'SYNC_QUEUE',
    entity: 'Sync',
    metadata: { processed: result.processed },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(StatusCodes.OK).json({ data: result });
});