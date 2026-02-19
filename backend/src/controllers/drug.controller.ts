import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import * as drugService from '../services/drug.service';
import { createAuditLog } from '../services/audit.service';

const scope = (req: Request) => ({
  pharmacyId: req.user!.pharmacyId,
  branchId: req.user!.branchId,
});

export const listDrugs = asyncHandler(async (req: Request, res: Response) => {
  const drugs = await drugService.listDrugs(scope(req));
  res.status(StatusCodes.OK).json({ data: drugs });
});

export const createDrug = asyncHandler(async (req: Request, res: Response) => {
  const drug = await drugService.createDrug(scope(req), req.body);

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'CREATE_DRUG',
    entity: 'Drug',
    entityId: drug._id.toString(),
    metadata: { name: drug.name, quantity: drug.quantity },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(StatusCodes.CREATED).json({ data: drug });
});

export const updateDrug = asyncHandler(async (req: Request, res: Response) => {
  const drug = await drugService.updateDrug(scope(req), req.params.id, req.body);

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'UPDATE_DRUG',
    entity: 'Drug',
    entityId: drug._id.toString(),
    metadata: req.body,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(StatusCodes.OK).json({ data: drug });
});

export const deleteDrug = asyncHandler(async (req: Request, res: Response) => {
  await drugService.deleteDrug(scope(req), req.params.id);

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'DELETE_DRUG',
    entity: 'Drug',
    entityId: req.params.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(StatusCodes.NO_CONTENT).send();
});
