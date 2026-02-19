import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { SupplierModel } from '../models/supplier.model';

interface Scope {
  pharmacyId: string;
  branchId?: string;
}

interface CreateSupplierInput {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  outstandingPayments?: number;
  performanceScore?: number;
  purchaseHistory?: Array<{
    invoiceNo: string;
    amount: number;
    date: string;
    paid: boolean;
  }>;
}

const scopeFilter = (scope: Scope) => ({
  pharmacyId: new Types.ObjectId(scope.pharmacyId),
  ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
});

export const listSuppliers = async (scope: Scope) => {
  return SupplierModel.find(scopeFilter(scope)).sort({ createdAt: -1 });
};

export const createSupplier = async (scope: Scope, input: CreateSupplierInput) => {
  return SupplierModel.create({
    ...input,
    ...(input.purchaseHistory
      ? {
          purchaseHistory: input.purchaseHistory.map((p) => ({
            ...p,
            date: new Date(p.date),
          })),
        }
      : {}),
    pharmacyId: new Types.ObjectId(scope.pharmacyId),
    ...(scope.branchId ? { branchId: new Types.ObjectId(scope.branchId) } : {}),
  });
};

export const updateSupplier = async (scope: Scope, id: string, input: Partial<CreateSupplierInput>) => {
  const update: Record<string, unknown> = { ...input };

  if (input.purchaseHistory) {
    update.purchaseHistory = input.purchaseHistory.map((p) => ({
      ...p,
      date: new Date(p.date),
    }));
  }

  const supplier = await SupplierModel.findOneAndUpdate(
    {
      ...scopeFilter(scope),
      _id: new Types.ObjectId(id),
    },
    { $set: update },
    { new: true },
  );

  if (!supplier) {
    throw new AppError('Supplier not found', StatusCodes.NOT_FOUND);
  }

  return supplier;
};

export const deleteSupplier = async (scope: Scope, id: string) => {
  const supplier = await SupplierModel.findOneAndDelete({
    ...scopeFilter(scope),
    _id: new Types.ObjectId(id),
  });

  if (!supplier) {
    throw new AppError('Supplier not found', StatusCodes.NOT_FOUND);
  }
};
