import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import * as supplierService from '../services/supplier.service';
import { createAuditLog } from '../services/audit.service';
import { broadcastPharmacyUpdate } from '../realtime/ws';

const scope = (req: Request) => ({
  pharmacyId: req.user!.pharmacyId,
  branchId: req.user!.branchId,
});

export const listSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const suppliers = await supplierService.listSuppliers(scope(req));
  res.status(StatusCodes.OK).json({ data: suppliers });
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.createSupplier(scope(req), req.body);

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'CREATE_SUPPLIER',
    entity: 'Supplier',
    entityId: supplier._id.toString(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  broadcastPharmacyUpdate(req.user!.pharmacyId, { resource: 'suppliers', action: 'created' });

  res.status(StatusCodes.CREATED).json({ data: supplier });
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.updateSupplier(scope(req), req.params.id, req.body);

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'UPDATE_SUPPLIER',
    entity: 'Supplier',
    entityId: supplier._id.toString(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  broadcastPharmacyUpdate(req.user!.pharmacyId, { resource: 'suppliers', action: 'updated' });

  res.status(StatusCodes.OK).json({ data: supplier });
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  await supplierService.deleteSupplier(scope(req), req.params.id);

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'DELETE_SUPPLIER',
    entity: 'Supplier',
    entityId: req.params.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  broadcastPharmacyUpdate(req.user!.pharmacyId, { resource: 'suppliers', action: 'deleted' });

  res.status(StatusCodes.NO_CONTENT).send();
});
