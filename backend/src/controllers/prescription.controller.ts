import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import * as prescriptionService from '../services/prescription.service';
import { createAuditLog } from '../services/audit.service';

const scope = (req: Request) => ({
  pharmacyId: req.user!.pharmacyId,
  branchId: req.user!.branchId,
  actorId: req.user!.userId,
});

export const listPrescriptions = asyncHandler(async (req: Request, res: Response) => {
  const prescriptions = await prescriptionService.listPrescriptions(scope(req));
  res.status(StatusCodes.OK).json({ data: prescriptions });
});

export const createPrescription = asyncHandler(async (req: Request, res: Response) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  const record = await prescriptionService.createPrescription(scope(req), {
    ...req.body,
    imageUrl,
  });

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'CREATE_PRESCRIPTION',
    entity: 'Prescription',
    entityId: record._id.toString(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(StatusCodes.CREATED).json({ data: record });
});

export const updatePrescription = asyncHandler(async (req: Request, res: Response) => {
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  const record = await prescriptionService.updatePrescription(scope(req), req.params.id, {
    ...req.body,
    ...(imageUrl ? { imageUrl } : {}),
  });

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'UPDATE_PRESCRIPTION',
    entity: 'Prescription',
    entityId: record._id.toString(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(StatusCodes.OK).json({ data: record });
});

export const deletePrescription = asyncHandler(async (req: Request, res: Response) => {
  await prescriptionService.deletePrescription(scope(req), req.params.id);

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'DELETE_PRESCRIPTION',
    entity: 'Prescription',
    entityId: req.params.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(StatusCodes.NO_CONTENT).send();
});
