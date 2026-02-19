import crypto from 'crypto';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { SyncRecordModel } from '../models/sync-record.model';
import { DrugModel } from '../models/drug.model';
import { createSale } from '../services/sale.service';
import { updateDrug } from '../services/drug.service';
import { createPrescription, deletePrescription, updatePrescription } from '../services/prescription.service';
import { SyncQueueItem, SyncResultItem } from './types';

interface SyncScope {
  pharmacyId: string;
  branchId?: string;
  actorId: string;
}

const buildOpKey = (item: SyncQueueItem): string => {
  if (item.opKey) return item.opKey;

  const hashInput = JSON.stringify({
    type: item.type,
    data: item.data,
    timestamp: item.timestamp,
    deviceId: item.deviceId,
  });

  return crypto.createHash('sha256').update(hashInput).digest('hex');
};

const stockScope = (scope: SyncScope) => ({
  pharmacyId: new Types.ObjectId(scope.pharmacyId),
  ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
});

export const processSyncQueue = async (scope: SyncScope, queue: SyncQueueItem[]) => {
  const ordered = [...queue].sort((a, b) => a.timestamp - b.timestamp);
  const results: SyncResultItem[] = [];
  const touchedDrugIds = new Set<string>();

  for (const item of ordered) {
    const opKey = buildOpKey(item);

    const duplicate = await SyncRecordModel.findOne({
      pharmacyId: new Types.ObjectId(scope.pharmacyId),
      deviceId: item.deviceId,
      opKey,
    });

    if (duplicate) {
      results.push({
        opKey,
        type: item.type,
        status: 'duplicate',
        result: duplicate.result,
      });
      continue;
    }

    try {
      let result: Record<string, unknown> = {};

      if (item.type === 'SALE') {
        const payload = item.data as {
          items: Array<{ drugId: string; quantity: number }>;
          paymentMethod: 'Cash' | 'POS' | 'Transfer';
        };

        const sale = await createSale(scope, {
          items: payload.items,
          paymentMethod: payload.paymentMethod,
          timestamp: new Date(item.timestamp).toISOString(),
          deviceId: item.deviceId,
        });

        for (const saleItem of sale.items) {
          touchedDrugIds.add(saleItem.drugId.toString());
        }

        result = { saleId: sale._id.toString() };
      }

      if (item.type === 'DRUG_UPDATE') {
        const payload = item.data as {
          drugId: string;
          expectedQuantity?: number;
          quantity?: number;
          delta?: number;
          name?: string;
          category?: string;
          batchNumber?: string;
          expiryDate?: string;
          costPrice?: number;
          sellingPrice?: number;
          supplierName?: string;
          lowStockThreshold?: number;
        };

        const current = await DrugModel.findOne({
          ...stockScope(scope),
          _id: new Types.ObjectId(payload.drugId),
        });

        if (!current) {
          throw new AppError('Drug not found for sync', StatusCodes.NOT_FOUND);
        }

        if (
          typeof payload.expectedQuantity === 'number' &&
          current.quantity !== payload.expectedQuantity
        ) {
          throw new AppError('Stock conflict detected', StatusCodes.CONFLICT, {
            drugId: current._id,
            expectedQuantity: payload.expectedQuantity,
            serverQuantity: current.quantity,
          });
        }

        const nextQuantity =
          typeof payload.quantity === 'number'
            ? payload.quantity
            : typeof payload.delta === 'number'
              ? current.quantity + payload.delta
              : current.quantity;

        if (nextQuantity < 0) {
          throw new AppError('Stock cannot become negative', StatusCodes.CONFLICT, {
            drugId: current._id,
            serverQuantity: current.quantity,
            attemptedQuantity: nextQuantity,
          });
        }

        const drug = await updateDrug(scope, payload.drugId, {
          name: payload.name,
          category: payload.category,
          batchNumber: payload.batchNumber,
          expiryDate: payload.expiryDate,
          costPrice: payload.costPrice,
          sellingPrice: payload.sellingPrice,
          supplierName: payload.supplierName,
          lowStockThreshold: payload.lowStockThreshold,
          quantity: nextQuantity,
        });

        touchedDrugIds.add(drug._id.toString());
        result = { drugId: drug._id.toString(), quantity: drug.quantity };
      }

      if (item.type === 'PRESCRIPTION') {
        const payload = item.data as {
          action: 'create' | 'update' | 'delete';
          prescriptionId?: string;
          patientName?: string;
          drugs?: Array<{ drugId: string; name: string; quantity: number; dosage: string }>;
          dosageInstructions?: string;
          prescribingDoctor?: string;
          refillReminder?: boolean;
          nextRefillDate?: string;
          imageUrl?: string;
        };

        if (payload.action === 'create') {
          const rx = await createPrescription(scope, {
            patientName: payload.patientName ?? 'Unknown',
            drugs: payload.drugs ?? [],
            dosageInstructions: payload.dosageInstructions ?? '',
            prescribingDoctor: payload.prescribingDoctor ?? 'Unknown',
            refillReminder: payload.refillReminder ?? true,
            nextRefillDate: payload.nextRefillDate,
            imageUrl: payload.imageUrl,
            timestamp: new Date(item.timestamp).toISOString(),
          });
          result = { prescriptionId: rx._id.toString() };
        }

        if (payload.action === 'update') {
          if (!payload.prescriptionId) {
            throw new AppError('prescriptionId is required for update', StatusCodes.BAD_REQUEST);
          }

          const rx = await updatePrescription(scope, payload.prescriptionId, {
            patientName: payload.patientName,
            drugs: payload.drugs,
            dosageInstructions: payload.dosageInstructions,
            prescribingDoctor: payload.prescribingDoctor,
            refillReminder: payload.refillReminder,
            nextRefillDate: payload.nextRefillDate,
            imageUrl: payload.imageUrl,
          });
          result = { prescriptionId: rx._id.toString() };
        }

        if (payload.action === 'delete') {
          if (!payload.prescriptionId) {
            throw new AppError('prescriptionId is required for delete', StatusCodes.BAD_REQUEST);
          }

          await deletePrescription(scope, payload.prescriptionId);
          result = { prescriptionId: payload.prescriptionId };
        }
      }

      await SyncRecordModel.create({
        pharmacyId: new Types.ObjectId(scope.pharmacyId),
        ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
        deviceId: item.deviceId,
        opKey,
        type: item.type,
        timestamp: new Date(item.timestamp),
        status: 'applied',
        result,
      });

      results.push({ opKey, type: item.type, status: 'applied', result });
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Sync item failed');

      const status = appError.statusCode === StatusCodes.CONFLICT ? 'conflict' : 'failed';
      const result = {
        message: appError.message,
        details: appError.details as Record<string, unknown> | undefined,
      };

      await SyncRecordModel.create({
        pharmacyId: new Types.ObjectId(scope.pharmacyId),
        ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
        deviceId: item.deviceId,
        opKey,
        type: item.type,
        timestamp: new Date(item.timestamp),
        status,
        result,
      });

      results.push({
        opKey,
        type: item.type,
        status,
        message: appError.message,
        result,
      });
    }
  }

  const authoritativeStocks = touchedDrugIds.size
    ? await DrugModel.find({
        ...stockScope(scope),
        _id: { $in: [...touchedDrugIds].map((id) => new Types.ObjectId(id)) },
      }).select('_id name quantity lowStockThreshold expiryDate updatedAt')
    : [];

  return {
    processed: results.length,
    results,
    authoritativeStocks,
  };
};
