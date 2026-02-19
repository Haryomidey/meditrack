import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';
import * as saleService from '../services/sale.service';
import { createAuditLog } from '../services/audit.service';
import { broadcastPharmacyUpdate } from '../realtime/ws';

const scope = (req: Request) => ({
  pharmacyId: req.user!.pharmacyId,
  branchId: req.user!.branchId,
  actorId: req.user!.userId,
});

export const listSales = asyncHandler(async (req: Request, res: Response) => {
  const sales = await saleService.listSales(scope(req));
  res.status(StatusCodes.OK).json({ data: sales });
});

export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const sale = await saleService.createSale(scope(req), req.body);

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'CREATE_SALE',
    entity: 'Sale',
    entityId: sale._id.toString(),
    metadata: { totalRevenue: sale.totalRevenue, itemsCount: sale.items.length },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  broadcastPharmacyUpdate(req.user!.pharmacyId, { resource: 'sales', action: 'created' });
  broadcastPharmacyUpdate(req.user!.pharmacyId, { resource: 'drugs', action: 'updated' });

  res.status(StatusCodes.CREATED).json({ data: sale });
});

export const patchSale = asyncHandler(async (req: Request, res: Response) => {
  const sale = await saleService.patchSale(scope(req), req.params.id, req.body);

  await createAuditLog({
    pharmacyId: req.user!.pharmacyId,
    actorId: req.user!.userId,
    action: 'PATCH_SALE',
    entity: 'Sale',
    entityId: sale._id.toString(),
    metadata: req.body,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  broadcastPharmacyUpdate(req.user!.pharmacyId, { resource: 'sales', action: 'updated' });

  res.status(StatusCodes.OK).json({ data: sale });
});
