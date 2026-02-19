import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { DrugModel } from '../models/drug.model';

interface DrugScope {
  pharmacyId: string;
  branchId?: string;
}

interface CreateDrugInput {
  name: string;
  category: string;
  batchNumber: string;
  expiryDate: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  supplierId?: string;
  supplierName?: string;
  lowStockThreshold: number;
}

interface UpdateDrugInput extends Partial<CreateDrugInput> {}

const scopeFilter = (scope: DrugScope) => {
  return {
    pharmacyId: new Types.ObjectId(scope.pharmacyId),
    ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
  };
};

export const listDrugs = async (scope: DrugScope) => {
  return DrugModel.find(scopeFilter(scope)).sort({ createdAt: -1 });
};

export const createDrug = async (scope: DrugScope, input: CreateDrugInput) => {
  if (input.quantity < 0) {
    throw new AppError('Quantity cannot be negative', StatusCodes.BAD_REQUEST);
  }

  return DrugModel.create({
    ...input,
    expiryDate: new Date(input.expiryDate),
    pharmacyId: new Types.ObjectId(scope.pharmacyId),
    ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
    ...(input.supplierId ? { supplierId: new Types.ObjectId(input.supplierId) } : {}),
  });
};

export const updateDrug = async (scope: DrugScope, drugId: string, input: UpdateDrugInput) => {
  if (typeof input.quantity === 'number' && input.quantity < 0) {
    throw new AppError('Quantity cannot be negative', StatusCodes.BAD_REQUEST);
  }

  const updatePayload: Record<string, unknown> = { ...input };
  if (input.expiryDate) updatePayload.expiryDate = new Date(input.expiryDate);
  if (input.supplierId) updatePayload.supplierId = new Types.ObjectId(input.supplierId);

  const drug = await DrugModel.findOneAndUpdate(
    {
      ...scopeFilter(scope),
      _id: new Types.ObjectId(drugId),
    },
    { $set: updatePayload },
    { new: true },
  );

  if (!drug) {
    throw new AppError('Drug not found', StatusCodes.NOT_FOUND);
  }

  return drug;
};

export const deleteDrug = async (scope: DrugScope, drugId: string) => {
  const deleted = await DrugModel.findOneAndDelete({
    ...scopeFilter(scope),
    _id: new Types.ObjectId(drugId),
  });

  if (!deleted) {
    throw new AppError('Drug not found', StatusCodes.NOT_FOUND);
  }
};

export const getLowStockReport = async (scope: DrugScope) => {
  return DrugModel.find({
    ...scopeFilter(scope),
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
  }).sort({ quantity: 1 });
};

export const getExpiringReport = async (scope: DrugScope, alertDays = 90) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() + alertDays * 24 * 60 * 60 * 1000);

  return DrugModel.find({
    ...scopeFilter(scope),
    expiryDate: { $lte: cutoff },
  }).sort({ expiryDate: 1 });
};

export const adjustStock = async (
  scope: DrugScope,
  drugId: Types.ObjectId,
  delta: number,
  session: mongoose.ClientSession,
) => {
  const drug = await DrugModel.findOne({
    ...scopeFilter(scope),
    _id: drugId,
  }).session(session);

  if (!drug) {
    throw new AppError('Drug not found in inventory', StatusCodes.NOT_FOUND);
  }

  const nextQty = drug.quantity + delta;
  if (nextQty < 0) {
    throw new AppError(`Insufficient stock for ${drug.name}`, StatusCodes.CONFLICT, {
      drugId: drug._id,
      currentQuantity: drug.quantity,
      requestedDelta: delta,
    });
  }

  drug.quantity = nextQty;
  await drug.save({ session });
  return drug;
};
